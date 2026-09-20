const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "/api";
export const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

/**
 * Resolves a media/upload URL so it works in both the web browser and the
 * Capacitor Android WebView.
 *
 * In the browser the SPA and Express share the same origin, so "/uploads/..."
 * is fine.  Inside the Android WebView the origin is "capacitor://localhost"
 * which has no Express server behind it, so we must prepend the explicit
 * backend origin that was baked into VITE_API_BASE_URL.
 */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  // Already absolute â€” nothing to do
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  if (API_BASE.startsWith("http://") || API_BASE.startsWith("https://")) {
    const origin = new URL(API_BASE).origin;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${origin}${cleanPath}`;
  }

  // Web: relative path works fine
  return path;
}

function getToken(): string | null {
  return localStorage.getItem("kalasetu_token") || sessionStorage.getItem("kalasetu_token");
}
export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem("kalasetu_token", token);
    sessionStorage.setItem("kalasetu-session", "active");
  } else {
    localStorage.removeItem("kalasetu_token");
    sessionStorage.removeItem("kalasetu-session");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMessage = `Request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      errMessage = errorJson.error || errorJson.message || errMessage;
    } catch {
      // fallback to generic message
    }
    throw new Error(errMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login(phoneOrEmail: string, password?: string) {
      return request<{ token: string; user: any; message: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone: phoneOrEmail, password }),
      });
    },
    register(data: { name: string; phone?: string; email?: string; password?: string; craft_tradition?: string; state?: string; city?: string }) {
      return request<{ token: string; user: any; message: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    getMe() {
      return request<{ user: any }>("/auth/me");
    },
    logout() {
      setToken(null);
      return request<{ message: string }>("/auth/logout", { method: "POST" });
    },
    async syncSupabase(user: any, password?: string) {
      const email = user?.email || "";
      const metadata = user?.user_metadata || {};
      const name = metadata.name || email.split("@")[0] || "Artisan";
      const craft_tradition = metadata.craft_tradition || "Heritage Craft";
      try {
        return await api.auth.login(email, password);
      } catch {
        return await api.auth.register({
          name,
          email,
          password: password || "artisan123",
          craft_tradition,
        });
      }
    },
  },

  products: {
    getAll(status?: string) {
      const q = status && status !== "ALL" ? `?status=${encodeURIComponent(status)}` : "";
      return request<{ products: any[]; count: number }>(`/products${q}`);
    },
    getStats() {
      return request<{
        totalProducts: number;
        publishedListings: number;
        draftsCount: number;
        pendingCount: number;
        monthlyViews: string;
        viewsChange: string;
        studioCompletion: string;
      }>("/products/stats");
    },
    getById(id: string) {
      return request<{ product: any }>(`/products/${id}`);
    },
    saveDraft(productData: any) {
      return request<{ product: any; message: string }>("/products/draft", {
        method: "POST",
        body: JSON.stringify(productData),
      });
    },
    approve(id: string) {
      return request<{ product: any; message: string }>(`/products/${id}/approve`, {
        method: "POST",
      });
    },
    publish(id: string, marketplaces: string[], productData?: any) {
      return request<{ product: any; listingId: string; marketplaceLinks: any[]; message: string }>(`/products/${id}/publish`, {
        method: "POST",
        body: JSON.stringify({ marketplaces, product: productData }),
      });
    },
    unpublish(id: string) {
      return request<{ product: any; message: string }>(`/products/${id}/unpublish`, {
        method: "POST",
      });
    },
    delete(id: string) {
      return request<{ message: string }>(`/products/${id}`, {
        method: "DELETE",
      });
    },
  },

  studio: {
    async uploadPhoto(fileOrBlob: Blob | File, draftId?: string) {
      const formData = new FormData();
      const filename = (fileOrBlob instanceof File && fileOrBlob.name) ? fileOrBlob.name : `product-photo-${Date.now()}.jpg`;
      formData.append("image", fileOrBlob, filename);
      if (draftId) formData.append("draftId", draftId);

      return request<{ imageUrl: string; imageId: string; message: string }>("/products/images/upload", {
        method: "POST",
        body: formData,
      });
    },
    async uploadBase64(imageBase64: string, draftId?: string) {
      return request<{ imageUrl: string; imageId: string; message: string }>("/products/images/upload", {
        method: "POST",
        body: JSON.stringify({ imageBase64, draftId }),
      });
    },
    enhanceImage(imageUrl: string, draftId?: string) {
      return request<{
        status: string;
        originalUrl: string;
        enhancedUrl: string;
        enhancementsApplied: string[];
        dimensions: { width: number; height: number };
      }>("/products/images/enhance", {
        method: "POST",
        body: JSON.stringify({ imageUrl, draftId }),
      });
    },
  },

  voice: {
    async transcribeAudio(
      audioBlob: Blob,
      languageHint: string = "hi",
      draftId?: string,
      directTranscript?: string,
      mimeType?: string
    ) {
      const formData = new FormData();
      const filename = mimeType?.includes("mp4")
        ? "recording.mp4"
        : mimeType?.includes("ogg")
        ? "recording.ogg"
        : mimeType?.includes("wav")
        ? "recording.wav"
        : "recording.webm";
      formData.append("audio", audioBlob, filename);
      formData.append("languageHint", languageHint);
      if (draftId) formData.append("draftId", draftId);
      if (directTranscript) formData.append("directTranscript", directTranscript);
      if (mimeType) formData.append("mimeType", mimeType);

      return request<{
        transcription: string;
        detectedLanguage: string;
        languageName: string;
        provider: string;
        message: string;
      }>("/voice/transcribe", {
        method: "POST",
        body: formData,
      });
    },
  },

  catalogue: {
    generate(params: {
      draftId?: string;
      transcription?: string;
      language?: string;
      imageUrl?: string;
      existingName?: string;
      existingCategory?: string;
      materials?: string;
      craftOrigin?: string;
      sellerState?: string;
      sellerCity?: string;
    }) {
      return request<{
        message: string;
        catalogue: {
          transcription: string;
          english_translation?: string;
          product_name: string;
          category: string;
          english_description: string;
          regional_description: string;
          language: string;
          materials: string[];
          craft_origin: string;
          state: string;
          city: string;
          traditional_technique: string;
          cultural_story: string;
          tags: string[];
          translations: {
            en: string;
            hi: string;
            pa: string;
            ta: string;
            te: string;
          };
        };
      }>("/catalogue/generate", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
    getHeritage() {
      return request<{ heritage: any[] }>("/catalogue/heritage");
    },
  },

  pricing: {
    calculate(params: {
      draftId?: string;
      materialCost?: number;
      labourHours?: number;
      hourlyRate?: number;
      complexity?: string;
      category?: string;
      craftTradition?: string;
      desiredMarginPercent?: number;
    }) {
      return request<{
        recommendedPrice: number;
        minSuggestedPrice: number;
        maxSuggestedPrice: number;
        confidenceScore: number;
        factors: Array<{ label: string; amount: string; percent: string }>;
        notice: string;
        explanation: string;
      }>("/pricing/calculate", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
  },

  similarity: {
    check(params: {
      draftId?: string;
      name?: string;
      category?: string;
      description?: string;
      craftTradition?: string;
    }) {
      return request<{
        similarityScore: number;
        status: string;
        similarityNotes: string;
        similarItems: Array<{ name: string; matchPercent: number; reason: string }>;
      }>("/similarity/check", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
  },

  insights: {
    get() {
      return request<any>("/insights");
    },
  },

  profile: {
    get() {
      return request<{ profile: any; stats: any }>("/profile");
    },
    update(updates: any) {
      return request<{ profile: any; message: string }>("/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
  },
};

