// Build: compile Tailwind utilities + bundle the React app (esbuild),
// then assemble a single self-contained risk_sentinel.html (no runtime CDN).
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import esbuild from "esbuild";

mkdirSync("dist", { recursive: true });

console.log("→ Tailwind: compiling utility CSS …");
execSync(
  "npx tailwindcss -c tailwind.config.js -i src/styles.css -o dist/tw.css --minify",
  { stdio: "inherit" }
);

console.log("→ esbuild: bundling React + Recharts + app …");
await esbuild.build({
  entryPoints: ["src/mount.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  jsx: "automatic",
  legalComments: "none",
  target: ["es2018"],
  loader: { ".js": "jsx" },
  outfile: "dist/app.js",
  logLevel: "warning",
});

const css = readFileSync("dist/tw.css", "utf8");
const js = readFileSync("dist/app.js", "utf8");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Proactive Risk Sentinel</title>
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<script>
${js}
</script>
</body>
</html>
`;

writeFileSync("risk_sentinel.html", html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`✓ Wrote risk_sentinel.html (${kb} KB, self-contained)`);
