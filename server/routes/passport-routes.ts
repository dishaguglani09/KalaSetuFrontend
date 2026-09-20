import { Router, RequestHandler } from "express";
import { passportService } from "../services/passport-service";
import { requireSellerAuth } from "../middleware/auth";

export const passportRouter = Router();

// Public: buyer views a passport by passport_id
const getPassportPublic: RequestHandler = (req, res) => {
  const passportId = String(req.params.passportId);
  const row = passportService.getByPassportId(passportId);
  if (!row) {
    res.status(404).json({ error: "Craft passport not found" });
    return;
  }
  res.json({ passport: passportService.serialize(row) });
};
passportRouter.get("/view/:passportId", getPassportPublic);

// Public / Artisan: get or create passport for a product
const getPassportForProduct: RequestHandler = async (req, res) => {
  const productId = String(req.params.productId);
  try {
    const passport = await passportService.getOrCreatePassport(productId);
    if (!passport) {
      res.status(404).json({ error: "Product not found or passport could not be generated" });
      return;
    }
    res.json({ passport: passportService.serialize(passport) });
  } catch (err: any) {
    console.error("[passport] getOrCreate error:", err);
    res.status(500).json({ error: "Failed to retrieve craft passport" });
  }
};
passportRouter.get("/product/:productId", getPassportForProduct);

// Artisan: list all passports for logged-in seller
const listSellerPassports: RequestHandler = (req, res) => {
  const sellerId = (req as any).seller?.id || (req as any).user?.id;
  if (!sellerId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const rows = passportService.getSellerPassports(sellerId);
  res.json({ passports: rows.map(r => passportService.serialize(r)) });
};
passportRouter.get("/my", requireSellerAuth as RequestHandler, listSellerPassports);

// Artisan: get voice readback script for a product
const getReadbackScript: RequestHandler = async (req, res) => {
  const productId = String(req.params.productId);
  try {
    const result = await passportService.getReadbackScript(productId);
    if (!result) {
      res.status(404).json({ error: "Passport not found for this product" });
      return;
    }
    res.json(result);
  } catch (err: any) {
    console.error("[passport] readback error:", err);
    res.status(500).json({ error: "Failed to generate readback script" });
  }
};
passportRouter.get("/readback/:productId", getReadbackScript);

// Artisan: verify passport after confirmation
const verifyPassport: RequestHandler = (req, res) => {
  const productId = String(req.params.productId);
  const result = passportService.verifyPassport(productId);
  if (!result) {
    res.status(404).json({ error: "Passport not found" });
    return;
  }
  res.json({ passport: passportService.serialize(result), message: "Passport verified successfully" });
};
passportRouter.post("/verify/:productId", verifyPassport);

// Artisan: save artisan story (from voice capture)
const saveArtisanStory: RequestHandler = async (req, res) => {
  const productId = String(req.params.productId);
  const { storyOriginal, lang, storyTranslated } = req.body;
  if (!storyOriginal) {
    res.status(400).json({ error: "storyOriginal is required" });
    return;
  }
  try {
    const result = await passportService.saveArtisanStory(productId, storyOriginal, lang || "hi", storyTranslated);
    if (!result) {
      res.status(404).json({ error: "Passport not found" });
      return;
    }
    res.json({ passport: passportService.serialize(result), message: "Artisan story saved" });
  } catch (err: any) {
    console.error("[passport] saveStory error:", err);
    res.status(500).json({ error: "Failed to save artisan story" });
  }
};
passportRouter.post("/story/:productId", saveArtisanStory);
