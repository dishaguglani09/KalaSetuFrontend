import path from "node:path";
import fs from "node:fs";
// Always force .env values to win — override any previously set process.env (e.g. from Vite's own env loading)
import dotenv from "dotenv";
dotenv.config({ override: true });


const rootDir = process.cwd();
const uploadDir = path.resolve(rootDir, process.env.UPLOAD_DIR || "uploads");
const dataDir = path.resolve(rootDir, "data");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
export const config = {
  port: Number(process.env.PORT || 8080),
  jwtSecret: process.env.JWT_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
  removeBgApiKey: process.env.REMOVE_BG_API_KEY,
  sarvamApiKey: process.env.SARVAM_API_KEY || "",
  supabase: {
    url: process.env.SUPABASE_URL || "",
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_Hnwfz1VfGD6koO94DheHLA_DYgw3R53",
    secretKey: process.env.SUPABASE_SECRET_KEY || "sb_secret_aBp_SqDDu88RTgJYnRn2yw_sCLfNXHB",
  },
  uploadDir,
  dataDir,
  dbPath: path.resolve(dataDir, "kalasetu.db"),
};

// Safe startup diagnostics — never logs the actual key value
const _k = config.geminiApiKey;
console.log(`[config] GEMINI_API_KEY: ${_k ? `present (${_k.length} chars, starts "${_k.slice(0, 4)}")` : "MISSING ❌"}`);
const _r = config.removeBgApiKey;
console.log(`[config] REMOVE_BG_API_KEY: ${_r ? `present (${_r.length} chars, starts "${_r.slice(0, 4)}")` : "MISSING ❌"}`);
const _s = config.sarvamApiKey;
console.log(`[config] SARVAM_API_KEY: ${_s ? `present (${_s.length} chars)` : "MISSING ❌"}`);

