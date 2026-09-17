import { readFileSync, writeFileSync } from "fs";

const envPath = "D:/kalasetu/.env";
let content = readFileSync(envPath, "utf8");

// Replace the emulator URL line with ADB reverse (localhost) URL
// adb reverse tcp:8080 tcp:8080 makes localhost:8080 on the phone point to the PC backend
content = content.replace(
  /^VITE_API_BASE_URL=http:\/\/10\.0\.2\.2:8080\/api$/m,
  "VITE_API_BASE_URL=http://localhost:8080/api"
);

// Update the comments to reflect the ADB reverse approach
content = content.replace(
  /# Android Emulator \(maps to host machine's localhost\):\nVITE_API_BASE_URL=http:\/\/localhost:8080\/api\n#\n# Physical Android device \(replace with your machine's local IP\):\n# VITE_API_BASE_URL=http:\/\/192\.168\.1\.X:8080\/api/,
  `# Physical Android device over USB with ADB reverse (RECOMMENDED for testing):
# Run: adb reverse tcp:8080 tcp:8080
# This maps localhost:8080 on the phone to your PC's port 8080.
# Works without knowing the PC's IP address.
VITE_API_BASE_URL=http://localhost:8080/api
#
# Android Emulator (maps to host machine's localhost):
# VITE_API_BASE_URL=http://10.0.2.2:8080/api
#
# Physical Android device over WiFi (replace with your machine's LAN IP):
# VITE_API_BASE_URL=http://192.168.1.X:8080/api`
);

writeFileSync(envPath, content, "utf8");
console.log("Done. New VITE_API_BASE_URL line:");
console.log(content.match(/^VITE_API_BASE_URL=.+$/m)?.[0]);
