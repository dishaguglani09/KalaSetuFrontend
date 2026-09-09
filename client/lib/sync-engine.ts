/**
 * KalaSetu Sync Engine
 * Manages the operation queue and replays queued operations when
 * connectivity is restored. All writes to the backend go through here.
 */

import {
  getPendingOperations,
  updateOperationStatus,
  deleteOperation,
  enqueueOperation,
  getAllPendingImages,
  deletePendingImage,
  saveProductLocally,
  SyncOperation,
  SyncOpType,
} from "./offline-db";
import { API_BASE } from "./api-client";

const MAX_RETRIES = 3;

// Subscribers notified during/after sync
type SyncEventType = "start" | "progress" | "done" | "error";
type SyncListener = (event: SyncEventType, pendingCount: number) => void;
const _listeners = new Set<SyncListener>();

export function addSyncListener(fn: SyncListener): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

function emit(event: SyncEventType, pendingCount: number) {
  _listeners.forEach((fn) => fn(event, pendingCount));
}

// Active sync guard
let _syncing = false;

function getToken(): string | null {
  return localStorage.getItem("kalasetu_token") || sessionStorage.getItem("kalasetu_token");
}

async function executeOperation(op: SyncOperation): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Special case: image upload via FormData
  if (op.type === "uploadImage" && op.pendingImageKey) {
    return executeImageUpload(op, token);
  }

  try {
    const resp = await fetch(`${API_BASE}${op.endpoint}`, {
      method: op.method,
      headers,
      body: op.payload ? JSON.stringify(op.payload) : undefined,
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => String(resp.status));
      return { ok: false, error: errText };
    }
    const data = await resp.json().catch(() => ({}));
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

async function executeImageUpload(
  op: SyncOperation,
  token: string | null
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  if (!op.pendingImageKey) return { ok: false, error: "No pending image key" };

  const allImages = await getAllPendingImages();
  const img = allImages.find((i) => i.id === op.pendingImageKey);
  if (!img) return { ok: false, error: "Pending image not found in IndexedDB" };

  const blob = new Blob([img.data], { type: img.mimeType });
  const formData = new FormData();
  formData.append("image", blob, img.filename);
  if (op.payload?.draftId) formData.append("draftId", String(op.payload.draftId));

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const resp = await fetch(`${API_BASE}${op.endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => String(resp.status));
      return { ok: false, error: errText };
    }
    const data = await resp.json().catch(() => ({}));
    // Clean up the pending image blob from IndexedDB after success
    await deletePendingImage(img.id);
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Image upload failed" };
  }
}

/**
 * Drain the pending sync queue. Call this whenever connectivity is restored.
 */
export async function processSyncQueue(): Promise<void> {
  if (_syncing) return;
  _syncing = true;

  try {
    const ops = await getPendingOperations();
    if (ops.length === 0) {
      _syncing = false;
      return;
    }

    emit("start", ops.length);

    let remaining = ops.length;

    for (const op of ops) {
      const result = await executeOperation(op);

      if (result.ok) {
        await deleteOperation(op.id);
        remaining -= 1;
        emit("progress", remaining);

        // If this was a saveDraft and we got a product back, update local cache
        if (
          (op.type === "saveDraft" || op.type === "publishProduct") &&
          result.data &&
          typeof result.data === "object"
        ) {
          const res = result.data as any;
          if (res.product) {
            await saveProductLocally(res.product);
          }
        }
      } else {
        const nextRetries = op.retries + 1;
        if (nextRetries >= MAX_RETRIES) {
          await updateOperationStatus(op.id, "failed", {
            retries: nextRetries,
            lastAttemptAt: new Date().toISOString(),
            lastError: result.error,
          });
        } else {
          await updateOperationStatus(op.id, "pending", {
            retries: nextRetries,
            lastAttemptAt: new Date().toISOString(),
            lastError: result.error,
          });
        }
        emit("error", remaining);
      }
    }

    emit("done", remaining);
  } finally {
    _syncing = false;
  }
}

/**
 * Convenience: add a typed operation to the queue.
 */
export async function queueOperation(
  type: SyncOpType,
  endpoint: string,
  method: SyncOperation["method"],
  payload?: Record<string, unknown>,
  pendingImageKey?: string
): Promise<void> {
  const id = `op-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await enqueueOperation({ id, type, endpoint, method, payload, pendingImageKey });
}
