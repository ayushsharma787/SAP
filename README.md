# Proactive Risk Sentinel

An interactive prototype dashboard for the **Proactive Risk Sentinel** — an
AI-Driven Continuous Risk Monitoring & Autonomous Compliance framework built on
**SAP GRC 2026 + Joule**, styled to be indistinguishable from a native
**SAP Fiori Horizon** application.

Built as a single-file React + Recharts app and **hosted on Streamlit** for
presentations to SAP solutions architects, GRC consultants, and product managers.

## What it demonstrates

Five SAP Icon Tab Bar views with realistic chemical-manufacturing mock data and
real SAP T-codes (`ZREC_FORMULA`, `XK01`, `ME21N`, `ME29N`, `MIRO`, `F-53`,
`SU01`, `PFCG`, `SM20/SM21`, `STMS`, `IW31`, `CO02`):

1. **Risk Overview** — 4 KPI cards (CRS radial gauge, SoD violations, open
   incidents, agent actions), 30-day CRS trend area chart with threshold bands,
   risk heat map (domain × business unit), and a live agent-activity timeline.
2. **Access Sentinel** — sortable SoD-violations table, role-mining
   (assigned vs. used) chart, and a behavioural-fingerprint radar.
3. **Change Guardian** — pending-change table with Approve/Block actions,
   blast-radius treemap, and a 30-day change-history timeline.
4. **Incident Responder** — a live (auto-updating) anomaly feed, a suspicious
   T-code sequence flow flagged as IP-exfiltration, and a 7-day anomaly
   distribution chart.
5. **Risk Correlator** — the innovation layer: composite-score gauge,
   CRS breakdown + formula, a cross-domain correlation matrix, the threshold
   action bar, and a **What-If Simulator** that recalculates the CRS live.

Plus: notification dropdown, Joule popover, slide-in detail panels,
count-up animations, staggered feed fade-in, and table sorting.

## Run it on Streamlit

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

The Streamlit page strips its own chrome and embeds the prototype full-bleed,
so it presents like a real SAP BTP app. `risk_sentinel.html` is **fully
self-contained** (React, Recharts, and all styling are inlined — no runtime CDN,
works offline), so this is the only thing the host needs.

### Deploy to Streamlit Community Cloud

Point a new app at this repo with `streamlit_app.py` as the entrypoint. The
prebuilt `risk_sentinel.html` is committed, so no Node build runs in the cloud —
only `requirements.txt` (Streamlit) is installed.

## Editing the dashboard

The whole React app lives in one file: [`src/RiskSentinel.jsx`](src/RiskSentinel.jsx).
After editing, rebuild the self-contained HTML:

```bash
npm install     # one-time (build/verify tooling only)
npm run build   # → regenerates risk_sentinel.html
npm run verify  # build + server-render smoke test + headless DOM mount test
```

The build (`build.mjs`) compiles Tailwind utilities to static CSS and bundles
React + Recharts + the app into one IIFE via esbuild, then inlines everything
into `risk_sentinel.html`.

## Notes

- Design tokens follow the SAP Fiori Horizon palette/typography exactly
  (shell `#354A5F`, brand `#0070F2`, semantic green/orange/red, 72 font chain,
  12px card radius, 1px `#E5E5E5` borders, 200ms transitions).
- Automated checks here cover code correctness (the app mounts and every view
  renders without errors). The final **visual** check should be done in a real
  browser — run the Streamlit app and click through the five tabs.
- Tune the app-window height via the `height=` argument in `streamlit_app.py`
  (default 900px) to suit your demo screen.
