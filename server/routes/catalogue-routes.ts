import { Router, Request, Response } from "express";
import { requireSellerAuth, AuthenticatedRequest } from "../middleware/auth";
import { geminiService } from "../services/gemini";
import { productRepository } from "../db/repository";

export const catalogueRouter = Router();

// AI Auto-Catalogue generation
catalogueRouter.post(
  "/generate",
  requireSellerAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sellerId = req.seller!.id;
      const {
        draftId,
        transcription,
        language,
        imageUrl,
        existingName,
        existingCategory,
        materials,
        craftOrigin,
        sellerState,
        sellerCity,
      } = req.body;

      // Pull seller profile location if not provided in request
      const sellerProfile = req.seller!;
      const resolvedState = sellerState || (sellerProfile as any).state || "";
      const resolvedCity = sellerCity || (sellerProfile as any).city || "";

      const catalogue = await geminiService.generateCatalogue({
        transcription,
        language,
        imageUrl,
      });

      // Save into draft if provided
      // english_description → description column; transcription stored in voice_transcription column
      if (draftId) {
        productRepository.upsertDraft({
          id: draftId,
          seller_id: sellerId,
          name: catalogue.product_name,
          category: catalogue.category,
          description: catalogue.english_description,
          translations_json: JSON.stringify({
            ...catalogue.translations,
            [catalogue.language?.toLowerCase() === "hindi" ? "hi"
              : catalogue.language?.toLowerCase() === "punjabi" ? "pa"
              : catalogue.language?.toLowerCase() === "tamil" ? "ta"
              : catalogue.language?.toLowerCase() === "telugu" ? "te"
              : "en"]: catalogue.regional_description,
          }),
          materials_json: JSON.stringify(catalogue.materials),
          craft_origin: catalogue.craft_origin,
          state: catalogue.state,
          city: catalogue.city,
          technique: catalogue.traditional_technique,
          cultural_story: catalogue.cultural_story,
          tags_json: JSON.stringify(catalogue.tags),
        });
      }

      res.json({
        message: "AI catalogue generated successfully",
        catalogue,
      });
    } catch (error: any) {
      console.error("Auto-catalogue generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI catalogue" });
    }
  }
);

// Extract Craft Story from complete voice transcript (Step 5: Craft Story)
catalogueRouter.post(
  "/craft-story",
  requireSellerAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sellerId = req.seller!.id;
      const { transcription, language, draftId } = req.body;

      if (!transcription || !transcription.trim()) {
        res.status(400).json({ error: "Voice transcription is required to extract craft story" });
        return;
      }

      const craftStory = await geminiService.extractCraftStory({
        transcription,
        language,
      });

      if (draftId) {
        const materialsList = craftStory.materialsUsed
          ? craftStory.materialsUsed.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

        productRepository.upsertDraft({
          id: draftId,
          seller_id: sellerId,
          state: craftStory.state,
          city: craftStory.cityRegion,
          craft_tradition: craftStory.craftTradition,
          technique: craftStory.technique,
          cultural_story: craftStory.culturalHeritageStory,
          materials_json: JSON.stringify(materialsList),
        });
      }

      res.json({
        message: "Craft story extracted successfully",
        craftStory,
      });
    } catch (error: any) {
      console.error("Craft story extraction error:", error);
      res.status(500).json({ error: error.message || "Failed to extract craft story" });
    }
  }
);

// Multilingual text translation
catalogueRouter.post(
  "/translate",
  requireSellerAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text || !targetLanguage) {
        res.status(400).json({ error: "Text and targetLanguage are required" });
        return;
      }

      const translated = await geminiService.translateText(text, targetLanguage);
      res.json({
        original: text,
        translated,
        targetLanguage,
      });
    } catch (error: any) {
      res.status(500).json({ error: "Translation failed" });
    }
  }
);

// Heritage Catalogue for living archive
catalogueRouter.get(
  "/heritage",
  (_req: Request, res: Response): void => {
    const rawHeritage = productRepository.getHeritageCatalogue();
    const heritageItems = rawHeritage.map((p) => ({
      id: p.id,
      title: p.craft_tradition || p.name,
      location: p.craft_origin || (p.city && p.state ? `${p.city}, ${p.state}` : "India"),
      technique: p.technique || "Traditional Handcraft",
      materials: safeJsonParse(p.materials_json, []).join(", "),
      culturalStory: p.cultural_story || p.description,
      imageUrl: p.enhanced_image_url || p.image_url,
      artisanName: "Heritage Artisan",
    }));

    res.json({ heritage: heritageItems });
  }
);

function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}
