import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read from Vite environment
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(envUrl && envUrl.trim().length > 0 && !envUrl.includes("your-project") && envKey && envKey.trim().length > 0);
};

// Safe project URL fallback (to prevent createClient throwing on empty URL during initial dev setup)
const resolvedUrl = envUrl.trim().length > 0 ? envUrl.trim() : "https://placeholder-project.supabase.co";
const resolvedKey = envKey.trim().length > 0 ? envKey.trim() : "placeholder-key";

export const supabase: SupabaseClient = createClient(resolvedUrl, resolvedKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: "kalasetu-supabase-auth",
    flowType: "implicit",
  },
});
