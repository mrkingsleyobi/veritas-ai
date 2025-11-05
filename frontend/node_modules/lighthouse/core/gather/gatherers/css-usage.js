/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tracks unused CSS rules.
 */

import log from 'lighthouse-logger';

import BaseGatherer from '../base-gatherer.js';
import {Sentry} from '../../lib/sentry.js';

class CSSUsage extends BaseGatherer {
  constructor() {
    super();
    /** @type {LH.Gatherer.ProtocolSession|undefined} */
    this._session = undefined;
    /** @type {Map<string, Promise<LH.Artifacts.CSSStyleSheetInfo|Error>>} */
    this._sheetPromises = new Map();
    /**
     * Initialize as undefined so we can assert results are fetched.
     * @type {LH.Crdp.CSS.RuleUsage[]|undefined}
     */
    this._ruleUsage = undefined;
    this._onStylesheetAdded = this._onStylesheetAdded.bind(this);
  }

  /** @type {LH.Gatherer.GathererMeta} */
  meta = {
    supportedModes: ['snapshot', 'timespan', 'navigation'],
  };

  /**
   * @param {LH.Crdp.CSS.StyleSheetAddedEvent} event
   */
  _onStylesheetAdded(event) {
    if (!this._session) throw new Error('Session not initialized');
    const styleSheetId = event.header.styleSheetId;
    const sheetPromise = this._session.sendCommand('CSS.getStyleSheetText', {styleSheetId})
      .then(content => ({
        header: event.header,
        content: content.text,
      }))
      .catch(/** @param {Error} err */ (err) => {
        log.warn(
          'CSSUsage',
          `Error fetching content of stylesheet with URL "${event.header.sourceURL}"`
        );
        Sentry.captureException(err, {
          tags: {
            gatherer: 'CSSUsage',
          },
          extra: {
            url: event.header.sourceURL,
          },
          level: 'error',
        });
        return err;
      });
    this._sheetPromises.set(styleSheetId, sheetPromise);
  }

  /**
   * @param {LH.Gatherer.Context} context
   */
  async startInstrumentation(context) {
    const session = context.driver.defaultSession;
    this._session = session;

    // Calling `CSS.enable` will emit events for stylesheets currently on the page.
    // We want to ignore these events in navigation mode because they are not relevant to the
    // navigation that is about to happen. Adding the event listener *after* calling `CSS.enable`
    // ensures that the events for pre-existing stylesheets are ignored.
    const isNavigation = context.gatherMode === 'navigation';
    if (!isNavigation) {
      session.on('CSS.styleSheetAdded', this._onStylesheetAdded);
    }

    await session.sendCommand('DOM.enable');
    await session.sendCommand('CSS.enable');
    await session.sendCommand('CSS.startRuleUsageTracking');

    if (isNavigation) {
      session.on('CSS.styleSheetAdded', this._onStylesheetAdded);
    }
  }


  /**
   * @param {LH.Gatherer.Context} context
   */
  async stopInstrumentation(context) {
    const session = context.driver.defaultSession;
    const coverageResponse = await session.sendCommand('CSS.stopRuleUsageTracking');
    this._ruleUsage = coverageResponse.ruleUsage;
    session.off('CSS.styleSheetAdded', this._onStylesheetAdded);

    // Ensure we finish fetching all stylesheet contents before disabling the CSS domain
    await Promise.all(this._sheetPromises.values());

    await session.sendCommand('CSS.disable');
    await session.sendCommand('DOM.disable');
  }

  /**
   * @param {LH.Gatherer.Context} context
   * @return {Promise<LH.Artifacts['CSSUsage']>}
   */
  async getArtifact(context) {
    const executionContext = context.driver.executionContext;

    if (context.gatherMode === 'snapshot') {
      await this.startInstrumentation(context);

      // Force style to recompute.
      // Doesn't appear to be necessary in newer versions of Chrome.
      await executionContext.evaluateAsync('getComputedStyle(document.body)');

      await this.stopInstrumentation(context);
    }

    /** @type {Map<string, LH.Artifacts.CSSStyleSheetInfo>} */
    const dedupedStylesheets = new Map();
    const sheets = await Promise.all(this._sheetPromises.values());

    for (const sheet of sheets) {
      // Erroneous sheets will be reported via sentry and the log.
      // We can ignore them here without throwing a fatal error.
      if (sheet instanceof Error) {
        continue;
      }

      // Exclude empty stylesheets.
      if (sheet.header.length === 0) {
        continue;
      }

      dedupedStylesheets.set(sheet.content, sheet);
    }

    if (!this._ruleUsage) throw new Error('Issue collecting rule usages');

    return {
      rules: this._ruleUsage,
      stylesheets: Array.from(dedupedStylesheets.values()),
    };
  }
}

export default CSSUsage;
