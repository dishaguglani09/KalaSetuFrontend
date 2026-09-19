import { Router, Request, Response } from "express";
import { requireSellerAuth, AuthenticatedRequest } from "../middleware/auth";
import { audioMemoryUpload } from "../middleware/upload";
import { voiceRepository, productRepository } from "../db/repository";
import { geminiService } from "../services/gemini";
import { config } from "../config";

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

      let finalTranscription = "";
      let finalDetectedCode = effectiveLangCode;
      let finalLanguageName = effectiveLangName;
      let usedProvider = "none";

      // 1. If audio buffer is provided, transcribe using multi-engine pipeline
      if (buffer && buffer.length > 50) {
        const fileExt = effectiveMime.includes("wav")
          ? "audio.wav"
          : effectiveMime.includes("mp4")
          ? "audio.mp4"
          : effectiveMime.includes("ogg")
          ? "audio.ogg"
          : "audio.webm";

        // --- Engine 1: Groq Whisper (whisper-large-v3) ---
        const groqApiKey = process.env.GROQ_API_KEY;
        if (groqApiKey && !finalTranscription) {
          try {
            console.log(`[Voice] Attempting Groq Whisper (lang: ${effectiveLangCode}, ${buffer.length} bytes)...`);
            const formData = new FormData();
            const audioBlob = new Blob([buffer as any], { type: effectiveMime });
            formData.append("file", audioBlob, fileExt);
            formData.append("model", "whisper-large-v3");
            formData.append("language", effectiveLangCode);

            const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${groqApiKey}`,
              },
              body: formData,
              signal: AbortSignal.timeout(12000),
            });

            if (groqRes.ok) {
              const groqData = (await groqRes.json()) as { text?: string };
              if (groqData.text && groqData.text.trim()) {
                finalTranscription = groqData.text.trim();
                usedProvider = "groq-whisper";
                console.log(`[Voice] Groq Whisper succeeded: "${finalTranscription.slice(0, 60)}..."`);
              }
            } else {
              const errText = await groqRes.text();
              console.warn(`[Voice] Groq Whisper returned ${groqRes.status}:`, errText.slice(0, 200));
            }
          } catch (groqErr: any) {
            console.warn("[Voice] Groq Whisper failed:", groqErr.message);
          }
        }

        // --- Engine 2: Local Whisper Service (always try the default 127.0.0.1:8000 endpoint) ---
        if (!finalTranscription) {
          try {
            console.log(`[Voice] Attempting Local faster-whisper at ${WHISPER_API_URL}...`);
            const formData = new FormData();
            const audioBlob = new Blob([buffer as any], { type: effectiveMime });
            formData.append("file", audioBlob, fileExt);
            formData.append("language", effectiveLangCode);

            const whisperRes = await fetch(WHISPER_API_URL, {
              method: "POST",
              body: formData,
              signal: AbortSignal.timeout(30000), // 30s — CPU inference on Hindi can take 15-20s
            });

            if (whisperRes.ok) {
              const whisperData = (await whisperRes.json()) as {
                transcript?: string;
                language?: string;
                language_name?: string;
              };
              if (whisperData.transcript && whisperData.transcript.trim()) {
                finalTranscription = whisperData.transcript.trim();
                finalDetectedCode = whisperData.language || effectiveLangCode;
                finalLanguageName = whisperData.language_name || effectiveLangName;
                usedProvider = "local-whisper";
                console.log(`[Voice] ✅ Local faster-whisper succeeded: "${finalTranscription.slice(0, 80)}"`);
              } else {
                console.warn(`[Voice] Local Whisper returned empty transcript.`);
              }
            } else {
              const errText = await whisperRes.text().catch(() => "");
              console.warn(`[Voice] Local Whisper responded ${whisperRes.status}: ${errText.slice(0, 120)}`);
            }
          } catch (localWhisperErr: any) {
            console.warn("[Voice] Local Whisper unavailable:", localWhisperErr.message);
          }
        }

        // --- Engine 3: Gemini Multimodal Audio Transcription ---
        if (!finalTranscription) {
          try {
            console.log(`[Voice] Attempting Gemini audio transcription...`);
            const geminiResult = await geminiService.transcribeAudio(buffer, effectiveMime, effectiveLangCode);
            if (geminiResult.transcription && geminiResult.transcription.trim()) {
              finalTranscription = geminiResult.transcription.trim();
              finalDetectedCode = geminiResult.detectedLanguage || effectiveLangCode;
              finalLanguageName = geminiResult.languageName || effectiveLangName;
              usedProvider = "gemini";
              console.log(`[Voice] Gemini audio transcription succeeded: "${finalTranscription.slice(0, 60)}..."`);
            }
          } catch (geminiErr: any) {
            console.warn("[Voice] Gemini audio transcription failed:", geminiErr.message);
          }
        }
      }

      // 2. Direct transcript from browser Web Speech API as safety fallback
      if (!finalTranscription && directTranscript && typeof directTranscript === "string" && directTranscript.trim()) {
        finalTranscription = directTranscript.trim();
        usedProvider = "browser-speech-recognition";
        console.log(`[Voice] Using browser Web Speech transcript fallback: "${finalTranscription.slice(0, 60)}..."`);
      }

      // 3. If no transcription could be obtained
      if (!finalTranscription) {
        if (!buffer || buffer.length <= 50) {
          res.status(400).json({
            error: "No audio captured. Please press the microphone button, speak about your craft, and release.",
          });
          return;
        }

        res.status(422).json({
          error: "Could not recognize speech in the recording. Please speak clearly or select a sample craft story below.",
        });
        return;
      }

      // Save record in database
      const voiceRecordId = `rec-${Date.now()}`;
      try {
        voiceRepository.saveRecording({
          id: voiceRecordId,
          seller_id: sellerId,
          product_id: draftId,
          audio_url: `audio-recording-${voiceRecordId}`,
          detected_language: finalDetectedCode,
          transcription: finalTranscription,
        });
      } catch (dbErr) {
        console.warn("[Voice] Non-fatal DB recording save warning:", dbErr);
      }

      // If draftId provided, update draft's transcription
      if (draftId) {
        try {
          productRepository.upsertDraft({
            id: draftId,
            seller_id: sellerId,
            description: finalTranscription,
          });
        } catch (dbErr) {
          console.warn("[Voice] Non-fatal draft transcription update warning:", dbErr);
        }
      }

      res.json({
        message: "Voice understood and transcribed",
        transcription: finalTranscription,
        detectedLanguage: finalDetectedCode,
        languageName: finalLanguageName,
        provider: usedProvider,
      });
    } catch (error: any) {
      console.error("Audio transcription error:", error);
      res.status(500).json({ error: error.message || "Voice processing failed. Please try speaking again." });
    }
  }
);

// Sarvam TTS endpoint for reading generated English description in artisan's native language
voiceRouter.post(
  "/tts",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, targetLanguage = "hi" } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Text is required for voice playback" });
        return;
      }

      const sarvamLangMap: Record<string, string> = {
        hi: "hi-IN",
        pa: "pa-IN",
        ta: "ta-IN",
        te: "te-IN",
        en: "en-IN",
      };

      const langCode = (targetLanguage in sarvamLangMap) ? targetLanguage : "hi";
      const sarvamLangCode = sarvamLangMap[langCode] || "hi-IN";

      // 1. Translate English description into artisan native language (if target is not English)
      let textToSpeak = text.trim();
      if (langCode !== "en") {
        try {
          textToSpeak = await geminiService.translateText(text.trim(), langCode as any);
        } catch (transErr) {
          console.error("Gemini translation error for TTS:", transErr);
          textToSpeak = text.trim();
        }
      }

      // 2. Call Sarvam AI TTS API
      const sarvamApiKey = config.sarvamApiKey;
      if (!sarvamApiKey) {
        throw new Error("SARVAM_API_KEY is missing from server configuration");
      }

      const sarvamRes = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": sarvamApiKey,
        },
        body: JSON.stringify({
          inputs: [textToSpeak],
          target_language_code: sarvamLangCode,
          speaker: "ritu",
          model: "bulbul:v3",
        }),
      });

      if (!sarvamRes.ok) {
        const errText = await sarvamRes.text();
        console.error(`Sarvam TTS error (${sarvamRes.status}):`, errText);
        res.status(500).json({ error: "Voice playback failed. Please try again." });
        return;
      }

      const sarvamData = (await sarvamRes.json()) as { audios?: string[] };
      const audioBase64 = sarvamData.audios && sarvamData.audios[0] ? sarvamData.audios[0] : null;

      if (!audioBase64) {
        res.status(500).json({ error: "Voice playback failed. Please try again." });
        return;
      }

      res.json({
        audioBase64,
        translatedText: textToSpeak,
        targetLanguage: langCode,
      });
    } catch (error: any) {
      console.error("TTS endpoint error:", error);
      res.status(500).json({ error: error.message || "Voice playback failed. Please try again." });
    }
  }
);
