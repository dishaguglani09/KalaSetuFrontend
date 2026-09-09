import path from "node:path";
import fs from "node:fs";
import { config } from "../config";
import { removeBackground } from "../ml/rmbg";

export interface EnhancementResult {
  status: "success" | "partial" | "failed";
  originalUrl: string;
  enhancedUrl: string;
  enhancementsApplied: string[];
  dimensions: { width: number; height: number };
}

export const imageEnhancerService = {
  async enhanceImage(filePathOrUrl: string, filenameBase?: string): Promise<EnhancementResult> {
    try {
      let imageBuffer: Buffer;
      let originalUrl = filePathOrUrl;

      if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
        const response = await fetch(filePathOrUrl);
        const arrayBuf = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      } else if (filePathOrUrl.startsWith("data:image")) {
        const base64Data = filePathOrUrl.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = Buffer.from(base64Data, "base64");
        const origName = `upload-${Date.now()}.jpg`;
        const origDiskPath = path.join(config.uploadDir, origName);
        fs.writeFileSync(origDiskPath, imageBuffer);
        originalUrl = `/uploads/${origName}`;
      } else {
        const diskPath = filePathOrUrl.startsWith("/uploads")
          ? path.join(config.uploadDir, path.basename(filePathOrUrl))
          : filePathOrUrl;
        imageBuffer = fs.readFileSync(diskPath);
      }

      // Execute RMBG-1.4 neural background removal
      const cutout = await removeBackground(imageBuffer);

      const safeBase = filenameBase || `cutout-${Date.now()}`;
      const enhancedFilename = `enhanced-cutout-${safeBase}.png`;
      const enhancedDiskPath = path.join(config.uploadDir, enhancedFilename);

      // Save the transparent cutout PNG to disk
      fs.writeFileSync(enhancedDiskPath, cutout.pngBuffer);

      return {
        status: "success",
        originalUrl,
        enhancedUrl: `/uploads/${enhancedFilename}`,
        enhancementsApplied: cutout.appliedEnhancements,
        dimensions: {
          width: cutout.width,
          height: cutout.height,
        },
      };
    } catch (error: any) {
      console.error("Image enhancement pipeline error:", error);
      return {
        status: "failed",
        originalUrl: filePathOrUrl,
        enhancedUrl: filePathOrUrl,
        enhancementsApplied: [`Inference failed: ${error.message || "Unknown error"}`],
        dimensions: { width: 800, height: 800 },
      };
    }
  },
};
