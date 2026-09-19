import { Router, Response } from "express";
import { requireSellerAuth, AuthenticatedRequest } from "../middleware/auth";
import { audioMemoryUpload } from "../middleware/upload";
import { voiceRepository, productRepository } from "../db/repository";

export const voiceRouter = Router();

const WHISPER_API_URL = process.env.WHISPER_API_URL || "http://127.0.0.1:8000/api/speech/transcribe";

voiceRouter.post(
  "/transcribe",
  requireSellerAuth,
  audioMemoryUpload.single("audio"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sellerId = req.seller!.id;
      const { languageHint, draftId, audioBase64, mimeType, directTranscript } = req.body;

      const langNames: Record<string, string> = {
        hi: "Hindi",
        pa: "Punjabi",
        ta: "Tamil",
        te: "Telugu",
        en: "English"
      };

      const effectiveLangCode = languageHint && langNames[languageHint] ? languageHint : "hi";
      const effectiveLangName = langNames[effectiveLangCode] || "Hindi";

      let finalTranscription = "";
      let finalDetectedCode = effectiveLangCode;
      let finalLanguageName = effectiveLangName;

      if (directTranscript && typeof directTranscript === "string" && directTranscript.trim()) {
        finalTranscription = directTranscript.trim();
      } else {
        let buffer: Buffer | null = null;
        let effectiveMime = "audio/webm";

        if (req.file) {
          buffer = req.file.buffer;
          effectiveMime = req.file.mimetype || "audio/webm";
        } else if (audioBase64) {
          const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
          buffer = Buffer.from(cleanBase64, "base64");
          effectiveMime = mimeType || "audio/webm";
        }

        if (buffer && buffer.length > 0) {
          // Local faster-whisper STT service
          const formData = new FormData();
          const audioBlob = new Blob([buffer], { type: effectiveMime });
          const fileExt = effectiveMime.includes("wav") ? "audio.wav" : "audio.webm";
          formData.append("file", audioBlob, fileExt);
          formData.append("language", effectiveLangCode);

          const whisperRes = await fetch(WHISPER_API_URL, {
            method: "POST",
            body: formData,
          });

          if (!whisperRes.ok) {
            const errText = await whisperRes.text();
            throw new Error(`Local Whisper service error (${whisperRes.status}): ${errText}`);
          }

          const whisperData = (await whisperRes.json()) as {
            transcript: string;
            language: string;
            language_name: string;
          };

          finalTranscription = whisperData.transcript || "";
          finalDetectedCode = whisperData.language || effectiveLangCode;
          finalLanguageName = whisperData.language_name || effectiveLangName;
        }
      }

      // Save record in database
      const voiceRecordId = `rec-${Date.now()}`;
      voiceRepository.saveRecording({
        id: voiceRecordId,
        seller_id: sellerId,
        product_id: draftId,
        audio_url: `audio-recording-${voiceRecordId}`,
        detected_language: finalDetectedCode,
        transcription: finalTranscription,
      });

      res.json({
        message: "Voice understood and transcribed",
        transcription: finalTranscription,
        detectedLanguage: finalDetectedCode,
        languageName: finalLanguageName,
      });
    } catch (error: any) {
      console.error("Audio transcription error:", error);
      res.status(500).json({ error: error.message || "Voice processing failed. Please try speaking again." });
    }
  }
);
