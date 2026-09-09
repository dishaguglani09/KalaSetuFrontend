/**
 * KalaSetu Network Status Hook
 * Combines navigator.onLine, window online/offline events,
 * and a lightweight /api/ping probe to detect real connectivity.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { API_BASE } from "./api-client";
import { processSyncQueue } from "./sync-engine";

export interface NetworkStatus {
  /** True when we have confirmed connectivity to the backend */
  isOnline: boolean;
  /** True during the short window while we are actively probing */
  isChecking: boolean;
}

const PROBE_URL = `${API_BASE}/ping`;
const PROBE_TIMEOUT_MS = 5000;
const POLL_INTERVAL_MS = 15000;

async function probeConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    const resp = await fetch(PROBE_URL, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timerId);
    return resp.ok;
  } catch {
    return false;
  }
}

/**
 * Singleton subscribers so all hook instances share one polling loop.
 */
let _isOnline = navigator.onLine;
const _listeners = new Set<(online: boolean) => void>();

function notifyAll(online: boolean) {
  _isOnline = online;
  _listeners.forEach((fn) => fn(online));
  if (online) {
    processSyncQueue().catch(() => {});
  }
}

// Set up one global event listener + polling loop
let _pollingStarted = false;
function ensurePolling() {
  if (_pollingStarted) return;
  _pollingStarted = true;

  window.addEventListener("online", async () => {
    const ok = await probeConnectivity();
    notifyAll(ok);
  });

  window.addEventListener("offline", () => {
    notifyAll(false);
  });

  // Periodic probe to catch captive portals / flaky connections
  setInterval(async () => {
    if (!navigator.onLine) {
      notifyAll(false);
      return;
    }
    const ok = await probeConnectivity();
    notifyAll(ok);
  }, POLL_INTERVAL_MS);

  // Initial probe
  probeConnectivity().then(notifyAll);
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(_isOnline);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    ensurePolling();

    const handler = (online: boolean) => {
      setIsOnline(online);
    };
    _listeners.add(handler);

    return () => {
      _listeners.delete(handler);
    };
  }, []);

  return { isOnline, isChecking };
}

/** Non-hook utility for use inside sync engine */
export function getIsOnline(): boolean {
  return _isOnline;
}
