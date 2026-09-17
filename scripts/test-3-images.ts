import { imageEnhancerService } from "../server/services/image-enhancer";
import fs from "node:fs";

async function test3Images() {
  console.log("=== Testing KalaSetu AI Image Enhancement across 3 Handicraft Images ===");

  const testImages = [
    { name: "Image 1 (Pottery Set)", path: "uploads/kalasetu-1788462072304-49977286.jpg" },
    { name: "Image 2 (Handicraft 2)", path: "uploads/kalasetu-1788973357421-898231774.jpg" },
    { name: "Image 3 (Handicraft 3)", path: "uploads/kalasetu-1789626405547-687220688.jpg" },
  ];

  for (let i = 0; i < testImages.length; i++) {
    const item = testImages[i];
    console.log(`\n--------------------------------------------------`);
    console.log(`Testing ${item.name}: ${item.path}`);
    if (!fs.existsSync(item.path)) {
      console.warn(`File not found: ${item.path}, skipping...`);
      continue;
    }

    const start = Date.now();
    const result = await imageEnhancerService.enhanceImage(item.path, `test-3img-${i + 1}`);
    const elapsed = Date.now() - start;

    console.log(`✓ Status              : ${result.status}`);
    console.log(`✓ Elapsed Time        : ${elapsed} ms`);
    console.log(`✓ Original URL        : ${result.originalUrl}`);
    console.log(`✓ Enhanced URL        : ${result.enhancedUrl}`);
    console.log(`✓ Enhancements Applied:`);
    result.enhancementsApplied.forEach((e) => console.log(`   - ${e}`));

    const diskFile = "." + result.enhancedUrl;
    console.log(`✓ Enhanced Disk File  : ${diskFile}`);
    console.log(`✓ Exists on Disk      : ${fs.existsSync(diskFile)}`);
    if (fs.existsSync(diskFile)) {
      console.log(`✓ Output File Size    : ${(fs.statSync(diskFile).size / 1024).toFixed(1)} KB`);
    }

    if (result.craftAnalysis) {
      console.log(`✓ Gemini Vision Craft : ${result.craftAnalysis.craftType} (${result.craftAnalysis.craftRegion || "India"})`);
      console.log(`✓ Catalog Quality     : ${result.craftAnalysis.qualityScore}/100`);
    }
  }

  console.log("\n==================================================");
  console.log("       ALL 3 HANDICRAFT IMAGE TESTS COMPLETED     ");
  console.log("==================================================");
}

test3Images().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
