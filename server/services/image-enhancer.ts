import path from "node:path";
import fs from "node:fs";
import { Jimp } from "jimp";
import { config } from "../config";
import { removeBackground } from "../ml/rmbg";

export interface CraftAnalysis {
  craftType: string;
  craftRegion: string;
  primaryColors: string[];
  qualityScore: number;
  enhancementNotes: string[];
}

export interface EnhancementResult {
  status: "success" | "partial" | "failed";
  originalUrl: string;
  enhancedUrl: string;
  enhancementsApplied: string[];
  dimensions: { width: number; height: number };
  craftAnalysis?: CraftAnalysis;
  error?: string;
}

/**
 * Reads an image from a URL path, file system path, or base64 data URL.
 * Returns the raw buffer and MIME type.
 */
async function readImageAsBuffer(filePathOrUrl: string): Promise<{ buffer: Buffer; mimeType: string }> {
  if (filePathOrUrl.startsWith("data:image")) {
    const match = filePathOrUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) throw new Error("Invalid base64 image data URL");
    return { buffer: Buffer.from(match[2], "base64"), mimeType: match[1] };
  }

  if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
    const response = await fetch(filePathOrUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    const arrayBuf = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return { buffer: Buffer.from(arrayBuf), mimeType: contentType.split(";")[0].trim() };
  }

  const diskPath = filePathOrUrl.startsWith("/uploads")
    ? path.join(config.uploadDir, path.basename(filePathOrUrl))
    : filePathOrUrl;

  if (!fs.existsSync(diskPath)) throw new Error(`Image file not found: ${diskPath}`);

  const buffer = fs.readFileSync(diskPath);
  const ext = path.extname(diskPath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return { buffer, mimeType: mimeMap[ext] || "image/jpeg" };
}

/**
 * STEP 1: Remove.bg API — professional background removal.
 *
 * Sends the product image to remove.bg and receives a clean PNG cutout
 * with the background fully removed. Returns a PNG buffer with transparency.
 */
async function removeBackgroundWithRemoveBg(imageBuffer: Buffer): Promise<Buffer> {
  const apiKey = (config.removeBgApiKey || process.env.REMOVE_BG_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!apiKey) throw new Error("REMOVE_BG_API_KEY is not configured");

  console.log("[image-enhancer] Step 1: Removing background with Remove.bg API...");

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/jpeg" });
  formData.append("image_file", blob, "product.jpg");
  formData.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Remove.bg API error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const resultBuffer = Buffer.from(await response.arrayBuffer());
  console.log(`[image-enhancer] ✅ Background removed. Cutout size: ${resultBuffer.length} bytes`);
  return resultBuffer;
}

/**
 * Composites a transparent PNG cutout onto a clean white background canvas (1200×1200).
 * Applies subtle ground shadow and centers the product at ~78% canvas fill.
 */
