import { z } from 'zod';

/* ── Server-side variables (never sent to browser) ───────────────────────── */
const server = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // API_BASE_URL: z.string().url(),
  // RAZORPAY_KEY_SECRET: z.string().min(1),
  // NEXTAUTH_SECRET: z.string().min(32),
  // NEXTAUTH_URL: z.string().url(),
});

/* ── Client-side variables (NEXT_PUBLIC_ prefix, bundled) ────────────────── */
const client = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Kalakriti'),
  // NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  // NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
});

/* ── Validate and export ─────────────────────────────────────────────────── */
const _server = server.safeParse(process.env);
const _client = client.safeParse(process.env);

if (!_server.success) {
  console.error('❌  Invalid server environment variables:\n', _server.error.flatten().fieldErrors);
  throw new Error('Invalid server environment variables');
}

if (!_client.success) {
  console.error('❌  Invalid client environment variables:\n', _client.error.flatten().fieldErrors);
  throw new Error('Invalid client environment variables');
}

export const env = {
  ..._server.data,
  ..._client.data,
} as const;
