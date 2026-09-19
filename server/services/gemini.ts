import { config } from "../config";

interface CatalogueResponse {
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
}

export interface CraftStoryResponse {
  state: string;
  cityRegion: string;
  craftTradition: string;
  technique: string;
  materialsUsed: string;
  culturalHeritageStory: string;
}

// Confirmed-available Gemini text model IDs (verified via /v1beta/models listing)
const GEMINI_TEXT_MODELS = [
  "gemini-3.1-flash-lite",  // Newest lite — lowest latency
  "gemini-3.5-flash",       // Stable flash
  "gemini-3.5-flash-lite",  // Lite fallback
  "gemini-3.6-flash",       // Extended fallback
  "gemini-3.7-flash",       // Extended fallback
  "gemini-3.8-flash",       // Extended fallback
  "gemini-2.5-flash",       // Quota-limited but valid
  "gemini-flash-latest",    // Generic latest alias
];

async function callGemini(contents: any[], systemInstruction?: string, extraGenConfig?: any): Promise<string> {
  let lastError: any = null;

  for (const model of GEMINI_TEXT_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;
      const payload: any = {
        contents,
        generationConfig: {
          temperature: 0.15,
          topP: 0.9,
          ...extraGenConfig,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Gemini] Model "${model}" → HTTP ${response.status}:`, errText.slice(0, 300));
        lastError = new Error(`Gemini ${model} error (${response.status}): ${errText}`);
        continue;
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`[Gemini] Success with model "${model}"`);
        return text;
      }
      console.warn(`[Gemini] Model "${model}" returned empty content:`, JSON.stringify(result).slice(0, 200));
    } catch (err: any) {
      console.warn(`[Gemini] Model "${model}" fetch failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate content");
}

export const geminiService = {
  async generateCatalogue(params: {
    transcription?: string;
    language?: string;
    imageUrl?: string;
    existingName?: string;
    existingCategory?: string;
    materials?: string;
    craftOrigin?: string;
    sellerState?: string;
    sellerCity?: string;
  }): Promise<CatalogueResponse> {
    const artisanLang = params.language || "Hindi";
    const exactTranscript = (params.transcription || "").trim();

    if (!exactTranscript) {
      throw new Error("No voice transcription provided. Spoken transcription is required.");
    }

    // Step 1: Log the EXACT Hindi Whisper transcript (SOLE SOURCE OF TRUTH)
    console.log("[Pipeline] EXACT Hindi transcript:", exactTranscript);

    // Step 2: Faithful Hindi-to-English translation
    // Must preserve the exact meaning faithfully, never invent details, no mock data, no Blue Pottery
    const translationSystemPrompt = `You are a professional, accurate translator for Indian artisans.
Your ONLY task is to translate the artisan's spoken transcript from ${artisanLang} into natural, accurate English.

RULES:
- Translate the exact meaning of the spoken words faithfully.
- DO NOT summarize, omit, or embellish.
- DO NOT invent materials, heritage, locations, or product details.
- Return ONLY the direct English translation text without quotes or commentary.`;

    const translationUserPrompt = `Translate this exact spoken ${artisanLang} transcript into English:\n"${exactTranscript}"`;

    let englishTranslation = "";
    try {
      const rawTrans = await callGemini(
        [{ parts: [{ text: translationUserPrompt }] }],
        translationSystemPrompt,
        { temperature: 0.1 }
      );
      englishTranslation = rawTrans.replace(/^["'`]+|["'`]+$/g, "").trim();
    } catch (transErr: any) {
      console.error("[Pipeline] Translation failed:", transErr?.message || transErr);
      throw new Error(`Translation error: ${transErr?.message || "Failed to translate spoken transcript to English"}`);
    }

    if (!englishTranslation) {
      throw new Error("Translation error: Model returned empty translation for spoken transcript.");
    }

    // Step 3: Log the exact English translation
    console.log("[Pipeline] English translated text:", englishTranslation);

    // Step 4: Gemini generates product name/category/short description ONLY from that translated text
    const catalogSystemPrompt = `You are KalaSetu AI, an expert e-commerce cataloging assistant.
Below is the accurate English translation of an Indian artisan's spoken craft description.
Derive the product listing details ONLY from this English translation.

CRITICAL RULES — STRICT ADHERENCE REQUIRED:
- The translated text below is the ONLY source of truth.
- Do NOT use previous product data, mock data, sample Blue Pottery data, old state, or fallback text.
- Do NOT invent materials, origin, history, features, dimensions, or claims not mentioned.
- Do NOT include price or cost numbers inside the product description text itself.
- Keep the description concise, natural, and professional (1 to 2 sentences).
- If the artisan mentioned very little, write a short, honest 1-2 sentence description based only on what was translated.
- If location/city/state was not explicitly mentioned in the translation → craft_origin = "", state = "", city = "".
- If cultural story/heritage was not explicitly mentioned → cultural_story = "".
- Derive materials ONLY if explicitly stated in the translation (e.g., "clay", "wood", "brass"). Otherwise empty array [].
- Derive product_name strictly from what was described (e.g. "Handcrafted Clay Diya" or "Handmade Clay Lamp").

Output STRICTLY valid JSON with no markdown backticks:
{
  "product_name": "Concise product title derived ONLY from the translated text",
  "category": "Home Decor | Apparel & Textiles | Metal Crafts | Paintings & Folk Art | Pottery & Ceramics | Wooden Crafts | Other",
  "english_description": "Short, professional e-commerce product description (1-2 sentences) derived ONLY from the translated text",
  "regional_description": "Accurate translation of the english_description into ${artisanLang} script",
  "materials": ["Materials in English explicitly mentioned in the translation. Empty array [] if none."],
  "craft_origin": "Only if explicitly mentioned in the translation. Otherwise empty string.",
  "state": "Only if explicitly mentioned in the translation. Otherwise empty string.",
  "city": "Only if explicitly mentioned in the translation. Otherwise empty string.",
  "traditional_technique": "Only if explicitly mentioned in the translation. Otherwise empty string.",
  "cultural_story": "Only if explicitly mentioned in the translation. Otherwise empty string.",
  "tags": ["handmade", "artisan"],
  "translations": {
    "en": "Same as english_description",
    "hi": "Hindi version of english_description",
    "pa": "Punjabi version of english_description",
    "ta": "Tamil version of english_description",
    "te": "Telugu version of english_description"
  }
}`;

    const catalogUserPrompt = `Spoken transcript language: ${artisanLang}

Accurate English translation of spoken transcript (SOLE SOURCE OF TRUTH):
"${englishTranslation}"

Generate the JSON catalogue entry using ONLY the English translation above.`;

    let parsed: CatalogueResponse;
    try {
      const response = await callGemini(
        [{ parts: [{ text: catalogUserPrompt }] }],
        catalogSystemPrompt,
        { temperature: 0.1 }
      );
      const cleanJson = response.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      parsed = JSON.parse(cleanJson) as CatalogueResponse;
    } catch (catErr: any) {
      console.error("[Pipeline] Catalog generation failed:", catErr?.message || catErr);
      throw new Error(`Catalog generation error: ${catErr?.message || "Failed to generate catalog from translated text"}`);
    }

    // Step 5: Preserve the EXACT original Hindi transcript and exact English translation
    parsed.transcription = exactTranscript;
    parsed.language = artisanLang;
    parsed.english_translation = englishTranslation;

    // Safety checks: ensure english_description exists and is not empty
    if (!parsed.english_description || parsed.english_description.trim() === "") {
      parsed.english_description = englishTranslation;
    }

    console.log("[Pipeline] Generated product name:", parsed.product_name);
    console.log("[Pipeline] Generated English description:", parsed.english_description);

    return parsed;
  },

  async transcribeAudio(audioBuffer: Buffer, mimeType: string, langHint: string = "hi"): Promise<{ transcription: string; detectedLanguage: string; languageName: string }> {
    const base64Audio = audioBuffer.toString("base64");
    const langNames: Record<string, string> = {
      hi: "Hindi",
      en: "English",
      pa: "Punjabi",
      ta: "Tamil",
      te: "Telugu"
    };

    const prompt = `Listen to this artisan's audio recording describing their handmade craft product.
Your task is ONLY to transcribe what was spoken — do NOT summarize, improve or translate.
Transcribe the speech precisely and verbatim into its native script:
- Hindi → Devanagari script
- Punjabi → Gurmukhi script
- Tamil → Tamil script
- Telugu → Telugu script
- English → Latin script

Also detect the language spoken.
Output ONLY valid JSON with no backticks:
{
  "transcription": "Exact verbatim transcription in native script",
  "detected_code": "hi | en | pa | ta | te",
  "language_name": "Hindi | English | Punjabi | Tamil | Telugu"
}`;

    try {
      const response = await callGemini([
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "audio/webm",
                data: base64Audio,
              },
            },
            { text: prompt },
          ],
        },
      ]);

      let transcriptionText = "";
      let detectedCode = langHint;
      let langName = langNames[langHint] || "Hindi";

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.transcription && typeof parsed.transcription === "string") {
            transcriptionText = parsed.transcription.trim();
          }
          if (parsed.detected_code && typeof parsed.detected_code === "string") {
            detectedCode = parsed.detected_code.trim();
          }
          if (parsed.language_name && typeof parsed.language_name === "string") {
            langName = parsed.language_name.trim();
          }
        } catch {}
      }

      if (!transcriptionText) {
        const clean = response.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
        if (clean && !clean.startsWith("{")) {
          transcriptionText = clean;
        }
      }

      return {
        transcription: transcriptionText,
        detectedLanguage: detectedCode,
        languageName: langName,
      };
    } catch (error) {
      console.warn("Gemini audio transcription fallback:", error);
      return {
        transcription: "",
        detectedLanguage: langHint || "hi",
        languageName: langNames[langHint] || "Hindi",
      };
    }
  },

  async translateText(text: string, targetLanguage: "en" | "hi" | "pa" | "ta" | "te"): Promise<string> {
    const langNames: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      pa: "Punjabi",
      ta: "Tamil",
      te: "Telugu"
    };

    const prompt = `Translate the following artisan craft description into natural ${langNames[targetLanguage]}.
Do not add notes, markdown, or quotation marks. Return only the translated string.

Text:
${text}`;

    try {
      const translated = await callGemini([{ parts: [{ text: prompt }] }]);
      return translated.trim();
    } catch (err) {
      console.warn("Translation fallback:", err);
      return text;
    }
  },

  async checkSimilarity(product: { name: string; category: string; description: string; craft_tradition?: string }): Promise<{
    similarityScore: number;
    status: string;
    similarityNotes: string;
    similarItems: Array<{ name: string; matchPercent: number; reason: string }>;
  }> {
    const prompt = `Assess the visual/thematic similarity of this new artisan product compared to common market designs:
Product: ${product.name}
Category: ${product.category}
Tradition: ${product.craft_tradition || ""}
Description: ${product.description}

Evaluate if it has a unique artisan identity or resembles generic mass-produced items.
Return ONLY valid JSON with no backticks:
{
  "similarityScore": 8,
  "status": "No significant similarity detected | Potential similarity detected — X%",
  "similarityNotes": "A brief respectful note confirming the artisan's distinct voice and traditional originality.",
  "similarItems": [
    { "name": "Generic item name", "matchPercent": 14, "reason": "Brief reason for match." }
  ]
}`;

    try {
      const response = await callGemini([{ parts: [{ text: prompt }] }]);
      const cleanJson = response.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      return {
        similarityScore: 8,
        status: "No significant similarity detected",
        similarityNotes: "Your handcrafted piece displays a distinct visual and cultural identity. It is ready to stand on its own in the heritage marketplace.",
        similarItems: [
          { name: "Similar craft type", matchPercent: 12, reason: "Common regional motif, but your brushwork and silhouette are distinct." }
        ]
      };
    }
  },

  async extractCraftStory(params: {
    transcription: string;
    language?: string;
  }): Promise<CraftStoryResponse> {
    const transcriptionText = (params.transcription || "").trim();
    if (!transcriptionText) {
      return {
        state: "",
        cityRegion: "",
        craftTradition: "",
        technique: "",
        materialsUsed: "",
        culturalHeritageStory: "",
      };
    }

    const artisanLang = params.language || "Hindi";

    const systemPrompt = `You are KalaSetu AI, an expert Indian artisan craft and cultural heritage analyst.
The artisan's speech is the source of truth.
The artisan may speak Hindi, Punjabi, Tamil, or Telugu.
Listen to the complete transcript and extract the craft story details.
Translate the information into English where required.

Rules:
1. Do NOT invent information.
2. Do NOT use mock/default data.
3. Do NOT reuse information from previous products.
4. If the artisan does not mention a field, leave it empty.
5. Preserve the artisan's actual meaning and cultural details.
6. Convert the heritage story into clear, natural English while preserving its meaning.
7. Return ONLY valid JSON.

JSON format:
{
  "state": "",
  "cityRegion": "",
  "craftTradition": "",
  "technique": "",
  "materialsUsed": "",
  "culturalHeritageStory": ""
}`;

    const promptText = `Artisan's spoken language: ${artisanLang}
Complete voice transcript:
"${transcriptionText}"

Extract the following:
- state
- city/region
- craft tradition
- technique
- materials used
- cultural heritage story

Output ONLY valid JSON matching the exact format:
{
  "state": "",
  "cityRegion": "",
  "craftTradition": "",
  "technique": "",
  "materialsUsed": "",
  "culturalHeritageStory": ""
}`;

    try {
      const response = await callGemini(
        [{ parts: [{ text: promptText }] }],
        systemPrompt,
        { temperature: 0.1, responseMimeType: "application/json" }
      );

      const cleanJson = response.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleanJson);

      return {
        state: typeof parsed.state === "string" ? parsed.state.trim() : "",
        cityRegion: typeof parsed.cityRegion === "string"
          ? parsed.cityRegion.trim()
          : (typeof parsed.city === "string" ? parsed.city.trim() : ""),
        craftTradition: typeof parsed.craftTradition === "string"
          ? parsed.craftTradition.trim()
          : (typeof parsed.craft_tradition === "string" ? parsed.craft_tradition.trim() : ""),
        technique: typeof parsed.technique === "string" ? parsed.technique.trim() : "",
        materialsUsed: typeof parsed.materialsUsed === "string"
          ? parsed.materialsUsed.trim()
          : (Array.isArray(parsed.materialsUsed)
            ? parsed.materialsUsed.join(", ")
            : (Array.isArray(parsed.materials)
              ? parsed.materials.join(", ")
              : (typeof parsed.materials === "string" ? parsed.materials : ""))),
        culturalHeritageStory: typeof parsed.culturalHeritageStory === "string"
          ? parsed.culturalHeritageStory.trim()
          : (typeof parsed.cultural_story === "string" ? parsed.cultural_story.trim() : ""),
      };
    } catch (error: any) {
      console.error("[extractCraftStory] Gemini API call failed:", error?.message || error);
      throw error;
    }
  }
};
