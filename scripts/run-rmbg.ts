import fs from "node:fs";
import path from "node:path";
import { Jimp } from "jimp";
import { removeBackground } from "../server/ml/rmbg";

async function main() {
  const args = process.argv.slice(2);
  let inputPath = args[0];

  // If no input path provided, find a sample image in uploads/
  if (!inputPath) {
    const uploadDir = path.resolve(process.cwd(), "uploads");
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      const imageFile = files.find(
        (f) =>
          (f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png")) &&
          !f.includes("cutout") &&
          !f.includes("output") &&
          fs.statSync(path.join(uploadDir, f)).size > 5000
      );
      if (imageFile) {
        inputPath = path.join(uploadDir, imageFile);
      }
    }
  }

  if (!inputPath) {
    console.error("Usage: pnpm exec tsx scripts/run-rmbg.ts <path-to-image> [output-path.png]");
    process.exit(1);
  }

  const resolvedInputPath = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolvedInputPath)) {
    console.error(`Error: File not found at: ${resolvedInputPath}`);
    process.exit(1);
  }

  // Determine output path
  let outputPath = args[1];
  if (!outputPath) {
    const parsed = path.parse(resolvedInputPath);
    outputPath = path.join(parsed.dir, `${parsed.name}-cutout.png`);
  }
  const resolvedOutputPath = path.resolve(process.cwd(), outputPath);

  console.log("==================================================");
  console.log("       KALASETU RMBG-1.4 AI BACKGROUND REMOVER     ");
  console.log("==================================================");
  console.log(`Input Image : ${resolvedInputPath}`);
  const inputStat = fs.statSync(resolvedInputPath);
  console.log(`Input Size  : ${(inputStat.size / 1024).toFixed(2)} KB`);

  const inputBuffer = fs.readFileSync(resolvedInputPath);

  console.log("\nRunning RMBG-1.4 ONNX inference...");
  const startTime = Date.now();
  const result = await removeBackground(inputBuffer);
  const elapsedMs = Date.now() - startTime;

  // Save the transparent PNG
  fs.writeFileSync(resolvedOutputPath, result.pngBuffer);

  // Quick transparency check on the output
  const outImg = await Jimp.read(result.pngBuffer);
  const totalPixels = result.width * result.height;
  const data = outImg.bitmap.data;
  let transparentCount = 0;
  let opaqueCount = 0;
  for (let i = 0; i < totalPixels; i++) {
    const a = data[i * 4 + 3];
    if (a < 25) transparentCount++;
    else if (a > 230) opaqueCount++;
  }

  console.log(`\n✓ Inference Finished in: ${(elapsedMs / 1000).toFixed(2)}s`);
  console.log(`✓ Image Dimensions    : ${result.width} x ${result.height}`);
  console.log(`✓ Output Size         : ${(result.pngBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`✓ Background Removed  : ${((transparentCount / totalPixels) * 100).toFixed(1)}% transparent`);
  console.log(`✓ Subject Preserved   : ${((opaqueCount / totalPixels) * 100).toFixed(1)}% opaque`);
  console.log(`\n🎉 Output PNG saved to:`);
  console.log(`   ${resolvedOutputPath}`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Inference failed:", err);
  process.exit(1);
});
