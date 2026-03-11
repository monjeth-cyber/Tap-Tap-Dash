import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook that runs a game loop using requestAnimationFrame for minimal input latency.
 *
 * @param {(dt: number) => void} callback - Called every frame with delta time (seconds)
 * @param {boolean} running - Whether the loop is active
 */
export default function useGameLoop(callback, running) {
  const callbackRef = useRef(callback);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Keep callback ref up to date without restarting loop
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const loop = useCallback((timestamp) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1); // cap at 100ms
    lastTimeRef.current = timestamp;
    callbackRef.current(dt);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(() => {
    if (rafRef.current) return;
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (running) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [running, start, stop]);

  return { start, stop };
}
