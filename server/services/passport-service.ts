import { passportRepository, PassportRow, productRepository, userRepository } from "../db/repository";
import { config } from "../config";

const STATE_CODES: Record<string, string> = {
  "Rajasthan": "RJ", "Punjab": "PB", "Bihar": "BR", "West Bengal": "WB",
  "Uttar Pradesh": "UP", "Madhya Pradesh": "MP", "Gujarat": "GJ",
  "Odisha": "OD", "Chhattisgarh": "CG", "Andhra Pradesh": "AP",
  "Telangana": "TS", "Tamil Nadu": "TN", "Karnataka": "KA",
  "Kerala": "KL", "Assam": "AS", "Manipur": "MN", "Nagaland": "NL",
  "Jammu and Kashmir": "JK", "Himachal Pradesh": "HP", "Uttarakhand": "UK",
};

function generatePassportId(state: string | null): string {
  const stateCode = (state && STATE_CODES[state]) ? STATE_CODES[state] : "IN";
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const seqPart = Math.floor(Math.random() * 900 + 100).toString();
  return `KCP-${stateCode}-${dateStr}-${seqPart}`;
}

function parseMaterials(json: string): string[] {
  try { return JSON.parse(json || "[]"); } catch { return []; }
}

function buildReadbackPrompt(p: PassportRow): string {
  const materials = parseMaterials(p.materials_json);
  return (
    "You are helping a rural Indian artisan validate the digital passport story of their craft.\n" +
    "Write a warm, conversational readback script in 4-5 sentences that summarises the following craft passport in simple, everyday English.\n" +
    "The artisan will listen to this and confirm it matches their craft.\n\n" +
    `Craft name: ${p.craft_name}\n` +
    `Origin: ${p.origin_city || p.origin_region || p.origin_state || "India"}\n` +
    `Tradition: ${p.craft_tradition || "traditional Indian craft"}\n` +
    `Technique: ${p.technique || "handmade technique"}\n` +
    `Materials: ${materials.join(", ") || "natural materials"}\n` +
    `Artisan story: ${p.artisan_story_translated || ""}\n\n` +
    "Rules:\n- Do NOT mention QR codes.\n- Do NOT invent new cultural claims.\n" +
    "- Keep the language simple and warm.\n- End with: \"Does this sound right to you?\"\n\n" +
    "Output ONLY the readback script text, nothing else."
  );
}

async function generateReadbackScriptGemini(passport: PassportRow): Promise<string | null> {
  if (!config.geminiApiKey) return null;
  const modelsToTry = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];
  const prompt = buildReadbackPrompt(passport);
  for (const model of modelsToTry) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 600 } }),
        }
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text && text.length > 40) return text;
    } catch { /* try next */ }
  }
  return null;
}

async function generateReadbackScriptGroq(passport: PassportRow): Promise<string | null> {
  const groqKey = (config as any).groqApiKey;
  if (!groqKey) return null;
  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({ model: "llama3-70b-8192", messages: [{ role: "user", content: buildReadbackPrompt(passport) }], temperature: 0.4, max_tokens: 600 }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch { return null; }
}

async function generateReadbackScript(passport: PassportRow): Promise<string> {
  const ai = await generateReadbackScriptGemini(passport) ?? await generateReadbackScriptGroq(passport);
  if (ai) return ai;
  const materials = parseMaterials(passport.materials_json);
  return (
    `This is the craft passport for "${passport.craft_name}", a ${passport.craft_tradition ?? "traditional craft"} from ${passport.origin_region ?? passport.origin_state ?? "India"}. ` +
    `It is made using the ${passport.technique ?? "handmade"} technique with ${materials.join(", ") || "traditional materials"}. ` +
    (passport.artisan_story_translated ? `The artisan shared: "${passport.artisan_story_translated.slice(0, 120)}..." ` : "") +
    "Does this sound right to you?"
  );
}

export const passportService = {
  async getOrCreatePassport(productId: string): Promise<PassportRow | null> {
    const existing = passportRepository.findByProductId(productId);
    if (existing) return existing;
    const product = productRepository.findById(productId);
    if (!product) return null;
    const seller = userRepository.findById(product.seller_id);
    const materials = parseMaterials(product.materials_json);
    const id = `pp-${productId}-${Date.now()}`;
    const passport_id = generatePassportId(product.state || null);
    const newPassport: Omit<PassportRow, "created_at" | "updated_at"> = {
      id, passport_id, product_id: productId, seller_id: product.seller_id,
      craft_name: product.name,
      image_url: product.enhanced_image_url || product.image_url || null,
      description: product.description || null,
      speciality: product.cultural_story || null,
      craft_tradition: product.craft_tradition || seller?.craft_tradition || null,
      technique: product.technique || null,
      origin_state: product.state || seller?.state || null,
      origin_city: product.city || seller?.city || null,
      origin_region: [product.city, product.state].filter(Boolean).join(", ") || null,
      materials_json: JSON.stringify(materials),
      artisan_name: seller?.name || null, artisan_id: product.seller_id,
      artisan_story_original: null, artisan_story_original_lang: "hi",
      artisan_story_translated: product.cultural_story || null,
      time_taken: null, verification_status: "PENDING", verified_at: null,
    };
    return passportRepository.upsert(newPassport);
  },

  async saveArtisanStory(productId: string, storyOriginal: string, lang: string, storyTranslated?: string): Promise<PassportRow | null> {
    const passport = passportRepository.findByProductId(productId);
    if (!passport) return null;
    return passportRepository.upsert({ ...passport, artisan_story_original: storyOriginal, artisan_story_original_lang: lang, artisan_story_translated: storyTranslated || storyOriginal });
  },

  async getReadbackScript(productId: string): Promise<{ script: string; passportId: string } | null> {
    const passport = passportRepository.findByProductId(productId);
    if (!passport) return null;
    const script = await generateReadbackScript(passport);
    return { script, passportId: passport.passport_id };
  },

  verifyPassport(productId: string): PassportRow | null {
    return passportRepository.verify(productId);
  },

  getSellerPassports(sellerId: string): PassportRow[] {
    return passportRepository.findBySellerId(sellerId);
  },

  getByPassportId(passportId: string): PassportRow | null {
    return passportRepository.findByPassportId(passportId);
  },

  serialize(row: PassportRow) {
    const materials = parseMaterials(row.materials_json);
    return {
      id: row.id, passportId: row.passport_id, productId: row.product_id,
      craftName: row.craft_name, imageUrl: row.image_url, description: row.description,
      speciality: row.speciality, craftTradition: row.craft_tradition, technique: row.technique,
      originState: row.origin_state, originCity: row.origin_city, originRegion: row.origin_region,
      materials, artisanName: row.artisan_name, artisanId: row.artisan_id,
      artisanStoryOriginal: row.artisan_story_original, artisanStoryLang: row.artisan_story_original_lang,
      artisanStoryTranslated: row.artisan_story_translated, timeTaken: row.time_taken,
      verificationStatus: row.verification_status, verifiedAt: row.verified_at, createdAt: row.created_at,
    };
  },
};
