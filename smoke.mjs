// Headless smoke test: server-render <App/> in Node to catch runtime/JSX
// errors and assert key content is present. (No browser available in CI.)
import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal browser-ish globals so Recharts/React don't trip during SSR.
globalThis.window = globalThis;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
class ResizeObserver { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver = ResizeObserver;

await build({
  entryPoints: ["src/RiskSentinel.jsx"],
  bundle: true,
  format: "cjs",
  jsx: "automatic",
  platform: "node",
  target: ["node18"],
  external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime", "recharts"],
  outfile: "dist/ssr.cjs",
  logLevel: "warning",
});

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const mod = require(path.join(__dirname, "dist/ssr.cjs"));
const noop = () => {};

const render = (name, el) => {
  try {
    return renderToStaticMarkup(el);
  } catch (e) {
    console.error(`✗ ${name} threw during render:\n`, e && e.stack ? e.stack : e);
    process.exit(1);
  }
};

// Whole app shell (default tab) + each individual view (every tab / chart type).
const cases = [
  ["App shell", React.createElement(mod.default), ["Proactive Risk Sentinel", "GRC 2026", "Access Sentinel", "Risk Correlator"]],
  ["Overview", React.createElement(mod.OverviewView, { onOpen: noop }), ["Composite Risk Score", "Risk Heat Map", "Recent Agent Activity", "Active SoD Violations"]],
  ["Access Sentinel", React.createElement(mod.AccessView, { onOpen: noop }), ["Segregation-of-Duties", "Role Mining", "Behavioural Fingerprint", "CHEM_TECH_042"]],
  ["Change Guardian", React.createElement(mod.ChangeView, { onOpen: noop }), ["Pending Change Requests", "Blast Radius", "Change History", "DEVK913842"]],
  ["Incident Responder", React.createElement(mod.IncidentView), ["Live Anomaly Feed", "IP Exfiltration", "Anomaly Distribution", "ZREC_FORMULA", "F-53", "ME21N"]],
  ["Risk Correlator", React.createElement(mod.CorrelatorView), ["What-If", "Cross-Domain Correlation", "Threshold Response", "Temporal Decay", "TemporalDecay"]],
];

let total = 0;
for (const [name, el, must] of cases) {
  const html = render(name, el);
  total += html.length;
  const missing = must.filter((s) => !html.includes(s));
  if (missing.length) {
    console.error(`✗ ${name}: missing content`, missing, `(rendered ${html.length} chars)`);
    process.exit(1);
  }
  console.log(`  ✓ ${name} — ${html.length} chars, ${must.length} checks`);
}
console.log(`✓ All 6 render cases passed (${total} chars total, no exceptions)`);
