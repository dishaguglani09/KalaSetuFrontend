import path from "node:path";
import fs from "node:fs";
import "dotenv/config";

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
  jwtSecret: process.env.JWT_SECRET || "kalasetu-artisan-studio-secret-jwt-key-2026-heritage",
  geminiApiKey: process.env.GEMINI_API_KEY,
  removeBgApiKey: process.env.REMOVE_BG_API_KEY,
  supabase: {
    url: process.env.SUPABASE_URL || "",
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_Hnwfz1VfGD6koO94DheHLA_DYgw3R53",
    secretKey: process.env.SUPABASE_SECRET_KEY || "sb_secret_aBp_SqDDu88RTgJYnRn2yw_sCLfNXHB",
  },
  uploadDir,
  dataDir,
  dbPath: path.resolve(dataDir, "kalasetu.db"),
};
