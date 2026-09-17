import { writeFileSync } from "fs";

const content = `import path from "node:path";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 8080;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
// Express 5 requires named wildcard parameter syntax: /{*path}
// Bare "*" is NOT supported in Express 5 (path-to-regexp v8)
app.get("/{*path}", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    res.status(404).json({ error: "API endpoint not found" });
    return;
  }

  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(\`\\u{1F680} KalaSetu server running on port \${port}\`);
  console.log(\`\\u{1F4F1} Frontend: http://localhost:\${port}\`);
  console.log(\`\\u{1F527} API: http://localhost:\${port}/api\`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\\u{1F6D1} Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\\u{1F6D1} Received SIGINT, shutting down gracefully");
  process.exit(0);
});
`;

writeFileSync("D:/kalasetu/server/node-build.ts", content, "utf8");
console.log("node-build.ts written successfully");