async function compositeOntoWhiteBackground(cutoutBuffer: Buffer): Promise<Buffer> {
  const cutout = await Jimp.read(cutoutBuffer);
  const cW = cutout.bitmap.width;
  const cH = cutout.bitmap.height;

  // Find tight bounds of non-transparent pixels
  const data = cutout.bitmap.data;
  let minX = cW, minY = cH, maxX = 0, maxY = 0;
  for (let y = 0; y < cH; y++) {
    for (let x = 0; x < cW; x++) {
      const alpha = data[(y * cW + x) * 4 + 3];
      if (alpha > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const prodW = maxX > minX ? maxX - minX + 1 : cW;
  const prodH = maxY > minY ? maxY - minY + 1 : cH;
  const cropped = maxX > minX && maxY > minY
    ? cutout.clone().crop({ x: minX, y: minY, w: prodW, h: prodH })
    : cutout;

  // Scale to 78% of 1200px canvas
  const targetSize = 1200;
  const maxDim = targetSize * 0.78;
  const scale = Math.min(maxDim / prodW, maxDim / prodH);
  const newW = Math.round(prodW * scale);
  const newH = Math.round(prodH * scale);
  const scaled = cropped.resize({ w: newW, h: newH });

  // Pure white canvas
  const canvas = new Jimp({ width: targetSize, height: targetSize, color: 0xffffffff });
  const canvasData = canvas.bitmap.data;

  // Soft ground contact shadow
  const posX = Math.round((targetSize - newW) / 2);
  const posY = Math.round((targetSize - newH) / 2);
  const centerX = posX + Math.round(newW / 2);
  const prodBottomY = posY + newH;
  const shadowW = Math.round(newW * 0.55);
  const shadowH = Math.round(newH * 0.04);

  for (let sy = prodBottomY - shadowH; sy <= prodBottomY + shadowH * 3; sy++) {
    for (let sx = centerX - shadowW; sx <= centerX + shadowW; sx++) {
      if (sx < 0 || sx >= targetSize || sy < 0 || sy >= targetSize) continue;
      const dx = (sx - centerX) / shadowW;
      const dy = (sy - prodBottomY) / (shadowH * 2);
      const distSq = dx * dx + dy * dy;
      if (distSq < 1) {
        const intensity = Math.exp(-distSq * 4) * 0.18;
        const idx = (sy * targetSize + sx) * 4;
        canvasData[idx] = Math.round(canvasData[idx] * (1 - intensity));
        canvasData[idx + 1] = Math.round(canvasData[idx + 1] * (1 - intensity));
        canvasData[idx + 2] = Math.round(canvasData[idx + 2] * (1 - intensity));
      }
    }
  }

  canvas.composite(scaled, posX, posY);
  return await canvas.getBuffer("image/png");
}

/**
 * STEP 2: Gemini 3.1 Flash Image — quality enhancement only.
 *
 * Sends the already-background-removed image to Gemini for:
 * - Improved lighting and exposure
 * - Enhanced sharpness and clarity
 * - Better contrast and visual quality
 * - Color fidelity preservation
 *
 * Does NOT perform background removal (already done by Remove.bg).
 * Does NOT redesign or replace the product.
 */
async function enhanceQualityWithGemini(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
  const apiKey = config.geminiApiKey;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  // Primary model + fallbacks in order of preference
  const MODELS = [
    "gemini-3.1-flash-image",
    "gemini-3.1-flash-lite-image",
    "gemini-3-pro-image",
    "gemini-2.5-flash-image",
  ];

  const QUALITY_ENHANCEMENT_PROMPT = `You are a professional product photo retoucher for an e-commerce marketplace.

The image you receive is a product cutout already placed on a white background. Your ONLY job is to improve the technical quality of this photograph.

WHAT TO DO:
- Improve the lighting to be bright, even, and professional
- Improve the exposure (make sure the product is properly lit, not too dark or too bright)
- Improve the sharpness and clarity of the product details
- Improve the contrast naturally to make the product pop
- Improve the overall visual quality and crispness

WHAT NOT TO DO:
- Do NOT change or remove the background (it is already white — keep it white)
- Do NOT redesign, reshape, or alter the product in any way
- Do NOT change the product's colors, patterns, textures or artwork
- Do NOT add or remove any parts of the product
- Do NOT change the composition or framing

OUTPUT: The same product with improved photo quality — better lit, sharper, more professional-looking. The background must remain white.`;

  const base64Image = imageBuffer.toString("base64");
  const payload = {
    contents: [
      {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: QUALITY_ENHANCEMENT_PROMPT },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
      temperature: 0.1,
    },
  };

  const lastErrors: string[] = [];

  for (const MODEL of MODELS) {
    console.log(`[image-enhancer] Step 2: Trying quality enhancement with ${MODEL}...`);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = (errData as any)?.error?.message || response.statusText;
        lastErrors.push(`${MODEL}: HTTP ${response.status}`);
        console.warn(`[image-enhancer] ${MODEL} unavailable (${response.status}), trying next...`);
        continue;
      }

      const result = await response.json();
      const parts = result?.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData?.data) {
          console.log(`[image-enhancer] ✅ ${MODEL} quality enhancement succeeded`);
          return Buffer.from(part.inlineData.data, "base64");
        }
      }

      const textContent = parts.find((p: any) => p.text)?.text || "";
      lastErrors.push(`${MODEL}: no image in response`);
      console.warn(`[image-enhancer] ${MODEL} returned no image. Text: ${textContent.slice(0, 80)}`);
    } catch (err: any) {
      lastErrors.push(`${MODEL}: ${err.message}`);
      console.warn(`[image-enhancer] ${MODEL} error: ${err.message}`);
    }
  }

  throw new Error(`All Gemini image models unavailable. Errors: ${lastErrors.join(" | ")}`);
}

/**
 * Calls Gemini Vision to analyze the craft for catalog metadata.
 */
async function analyzeCraftWithGemini(imageBuffer: Buffer, mimeType: string): Promise<CraftAnalysis | null> {
  const apiKey = config.geminiApiKey;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const base64Image = imageBuffer.toString("base64");
    const payload = {
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64Image } },
            {
              text: `Analyze this Indian handicraft product photograph. Respond in valid JSON only:
{
  "craftType": "Name of craft",
  "craftRegion": "Region or state in India",
  "primaryColors": ["Color 1", "Color 2"],
  "qualityScore": 90,
  "enhancementNotes": ["Note 1", "Note 2", "Note 3"]
}`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return JSON.parse(text) as CraftAnalysis;
  } catch (e: any) {
    console.warn("[image-enhancer] Gemini craft analysis:", e.message);
  }
  return null;
}

