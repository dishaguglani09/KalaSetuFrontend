import path from "node:path";
import fs from "node:fs";
import * as ort from "onnxruntime-node";
import { Jimp } from "jimp";

export const MODEL_DIR = path.resolve(process.cwd(), "models", "rmbg-1.4");
export const MODEL_PATH = path.resolve(MODEL_DIR, "model.onnx");

let sessionInstance: ort.InferenceSession | null = null;

/**
 * Returns a cached ONNX InferenceSession for RMBG-1.4.
 */
export async function getRmbgSession(): Promise<ort.InferenceSession> {
  if (sessionInstance) return sessionInstance;

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(
      `RMBG-1.4 model file not found at ${MODEL_PATH}. Please ensure model.onnx is downloaded into models/rmbg-1.4/`
    );
  }

  sessionInstance = await ort.InferenceSession.create(MODEL_PATH, {
    executionProviders: ["cpu"],
    graphOptimizationLevel: "all",
  });

  return sessionInstance;
}

export interface CutoutResult {
  pngBuffer: Buffer;
  width: number;
  height: number;
  appliedEnhancements: string[];
}

/**
 * Executes RMBG-1.4 background removal on an input image buffer.
 *
 * Pipeline:
 * 1. Decode input image buffer using Jimp.
 * 2. Resize to 1024x1024 and normalize to [-0.5, 0.5] as NCHW Float32 tensor.
 * 3. Run RMBG-1.4 ONNX inference to obtain foreground probability mask.
 * 4. Min-max normalize mask to [0, 1].
 * 5. Bilinearly interpolate mask to original image dimensions.
 * 6. Apply alpha mask directly to create a clean cutout with transparency.
 * 7. Return PNG buffer.
 */
export async function removeBackground(imageBuffer: Buffer): Promise<CutoutResult> {
  const img = await Jimp.read(imageBuffer);
  const origWidth = img.bitmap.width;
  const origHeight = img.bitmap.height;

  // 1. Prepare 1024x1024 normalized NCHW Float32 tensor
  const resized = img.clone().resize({ w: 1024, h: 1024 });
  const rawData = resized.bitmap.data; // RGBA 1024*1024*4 bytes

  const floatArray = new Float32Array(3 * 1024 * 1024);
  const rOffset = 0;
  const gOffset = 1024 * 1024;
  const bOffset = 2 * 1024 * 1024;

  for (let i = 0; i < 1024 * 1024; i++) {
    const idx = i * 4;
    floatArray[rOffset + i] = rawData[idx] / 255.0 - 0.5;
    floatArray[gOffset + i] = rawData[idx + 1] / 255.0 - 0.5;
    floatArray[bOffset + i] = rawData[idx + 2] / 255.0 - 0.5;
  }

  const inputTensor = new ort.Tensor("float32", floatArray, [1, 3, 1024, 1024]);

  // 2. RMBG-1.4 Inference
  const session = await getRmbgSession();
  const inputName = session.inputNames[0] || "input";
  const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor };
  const results = await session.run(feeds);
  const outputName = session.outputNames[0] || "output";
  const outputTensor = results[outputName];
  const maskRaw = outputTensor.data as Float32Array;

  // 3. Min-Max normalization of output mask to [0, 1]
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < maskRaw.length; i++) {
    const v = maskRaw[i];
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }
  const range = maxVal - minVal || 1.0;
  const mask1024 = new Float32Array(1024 * 1024);
  for (let i = 0; i < maskRaw.length; i++) {
    mask1024[i] = Math.max(0, Math.min(1, (maskRaw[i] - minVal) / range));
  }

  // 4. Bilinear interpolation of mask to original image dimensions and alpha composition
  const origData = img.bitmap.data;
  for (let y = 0; y < origHeight; y++) {
    const v = (y + 0.5) * (1024 / origHeight) - 0.5;
    const y0 = Math.max(0, Math.min(1023, Math.floor(v)));
    const y1 = Math.max(0, Math.min(1023, y0 + 1));
    const dy = v - y0;

    for (let x = 0; x < origWidth; x++) {
      const u = (x + 0.5) * (1024 / origWidth) - 0.5;
      const x0 = Math.max(0, Math.min(1023, Math.floor(u)));
      const x1 = Math.max(0, Math.min(1023, x0 + 1));
      const dx = u - x0;

      const top = (1 - dx) * mask1024[y0 * 1024 + x0] + dx * mask1024[y0 * 1024 + x1];
      const bottom = (1 - dx) * mask1024[y1 * 1024 + x0] + dx * mask1024[y1 * 1024 + x1];
      const alpha = (1 - dy) * top + dy * bottom;

      const idx = (y * origWidth + x) * 4;
      // Set alpha channel (0 = transparent background, 255 = opaque foreground craft)
      origData[idx + 3] = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
    }
  }

  // 5. Output transparent PNG buffer
  const pngBuffer = await img.getBuffer("image/png");

  return {
    pngBuffer,
    width: origWidth,
    height: origHeight,
    appliedEnhancements: [
      "AI background removal via RMBG-1.4 (Bria AI)",
      "Sub-pixel bilinear edge interpolation",
      "Transparent PNG cutout compositing",
    ],
  };
}
