import { createRoot } from "react-dom/client";
import App from "./RiskSentinel.jsx";

const el = document.getElementById("root");
try {
  createRoot(el).render(<App />);
} catch (err) {
  el.innerHTML =
    '<div style="padding:24px;font-family:system-ui;color:#BB0000">' +
    "Failed to start Proactive Risk Sentinel: " +
    String(err) +
    "</div>";
  // eslint-disable-next-line no-console
  console.error(err);
}
