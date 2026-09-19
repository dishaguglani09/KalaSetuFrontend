// End-to-end voice transcription API test
// Simulates exactly what the browser sends after a recording stops

import fs from "node:fs";
import path from "node:path";

async function test() {
  // 1. Login
  const loginRes = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "9876543210", password: "artisan123" }),
  });
  const { token } = await loginRes.json();

  // 2. Create a small silent WAV buffer (44 bytes header only) — simulates empty recording edge case
  const silentWav = Buffer.alloc(44);
  silentWav.write("RIFF", 0); // ChunkID
  silentWav.writeUInt32LE(36, 4); // ChunkSize (36 + 0 data bytes)
  silentWav.write("WAVE", 8); // Format
  silentWav.write("fmt ", 12); // Subchunk1ID
  silentWav.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  silentWav.writeUInt16LE(1, 20); // AudioFormat (PCM)
  silentWav.writeUInt16LE(1, 22); // NumChannels (mono)
  silentWav.writeUInt32LE(16000, 24); // SampleRate
  silentWav.writeUInt32LE(32000, 28); // ByteRate
  silentWav.writeUInt16LE(2, 32); // BlockAlign
  silentWav.writeUInt16LE(16, 34); // BitsPerSample
  silentWav.write("data", 36); // Subchunk2ID
  silentWav.writeUInt32LE(0, 40); // Subchunk2Size

  // 3. POST to /api/voice/transcribe
  const formData = new FormData();
  const blob = new Blob([silentWav], { type: "audio/wav" });
  formData.append("audio", blob, "recording.wav");
  formData.append("languageHint", "hi");
  formData.append("mimeType", "audio/wav");

  console.log("[Test] Sending audio to /api/voice/transcribe...");
  const res = await fetch("http://localhost:8080/api/voice/transcribe", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  console.log("[Test] HTTP status:", res.status);
  console.log("[Test] Response:", JSON.stringify(data, null, 2));

  if (res.status === 400 || res.status === 422) {
    console.log("\n✅ EMPTY AUDIO CORRECTLY REJECTED — server returned proper error message.");
    console.log(`  Error: "${data.error}"`);
  } else if (data.transcription) {
    console.log(`\n✅ Transcription returned: "${data.transcription}" (provider: ${data.provider})`);
  } else {
    console.log("\n⚠️  Unexpected response — check server logs.");
  }
}

test().catch(e => { console.error("Test error:", e.message); process.exit(1); });
