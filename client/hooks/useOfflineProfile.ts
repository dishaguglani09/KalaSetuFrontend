/**
 * useOfflineProfile
 * Local-first artisan profile hook. Profile is always readable offline
 * and persists across app restarts via IndexedDB.
 */

import { useCallback, useEffect, useState } from "react";
import {
  saveProfileLocally,
  loadProfileLocally,
} from "../lib/offline-db";
import { queueOperation } from "../lib/sync-engine";
import { api } from "../lib/api-client";
import { useNetworkStatus } from "../lib/network-status";

export function useOfflineProfile() {
  const { isOnline } = useNetworkStatus();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [profileStats, setProfileStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        if (isOnline) {
          try {
            const res = await api.profile.get();
            if (!cancelled) {
              setProfile(res.profile ?? res as any);
              setProfileStats(res.stats ?? null);
              await saveProfileLocally(res.profile ?? res as unknown as Record<string, unknown>);
            }
            return;
          } catch {
            // Fall through to local
          }
        }
        // Offline: serve from IndexedDB
        const local = await loadProfileLocally();
        if (!cancelled) setProfile(local);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isOnline]);

  const updateProfile = useCallback(
    async (updates: Record<string, unknown>): Promise<void> => {
      const merged = { ...(profile ?? {}), ...updates };
      // Write locally first
      await saveProfileLocally(merged);
      setProfile(merged);

      if (isOnline) {
        try {
          const res = await api.profile.update(updates);
          if (res.profile) {
            await saveProfileLocally(res.profile);
            setProfile(res.profile as unknown as Record<string, unknown>);
          }
          return;
        } catch {
          // Queue for later
        }
      }
      // Offline (or online but API failed): queue
      await queueOperation("updateProfile", "/profile", "PUT", updates);
    },
    [profile, isOnline]
  );

  return { profile, profileStats, loading, updateProfile };
}
