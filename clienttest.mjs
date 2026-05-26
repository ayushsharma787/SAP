// Client-render test: execute the built, self-contained bundle in jsdom to
// confirm it actually mounts (createRoot + effects + timers) without throwing.
// jsdom has no layout engine, so charts render at 0px — we only assert the app
// mounts and key content appears, and that no *real* errors are thrown.
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const html = readFileSync("risk_sentinel.html", "utf8");
const errors = [];
const IGNORE = /Not implemented|getBBox|getComputedTextLength|getContext|HTMLCanvas/i;

const vc = new VirtualConsole();
vc.on("jsdomError", (e) => { if (!IGNORE.test(String(e.message))) errors.push("jsdomError: " + e.message); });

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
    window.addEventListener("error", (e) => { if (!IGNORE.test(String(e.message))) errors.push("window.error: " + e.message); });
    window.addEventListener("unhandledrejection", (e) => errors.push("unhandledrejection: " + (e.reason && e.reason.message)));
  },
});

await new Promise((r) => setTimeout(r, 900)); // allow mount + count-up rAF + interval tick

const root = dom.window.document.getElementById("root");
const text = (root && root.textContent) || "";
const checks = ["Proactive Risk Sentinel", "Composite Risk Score", "Active SoD Violations", "Risk Heat Map", "Recent Agent Activity"];
const missing = checks.filter((c) => !text.includes(c));
const childCount = root ? root.querySelectorAll("*").length : 0;

let fail = false;
if (childCount < 50) { console.error(`✗ #root has only ${childCount} nodes — app did not mount`); fail = true; }
if (missing.length) { console.error("✗ Missing rendered content:", missing); fail = true; }
if (errors.length) { console.error("✗ Runtime errors:\n  " + errors.join("\n  ")); fail = true; }

if (fail) process.exit(1);
console.log(`✓ Client mount ok — ${childCount} DOM nodes under #root, all ${checks.length} content checks passed, no runtime errors`);
dom.window.close();