export const imageEnhancerService = {
  async enhanceImage(filePathOrUrl: string, filenameBase?: string): Promise<EnhancementResult> {
    let originalUrl = filePathOrUrl;
    let imageBuffer: Buffer;
    let mimeType: string;

    // Read the input image
    try {
      const read = await readImageAsBuffer(filePathOrUrl);
      imageBuffer = read.buffer;
      mimeType = read.mimeType;

      if (filePathOrUrl.startsWith("data:image")) {
        const origName = `upload-${Date.now()}.jpg`;
        const origDiskPath = path.join(config.uploadDir, origName);
        fs.writeFileSync(origDiskPath, imageBuffer);
        originalUrl = `/uploads/${origName}`;
      }
    } catch (readError: any) {
      console.error("[image-enhancer] Failed to read input image:", readError);
      return {
        status: "failed",
        originalUrl: filePathOrUrl,
        enhancedUrl: filePathOrUrl,
        enhancementsApplied: [],
        error: `Could not read input image: ${readError.message}`,
        dimensions: { width: 0, height: 0 },
      };
    }

    try {
      const safeBase = filenameBase || `enhanced-${Date.now()}`;
      const enhancedFilename = `enhanced-${safeBase}-${Date.now()}.jpg`;
      const enhancedDiskPath = path.join(config.uploadDir, enhancedFilename);

      const enhancementsApplied: string[] = [];
      let finalBuffer: Buffer;

      // ── STEP 1: Remove.bg background removal ──────────────────────────────────
      let bgRemovedPng: Buffer;
      try {
        bgRemovedPng = await removeBackgroundWithRemoveBg(imageBuffer);
        enhancementsApplied.push("Remove.bg: professional background removal — product cleanly isolated");
      } catch (removeBgError: any) {
        console.warn("[image-enhancer] Remove.bg API call failed:", removeBgError.message);
        try {
          console.log("[image-enhancer] Falling back to neural background removal (RMBG-1.4)...");
          const cutout = await removeBackground(imageBuffer);
          bgRemovedPng = cutout.pngBuffer;
          enhancementsApplied.push("Neural AI (RMBG-1.4): background cleanly removed");
        } catch (rmbgError: any) {
          throw new Error(`Background removal failed: ${removeBgError.message}`);
        }
      }

      // Composite the cutout onto a professional white studio background
      const composited = await compositeOntoWhiteBackground(bgRemovedPng);
      enhancementsApplied.push("White studio background — product centered at 78% canvas fill with ground shadow");

      // ── STEP 2: Gemini 3.1 Flash Image quality enhancement ───────────────────
      let geminiEnhanced: Buffer | null = null;
      try {
        geminiEnhanced = await enhanceQualityWithGemini(composited, "image/png");
        enhancementsApplied.push("Gemini 3.1 Flash Image: lighting, exposure, sharpness and visual quality enhanced");
      } catch (geminiError: any) {
        console.warn("[image-enhancer] Gemini quality enhancement failed, using Remove.bg output:", geminiError.message);
        enhancementsApplied.push(`Note: Gemini enhancement skipped (${geminiError.message.slice(0, 80)})`);
      }

      // Use Gemini-enhanced result if available, else the white-background composite
      finalBuffer = geminiEnhanced ?? composited;

      // Convert to JPEG for final output
      const finalImg = await Jimp.read(finalBuffer);
      const jpegBuffer = await finalImg.getBuffer("image/jpeg");

      fs.writeFileSync(enhancedDiskPath, jpegBuffer);
      console.log(`[image-enhancer] ✅ Enhancement complete: ${enhancedFilename}`);

      // ── STEP 3: Gemini craft analysis (metadata only) ─────────────────────────
      const craftAnalysis = await analyzeCraftWithGemini(jpegBuffer, "image/jpeg");
      if (craftAnalysis?.craftType) {
        enhancementsApplied.push(
          `Gemini Vision: ${craftAnalysis.craftType}${craftAnalysis.craftRegion ? ` (${craftAnalysis.craftRegion})` : ""} — Quality: ${craftAnalysis.qualityScore}/100`
        );
      }

      return {
        status: "success",
        originalUrl,
        enhancedUrl: `/uploads/${enhancedFilename}`,
        enhancementsApplied,
        dimensions: { width: 1200, height: 1200 },
        craftAnalysis: craftAnalysis || undefined,
      };
    } catch (pipelineError: any) {
      console.error("[image-enhancer] Pipeline failed:", pipelineError);
      return {
        status: "failed",
        originalUrl,
        enhancedUrl: originalUrl,
        enhancementsApplied: [],
        error: pipelineError.message || "Enhancement failed. Please try again.",
        dimensions: { width: 0, height: 0 },
      };
    }
  },
};
