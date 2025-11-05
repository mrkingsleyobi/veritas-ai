import type { Client, Span } from '@sentry/core';
/**
 * Browser trace-lifecycle profiler (UI Profiling / Profiling V2):
 * - Starts when the first sampled root span starts
 * - Stops when the last sampled root span ends
 * - While running, periodically stops and restarts the JS self-profiling API to collect chunks
 *
 * Profiles are emitted as standalone `profile_chunk` envelopes either when:
 * - there are no more sampled root spans, or
 * - the 60s chunk timer elapses while profiling is running.
 */
export declare class BrowserTraceLifecycleProfiler {
    private _client;
    private _profiler;
    private _chunkTimer;
    private _activeRootSpanIds;
    private _rootSpanTimeouts;
    private _profilerId;
    private _isRunning;
    private _sessionSampled;
    constructor();
    /**
     * Initialize the profiler with client and session sampling decision computed by the integration.
     */
    initialize(client: Client, sessionSampled: boolean): void;
    /**
     * Handle an already-active root span at integration setup time.
     */
    notifyRootSpanActive(rootSpan: Span): void;
    /**
     * Start profiling if not already running.
     */
    start(): void;
    /**
     * Stop profiling; final chunk will be collected and sent.
     */
    stop(): void;
    /**
     * Resets profiling information from scope and resets running state
     */
    private _resetProfilerInfo;
    /**
     * Clear and reset all per-root-span timeouts.
     */
    private _clearAllRootSpanTimeouts;
    /**
     * Start a profiler instance if needed.
     */
    private _startProfilerInstance;
    /**
     * Schedule the next 60s chunk while running.
     * Each tick collects a chunk and restarts the profiler.
     * A chunk should be closed when there are no active root spans anymore OR when the maximum chunk interval is reached.
     */
    private _startPeriodicChunking;
    /**
     * Handle timeout for a specific root span ID to avoid indefinitely running profiler if `spanEnd` never fires.
     * If this was the last active root span, collect the current chunk and stop profiling.
     */
    private _onRootSpanTimeout;
    /**
     * Stop the current profiler, convert and send a profile chunk.
     */
    private _collectCurrentChunk;
    /**
     * Send a profile chunk as a standalone envelope.
     */
    private _sendProfileChunk;
}
//# sourceMappingURL=traceLifecycleProfiler.d.ts.map