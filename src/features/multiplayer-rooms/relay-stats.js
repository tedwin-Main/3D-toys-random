// Measures relay-side latency and load on the live server: event-loop delay, handler time, CPU and frame rates per window.

import { monitorEventLoopDelay } from 'node:perf_hooks';

const WINDOW_MS = 10000;
const LOOP_RESOLUTION_MS = 10;
// histogram samples = timer interval (resolution) + lateness; report the lateness only
const lateMs = (ns) => Math.max(0, Math.round(ns / 1e4) / 100 - LOOP_RESOLUTION_MS);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * Relay > stats: wrap message handling with timed(), count frames out with sent();
 * latest() = last full window (what a load test reads while it runs).
 */
export function createRelayStats() {
  const loop = monitorEventLoopDelay({ resolution: LOOP_RESOLUTION_MS });
  loop.enable();
  let win = fresh(), latest = null;
  setInterval(close, WINDOW_MS).unref();

  function fresh() {
    return { t0: performance.now(), cpu0: process.cpuUsage(), framesIn: 0, framesOut: 0, handlerMs: 0, handlerMax: 0 };
  }

  function close() {
    const secs = (performance.now() - win.t0) / 1000, cpu = process.cpuUsage(win.cpu0);
    latest = {
      windowS: round2(secs),
      loopDelayMs: { p50: round2(lateMs(loop.percentile(50))), p99: round2(lateMs(loop.percentile(99))), max: round2(lateMs(loop.max)) },
      handlerMsPerS: round2(win.handlerMs / secs), handlerMaxMs: round2(win.handlerMax),
      cpuMsPerS: round2((cpu.user + cpu.system) / 1000 / secs),
      framesInPerS: Math.round(win.framesIn / secs), framesOutPerS: Math.round(win.framesOut / secs),
    };
    loop.reset();
    win = fresh();
  }

  return {
    timed(fn) {
      const t = performance.now();
      fn();
      const took = performance.now() - t;
      win.framesIn++; win.handlerMs += took;
      if (took > win.handlerMax) win.handlerMax = took;
    },
    sent() { win.framesOut++; },
    latest: () => latest,
  };
}
