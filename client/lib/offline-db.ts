/**
 * KalaSetu Offline Database
 * IndexedDB schema and helpers via the `idb` library.
 *
 * Object Stores:
 *  profile        - artisan profile (single keyed record, key = "me")
 *  products       - all product records for the current seller
 *  pendingImages  - image blobs waiting for upload when online
 *  syncQueue      - ordered queue of operations to replay when online
 *  cachedInsights - market insights data (stale-while-revalidate)
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

// Types

export type SyncOpType =
  | "saveDraft"
  | "publishProduct"
  | "uploadImage"
  | "enhanceImage"
  | "updateProfile"
  | "transcribeVoice"
  | "generateCatalogue"
  | "checkSimilarity";

export interface SyncOperation {
  id: string;
  type: SyncOpType;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  payload?: Record<string, unknown>;
  pendingImageKey?: string;
  status: "pending" | "done" | "failed";
  retries: number;
  createdAt: number;
  lastAttemptAt?: string;
  lastError?: string;
}

export interface PendingImage {
  id: string;
  draftId?: string;
  sellerId?: string;
  data: ArrayBuffer;
  mimeType: string;
  filename: string;
  createdAt: number;
}

export interface CachedInsights {
  key: string;
  data: unknown;
  fetchedAt: number;
}

// Schema

interface KalaSetuDB extends DBSchema {
  profile: {
    key: string;
    value: Record<string, unknown>;
  };
  products: {
    key: string;
    value: Record<string, unknown>;
    indexes: { "by-status": string };
  };
  pendingImages: {
    key: string;
    value: PendingImage;
    indexes: { "by-draftId": string };
  };
  syncQueue: {
    key: string;
    value: SyncOperation;
    indexes: { "by-status": string; "by-createdAt": number };
  };
  cachedInsights: {
    key: string;
    value: CachedInsights;
  };
}

// DB singleton

let _db: IDBPDatabase<KalaSetuDB> | null = null;

export async function getOfflineDb(): Promise<IDBPDatabase<KalaSetuDB>> {
  if (_db) return _db;
  _db = await openDB<KalaSetuDB>("kalasetu-offline", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("profile")) {
        db.createObjectStore("profile");
      }
      if (!db.objectStoreNames.contains("products")) {
        const ps = db.createObjectStore("products", { keyPath: "id" });
        ps.createIndex("by-status", "status");
      }
      if (!db.objectStoreNames.contains("pendingImages")) {
        const pi = db.createObjectStore("pendingImages", { keyPath: "id" });
        pi.createIndex("by-draftId", "draftId");
      }
      if (!db.objectStoreNames.contains("syncQueue")) {
        const sq = db.createObjectStore("syncQueue", { keyPath: "id" });
        sq.createIndex("by-status", "status");
        sq.createIndex("by-createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains("cachedInsights")) {
        db.createObjectStore("cachedInsights", { keyPath: "key" });
      }
    },
  });
  return _db;
}

// Profile helpers

export async function saveProfileLocally(profile: Record<string, unknown>): Promise<void> {
  const db = await getOfflineDb();
  await db.put("profile", profile, "me");
}

export async function loadProfileLocally(): Promise<Record<string, unknown> | null> {
  const db = await getOfflineDb();
  const result = await db.get("profile", "me");
  return result ?? null;
}

// Product helpers

export async function saveProductLocally(product: Record<string, unknown>): Promise<void> {
  const db = await getOfflineDb();
  await db.put("products", product);
}

export async function saveProductsLocally(products: Record<string, unknown>[]): Promise<void> {
  const db = await getOfflineDb();
  const tx = db.transaction("products", "readwrite");
  await Promise.all([
    ...products.map((p) => tx.store.put(p)),
    tx.done,
  ]);
}

export async function loadAllProductsLocally(): Promise<Record<string, unknown>[]> {
  const db = await getOfflineDb();
  return db.getAll("products");
}

export async function loadProductLocally(id: string): Promise<Record<string, unknown> | null> {
  const db = await getOfflineDb();
  const result = await db.get("products", id);
  return result ?? null;
}

export async function deleteProductLocally(id: string): Promise<void> {
  const db = await getOfflineDb();
  await db.delete("products", id);
}

// Pending image helpers

export async function savePendingImage(image: PendingImage): Promise<void> {
  const db = await getOfflineDb();
  await db.put("pendingImages", image);
}

export async function getAllPendingImages(): Promise<PendingImage[]> {
  const db = await getOfflineDb();
  return db.getAll("pendingImages");
}

export async function deletePendingImage(id: string): Promise<void> {
  const db = await getOfflineDb();
  await db.delete("pendingImages", id);
}

// Sync queue helpers

export async function enqueueOperation(
  op: Omit<SyncOperation, "status" | "retries" | "createdAt">
): Promise<SyncOperation> {
  const db = await getOfflineDb();
  const full: SyncOperation = {
    ...op,
    status: "pending",
    retries: 0,
    createdAt: Date.now(),
  };
  await db.put("syncQueue", full);
  return full;
}

export async function getPendingOperations(): Promise<SyncOperation[]> {
  const db = await getOfflineDb();
  const all = await db.getAllFromIndex("syncQueue", "by-status", "pending");
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getPendingCount(): Promise<number> {
  const ops = await getPendingOperations();
  return ops.length;
}

export async function updateOperationStatus(
  id: string,
  status: SyncOperation["status"],
  extra?: Partial<SyncOperation>
): Promise<void> {
  const db = await getOfflineDb();
  const existing = await db.get("syncQueue", id);
  if (!existing) return;
  await db.put("syncQueue", { ...existing, ...extra, status });
}

export async function deleteOperation(id: string): Promise<void> {
  const db = await getOfflineDb();
  await db.delete("syncQueue", id);
}

// Cached insights helpers

export async function saveCachedInsights(key: string, data: unknown): Promise<void> {
  const db = await getOfflineDb();
  await db.put("cachedInsights", { key, data, fetchedAt: Date.now() });
}

export async function loadCachedInsights(
  key: string
): Promise<{ data: unknown; fetchedAt: number } | null> {
  const db = await getOfflineDb();
  const result = await db.get("cachedInsights", key);
  if (!result) return null;
  return { data: result.data, fetchedAt: result.fetchedAt };
}
