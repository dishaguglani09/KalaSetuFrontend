/**
 * OfflineSyncBanner
 * A non-intrusive status pill that appears only when there is something to
 * communicate: working offline, syncing, or a brief "synced" confirmation.
 * When the app is online and fully synced, this component renders nothing.
 */

import React, { useEffect, useRef, useState } from "react";
import { useNetworkStatus } from "../lib/network-status";
import { addSyncListener } from "../lib/sync-engine";
import { getPendingCount } from "../lib/offline-db";

type BannerState = "offline" | "syncing" | "synced" | "hidden";

export function OfflineSyncBanner() {
  const { isOnline } = useNetworkStatus();
  const [bannerState, setBannerState] = useState<BannerState>("hidden");
  const [pendingCount, setPendingCount] = useState(0);
  const syncedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read pending count on mount and when going online
  useEffect(() => {
    getPendingCount().then(setPendingCount);
  }, [isOnline]);

  // React to network changes
  useEffect(() => {
    if (!isOnline) {
      setBannerState("offline");
      if (syncedTimerRef.current) clearTimeout(syncedTimerRef.current);
    } else {
      // Back online — will show synced/syncing via sync listener
      getPendingCount().then((count) => {
        if (count === 0) {
          setBannerState("hidden");
        }
        // if count > 0 the sync engine will fire events
      });
    }
  }, [isOnline]);

  // Listen to sync engine events
  useEffect(() => {
    const unsub = addSyncListener((event, count) => {
      setPendingCount(count);
      if (event === "start" || event === "progress") {
        setBannerState("syncing");
        if (syncedTimerRef.current) clearTimeout(syncedTimerRef.current);
      } else if (event === "done") {
        setBannerState("synced");
        syncedTimerRef.current = setTimeout(() => {
          setBannerState("hidden");
        }, 2800);
      } else if (event === "error") {
        // Keep showing remaining count if still pending
        if (count > 0) setBannerState("syncing");
      }
    });
    return () => {
      unsub();
      if (syncedTimerRef.current) clearTimeout(syncedTimerRef.current);
    };
  }, []);

  if (bannerState === "hidden") return null;

  const content = {
    offline: {
      bg: "bg-amber-50 border-amber-200",
      dot: "bg-amber-500",
      text: "text-amber-800",
      label: `Working offline${pendingCount > 0 ? ` \u00b7 ${pendingCount} change${pendingCount !== 1 ? "s" : ""} queued` : ""} \u00b7 changes will sync when you\u2019re back online`,
    },
    syncing: {
      bg: "bg-blue-50 border-blue-200",
      dot: "bg-blue-500 animate-pulse",
      text: "text-blue-800",
      label: `Syncing${pendingCount > 0 ? ` ${pendingCount} operation${pendingCount !== 1 ? "s" : ""}` : ""}\u2026`,
    },
    synced: {
      bg: "bg-green-50 border-green-200",
      dot: "bg-green-500",
      text: "text-green-800",
      label: "All changes synced \u2714",
    },
  }[bannerState] ?? null;

  if (!content) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${content.bg} ${content.text}`}
      role="status"
      aria-live="polite"
    >
      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${content.dot}`} />
      {content.label}
    </div>
  );
}
