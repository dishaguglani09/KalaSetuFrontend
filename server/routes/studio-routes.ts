import { Router, Response } from "express";
import { requireSellerAuth, AuthenticatedRequest } from "../middleware/auth";
import { imageUpload } from "../middleware/upload";
import { imageEnhancerService } from "../services/image-enhancer";
import { imageRepository, productRepository } from "../db/repository";

export const studioRouter = Router();

// Allow authenticated seller to upload craft photo
studioRouter.post(
  "/upload",
  requireSellerAuth,
  imageUpload.single("image"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sellerId = req.seller!.id;
      const { draftId } = req.body;

      let imageUrl = "";

      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.imageBase64) {
        // Handle base64 camera snapshot — save to disk, return path
        const result = await imageEnhancerService.enhanceImage(req.body.imageBase64);
        imageUrl = result.originalUrl;
      } else {
        res.status(400).json({ error: "Please select or capture a photo of your craft." });
        return;
      }

      const imgRecordId = `img-${Date.now()}`;
      imageRepository.saveImage({
        id: imgRecordId,
        seller_id: sellerId,
        product_id: draftId,
        original_url: imageUrl,
      });

      // If draftId provided, update draft's image_url only (not enhanced yet)
      if (draftId) {
        productRepository.upsertDraft({
          id: draftId,
          seller_id: sellerId,
          image_url: imageUrl,
        });
      }

      res.status(201).json({
        message: "Product photo uploaded successfully",
        imageUrl,
        imageId: imgRecordId,
      });
    } catch (error: any) {
      console.error("Photo upload failed:", error);
      res.status(500).json({ error: error.message || "Failed to process photo upload" });
    }
  }
);

// Image Studio: Enhance photo with Gemini AI
// Accepts imageUrl in JSON body OR a direct image file upload (multipart)
studioRouter.post(
  "/enhance",
  requireSellerAuth,
  imageUpload.single("image"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sellerId = req.seller!.id;
      const { draftId } = req.body;

      // Determine input image source
      let inputImagePath: string | null = null;

      if (req.file) {
        // Direct file upload to enhance
        inputImagePath = `/uploads/${req.file.filename}`;
      } else if (req.body.imageUrl) {
        inputImagePath = req.body.imageUrl as string;
      } else {
        res.status(400).json({
          error: "No image provided. Send either imageUrl in JSON body or a multipart image file.",
        });
        return;
      }

      // Call the real Gemini AI enhancement pipeline
      const result = await imageEnhancerService.enhanceImage(inputImagePath, draftId);

      // If enhancement failed, return a proper error response (never silently return original)
      if (result.status === "failed") {
        res.status(422).json({
          error: result.error || "AI enhancement failed. Please try again.",
          status: "failed",
          originalUrl: result.originalUrl,
        });
        return;
      }

      // Save both original and enhanced URLs to the draft
      if (draftId) {
        productRepository.upsertDraft({
          id: draftId,
          seller_id: sellerId,
          image_url: result.originalUrl,
          enhanced_image_url: result.enhancedUrl,
        });
      }

      res.json({
        message: "Image enhanced successfully with KalaSetu AI",
        status: result.status,
        originalUrl: result.originalUrl,
        enhancedUrl: result.enhancedUrl,
        enhancementsApplied: result.enhancementsApplied,
        dimensions: result.dimensions,
        craftAnalysis: result.craftAnalysis,
      });
    } catch (error: any) {
      console.error("Enhancement failed:", error);
      res.status(500).json({ error: error.message || "Failed to enhance product image" });
    }
  }
);
