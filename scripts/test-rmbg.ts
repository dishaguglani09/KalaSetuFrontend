import fs from "node:fs";
import path from "node:path";
import { Jimp } from "jimp";
import { removeBackground } from "../server/ml/rmbg";

async function runTest() {
  console.log("=== Testing RMBG-1.4 Background Removal Pipeline ===");
  
  // Find a test image in uploads
  const uploadDir = path.resolve(process.cwd(), "uploads");
  const candidates = [
    "kalasetu-1788462072304-49977286.jpg",
    "kalasetu-1788456313691-546570163.png",
  ];

  let testImagePath = "";
  for (const c of candidates) {
    const full = path.join(uploadDir, c);
    if (fs.existsSync(full) && fs.statSync(full).size > 1000) {
      testImagePath = full;
      break;
    }
  }

  if (!testImagePath) {
    throw new Error("No suitable test image found in uploads directory.");
  }

  console.log(`Using test image: ${testImagePath}`);
  const inputBuffer = fs.readFileSync(testImagePath);
  console.log(`Input size: ${(inputBuffer.length / 1024).toFixed(2)} KB`);

  const startTime = Date.now();
  console.log("Running removeBackground() through RMBG-1.4 ONNX model...");
  const result = await removeBackground(inputBuffer);
  const elapsed = Date.now() - startTime;

  console.log(`Inference + processing completed in ${elapsed} ms`);
  console.log(`Result dimensions: ${result.width} x ${result.height}`);
  console.log(`Applied enhancements:`, result.appliedEnhancements);
  console.log(`Output PNG buffer size: ${(result.pngBuffer.length / 1024).toFixed(2)} KB`);

  // Analyze alpha channel transparency
  const outImg = await Jimp.read(result.pngBuffer);
  let transparentPixels = 0;
  let semiTransparentPixels = 0;
  let opaquePixels = 0;
  const totalPixels = result.width * result.height;
  const data = outImg.bitmap.data;

  for (let i = 0; i < totalPixels; i++) {
    const alpha = data[i * 4 + 3];
    if (alpha < 25) {
      transparentPixels++;
    } else if (alpha > 230) {
      opaquePixels++;
    } else {
      semiTransparentPixels++;
    }
  }

  const transparentPct = ((transparentPixels / totalPixels) * 100).toFixed(1);
  const opaquePct = ((opaquePixels / totalPixels) * 100).toFixed(1);
  const semiPct = ((semiTransparentPixels / totalPixels) * 100).toFixed(1);

  console.log(`Alpha distribution:`);
  console.log(`- Transparent background: ${transparentPct}% (${transparentPixels} pixels)`);
  console.log(`- Opaque foreground craft: ${opaquePct}% (${opaquePixels} pixels)`);
  console.log(`- Soft edge feathering: ${semiPct}% (${semiTransparentPixels} pixels)`);

  const outputPath = path.join(uploadDir, "test-rmbg-output.png");
  fs.writeFileSync(outputPath, result.pngBuffer);
  console.log(`Saved output to: ${outputPath}`);

  if (transparentPixels === 0) {
    throw new Error("FAIL: No transparent pixels generated. Background was not removed!");
  }
  if (opaquePixels === 0) {
    throw new Error("FAIL: No opaque pixels generated. Entire image became transparent!");
  }

  console.log("=== RMBG-1.4 VERIFICATION SUCCESSFUL! ===");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
