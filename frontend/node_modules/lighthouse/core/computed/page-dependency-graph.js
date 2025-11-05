/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {makeComputedArtifact} from './computed-artifact.js';
import {PageDependencyGraph as LanternPageDependencyGraph} from '../lib/lantern/page-dependency-graph.js';
import {NetworkRequest} from '../lib/network-request.js';
import {ProcessedTrace} from './processed-trace.js';
import {NetworkRecords} from './network-records.js';
import {DocumentUrls} from './document-urls.js';

/** @typedef {import('../lib/lantern/base-node.js').Node<LH.Artifacts.NetworkRequest>} Node */

class PageDependencyGraph {
  /**
   * @param {{trace: LH.Trace, devtoolsLog: LH.DevtoolsLog, URL: LH.Artifacts['URL']}} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<Node>}
   */
  static async compute_(data, context) {
    const {trace, devtoolsLog} = data;
    const [processedTrace, networkRecords] = await Promise.all([
      ProcessedTrace.request(trace, context),
      NetworkRecords.request(devtoolsLog, context),
    ]);

    // COMPAT: Backport for pre-10.0 clients that don't pass the URL artifact here (e.g. pubads).
    // Calculates the URL artifact from the processed trace and DT log.
    const URL = data.URL || await DocumentUrls.request(data, context);

    const lanternRequests = networkRecords.map(NetworkRequest.asLanternNetworkRequest);
    return LanternPageDependencyGraph.createGraph(processedTrace, lanternRequests, URL);
  }
}

const PageDependencyGraphComputed =
  makeComputedArtifact(PageDependencyGraph, ['devtoolsLog', 'trace', 'URL']);
export {PageDependencyGraphComputed as PageDependencyGraph};
