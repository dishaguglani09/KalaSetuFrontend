import { imageEnhancerService } from "../server/services/image-enhancer";
import fs from "node:fs";

async function test() {
  console.log("=== Testing KalaSetu AI Image Enhancer Service ===");
  const testImg = "uploads/kalasetu-1788462072304-49977286.jpg";
  const result = await imageEnhancerService.enhanceImage(testImg, "service-test");
  console.log("\nEnhancement Result:");
  console.log("Status:", result.status);
  console.log("Original URL:", result.originalUrl);
  console.log("Enhanced URL:", result.enhancedUrl);
  console.log("Enhancements Applied:", result.enhancementsApplied);
  if (result.craftAnalysis) {
    console.log("Gemini Craft Analysis:", JSON.stringify(result.craftAnalysis, null, 2));
  }
  const diskPath = "." + result.enhancedUrl;
  console.log("\nEnhanced File on disk:", diskPath);
  console.log("Exists:", fs.existsSync(diskPath));
  console.log("Size:", fs.statSync(diskPath).size, "bytes");
  console.log("=== TEST FINISHED SUCCESSFULLY ===");
}

test().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
