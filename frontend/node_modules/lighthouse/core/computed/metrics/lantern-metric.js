/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Metric} from '../../lib/lantern/metric.js';
import {LoadSimulator} from '../load-simulator.js';
import {PageDependencyGraph} from '../page-dependency-graph.js';
import {ProcessedNavigation} from '../processed-navigation.js';

/** @typedef {import('../../lib/lantern/metric.js').Extras} Extras */

class LanternMetric extends Metric {
  /**
   * @param {LH.Artifacts.MetricComputationDataInput} data
   * @param {LH.Artifacts.ComputedContext} context
   * @param {Omit<Extras, 'optimistic'>=} extras
   * @return {Promise<LH.Artifacts.LanternMetric>}
   */
  static async computeMetricWithGraphs(data, context, extras) {
    // TODO: remove this fallback when lighthouse-pub-ads plugin can update.
    const gatherContext = data.gatherContext || {gatherMode: 'navigation'};
    if (gatherContext.gatherMode !== 'navigation') {
      throw new Error(`Lantern metrics can only be computed on navigations`);
    }

    const graph = await PageDependencyGraph.request(data, context);
    const processedNavigation = await ProcessedNavigation.request(data.trace, context);
    const simulator = data.simulator || (await LoadSimulator.request(data, context));

    return this.compute({simulator, graph, processedNavigation}, extras);
  }

  /**
   * @param {LH.Artifacts.MetricComputationDataInput} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<LH.Artifacts.LanternMetric>}
   */
  static async compute_(data, context) {
    return this.computeMetricWithGraphs(data, context);
  }
}

export {LanternMetric};
