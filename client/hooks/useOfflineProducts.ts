/**
 * useOfflineProducts
 * Local-first product hook. Reads from IndexedDB first, falls back to
 * backend when online. All writes go to IndexedDB immediately and are
 * queued for backend sync.
 */

import { useCallback, useEffect, useState } from "react";
import {
  loadAllProductsLocally,
  saveProductLocally,
  saveProductsLocally,
  loadProductLocally,
} from "../lib/offline-db";
import { queueOperation } from "../lib/sync-engine";
import { api } from "../lib/api-client";
import { useNetworkStatus } from "../lib/network-status";

export function useOfflineProducts() {
  const { isOnline } = useNetworkStatus();
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (isOnline) {
        try {
          const [pr, st] = await Promise.all([
            api.products.getAll(),
            api.products.getStats(),
          ]);
          // Cache results locally
          await saveProductsLocally(pr.products);
          setProducts(pr.products);
          setStats(st);
          return;
        } catch {
          // Fall through to local
        }
      }
      // Offline: serve from IndexedDB
      const local = await loadAllProductsLocally();
      // Sort by created_at desc to match server order
      local.sort((a, b) =>
        String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
      );
      setProducts(local);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Save a product draft locally and enqueue backend sync.
   */
  const saveDraftOfflineFirst = useCallback(
    async (draftData: Record<string, unknown>): Promise<Record<string, unknown>> => {
      // Write locally first — never fails
      await saveProductLocally({ ...draftData, _offlineSaved: true, updated_at: new Date().toISOString() });

      // Update state
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === draftData.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...draftData };
          return next;
        }
        return [draftData, ...prev];
      });

      if (isOnline) {
        // Online: call backend directly, update local cache on success
        try {
          const res = await api.products.saveDraft(draftData);
          if (res.product) await saveProductLocally(res.product);
          return res.product ?? draftData;
        } catch {
          // Fallback: queue for later
          await queueOperation("saveDraft", "/products/draft", "POST", draftData as Record<string, unknown>);
        }
      } else {
        // Offline: queue for later
        await queueOperation("saveDraft", "/products/draft", "POST", draftData as Record<string, unknown>);
      }

      return draftData;
    },
    [isOnline]
  );

  return { products, stats, loading, refresh, saveDraftOfflineFirst };
}
