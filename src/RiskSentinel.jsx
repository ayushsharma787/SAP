/*
 * Proactive Risk Sentinel — AI-Driven Continuous Risk Monitoring
 * SAP Fiori Horizon prototype.  Single-file React app.
 *
 * For reuse in Claude Artifacts / a Vite project, the canonical imports are:
 *   import React, { useState, useEffect, useMemo, useRef } from 'react';
 *   import { AreaChart, Area, BarChart, Bar, PieChart, Pie, RadarChart, Radar,
 *            Treemap, ResponsiveContainer, ... } from 'recharts';
 *   import { Shield, AlertTriangle, Activity, ... } from 'lucide-react';
 * (Here, icons are inlined as SVGs so there are zero runtime CDN dependencies.)
 */
import { useState, useEffect, useMemo, useRef, Component } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceArea, ReferenceDot, BarChart, Bar, Cell, LineChart, Line,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap,
} from "recharts";

/* ============================================================
   Design tokens (JS mirror of CSS vars)
   ============================================================ */
const C = {
  shell: "#354A5F", bg: "#F7F7F7", card: "#FFFFFF", border: "#E5E5E5",
  text: "#32363A", label: "#556B82", brand: "#0070F2", brandHover: "#0064D9",
  good: "#256F3A", goodBg: "#F5FAF6", warn: "#E76500", warnBg: "#FFF8F0",
  bad: "#BB0000", badBg: "#FFF0F0", crit: "#8B0000", neutral: "#D9D9D9",
};

function zone(v) {
  if (v <= 30) return { label: "Low", color: C.good, action: "Log & Monitor" };
  if (v <= 60) return { label: "Medium", color: C.warn, action: "Restrict & Notify" };
  if (v <= 85) return { label: "High", color: C.bad, action: "Suspend · Dual Approval · CISO Alert" };
  return { label: "Critical", color: C.crit, action: "Immediate Lockout · Session Kill · Auto-Incident" };
}
const scoreColor = (v) => zone(v).color;
const RISK_PILL = { Low: "sap-pill-good", Medium: "sap-pill-warn", High: "sap-pill-bad", Critical: "sap-pill-crit" };
const RANK = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const SEV_COLOR = { green: C.good, orange: C.warn, red: C.bad };

function dateLabel(daysAgo) {
  const d = new Date(2026, 4, 26);
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ============================================================
   Inline icons (Lucide path data)
   ============================================================ */
const mkIcon = (children) => ({ size = 18, color = "currentColor", strokeWidth = 2, style, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    {children}
  </svg>
);
const Icon = {
  Shield: mkIcon(<><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></>),
  Alert: mkIcon(<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>),
  Activity: mkIcon(<path d="M22 12h-4l-3 9L9 3l-3 9H2" />),
  Eye: mkIcon(<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>),
  Bell: mkIcon(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>),
  User: mkIcon(<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  Sparkles: mkIcon(<><path d="M9.94 14.06A2 2 0 0 0 8.5 12.6L2.4 11a.5.5 0 0 1 0-1l6.1-1.6A2 2 0 0 0 9.94 6.94L11.5.85a.5.5 0 0 1 1 0l1.56 6.09A2 2 0 0 0 15.5 8.4L21.6 10a.5.5 0 0 1 0 1l-6.1 1.6a2 2 0 0 0-1.44 1.46L12.5 20.15a.5.5 0 0 1-1 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></>),
  ChevronRight: mkIcon(<path d="m9 18 6-6-6-6" />),
  ChevronDown: mkIcon(<path d="m6 9 6 6 6-6" />),
  Clock: mkIcon(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
  TrendingUp: mkIcon(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>),
  TrendingDown: mkIcon(<><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></>),
  ArrowUp: mkIcon(<><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></>),
  ArrowRight: mkIcon(<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>),
  Lock: mkIcon(<><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
  FileText: mkIcon(<><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></>),
  Settings: mkIcon(<><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>),
  X: mkIcon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>),
  Check: mkIcon(<><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>),
  XCircle: mkIcon(<><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></>),
  Zap: mkIcon(<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />),
  GitBranch: mkIcon(<><line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></>),
  Layers: mkIcon(<><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" /></>),
  Sliders: mkIcon(<><line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" /><line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" /><line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" /><line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" /></>),
  Search: mkIcon(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>),
  Refresh: mkIcon(<><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>),
};

/* ============================================================
   Hooks & small utilities
   ============================================================ */
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  const raf = useRef();
  useEffect(() => {
    const from = fromRef.current;
    const start = now();
    cancelAnimationFrame(raf.current);
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  useEffect(() => { fromRef.current = val; });
  return val;
}

function useSortable(rows, initialKey, initialDir = "desc") {
  const [sortKey, setKey] = useState(initialKey);
  const [dir, setDir] = useState(initialDir);
  const sorted = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      const x = a[sortKey], y = b[sortKey];
      const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return dir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [rows, sortKey, dir]);
  const toggle = (k) => {
    if (k === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setKey(k); setDir("desc"); }
  };
  return { sorted, sortKey, dir, toggle };
}

class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { e: null }; }
  static getDerivedStateFromError(e) { return { e }; }
  render() {
    if (this.state.e) return <div className="sap-label" style={{ padding: 16 }}>Visualization unavailable.</div>;
    return this.props.children;
  }
}

/* ============================================================
   Mock data — chemical-manufacturing SAP GRC context
   ============================================================ */
const CRS_VALUES = [25, 24, 26, 28, 27, 30, 33, 31, 38, 44, 57, 72, 64, 55, 47, 45, 46, 49, 55, 63, 77, 88, 80, 67, 57, 50, 46, 44, 43, 42];
const CRS_EVENTS = { 11: "Contractor SoD conflict detected", 14: "Auto-mitigation applied", 21: "Terminated contractor access detected", 24: "Auto-mitigation batch" };
const TREND = CRS_VALUES.map((crs, i) => ({ label: dateLabel(29 - i), crs, day: i + 1, event: CRS_EVENTS[i] || null }));
const SPARK = TREND.slice(23).map((d) => ({ v: d.crs }));
const DEPT_BARS = [{ d: "R&D", v: 6 }, { d: "Prod", v: 5 }, { d: "Proc", v: 7 }, { d: "Fin", v: 3 }, { d: "HR", v: 2 }];
const ACTION_DONUT = [{ name: "Auto-resolved", value: 139, fill: C.good }, { name: "Escalated", value: 11, fill: C.bad }, { name: "Pending", value: 6, fill: C.warn }];
const INC_SEV = [{ label: "Critical", v: 2, color: C.crit }, { label: "High", v: 3, color: C.bad }, { label: "Medium", v: 2, color: C.warn }];

const BUS_UNITS = ["R&D", "Production", "Procurement", "Finance", "HR"];
const HEAT = {
  Access: [58, 44, 71, 63, 22],
  Change: [49, 67, 38, 41, 18],
  Incident: [35, 52, 29, 74, 12],
};

const AGENT_FEED = [
  { id: 1, agent: "Access Sentinel", sev: "red", text: "Auto-suspended T-code ZREC_FORMULA for CHEM_TECH_042 — CRS 72 (High)", time: "3 min ago", user: "CHEM_TECH_042", tcode: "ZREC_FORMULA", crs: 72, action: "Access auto-suspended; manager notified", detail: "Recipe-management authorization invoked by a user transferred to Marketing. SoD policy ACC-014 violated." },
  { id: 2, agent: "Incident Responder", sev: "red", text: "Geo-anomaly: IT_BASIS_041 cleared SM20 audit logs from off-network IP — CRS 86 (Critical)", time: "11 min ago", user: "IT_BASIS_041", tcode: "SM20", crs: 86, action: "Session killed; incident auto-created", detail: "Audit-log deletion from an unrecognized geo-location during off-hours. Evidence chain preserved." },
  { id: 3, agent: "Change Guardian", sev: "orange", text: "Blocked transport DEVK913842 — blast radius 64, missing dual approval", time: "26 min ago", user: "CONT_MAINT_019", tcode: "STMS", crs: 64, action: "Transport blocked pending dual approval", detail: "Transport grants vendor-create to a contractor whose engagement ended. Routed for second approver." },
  { id: 4, agent: "Risk Correlator", sev: "orange", text: "Correlation spike: SoD violations ↔ pending transports (Procurement) r=0.73", time: "38 min ago", user: "PROC_USR_017", tcode: "—", crs: 47, action: "Cross-domain alert raised", detail: "Access × Change correlation exceeded 0.70 in Procurement. Recommend joint review of the affected users." },
  { id: 5, agent: "Access Sentinel", sev: "green", text: "Auto-revoked stale role Z_VENDOR_CREATE from CONT_LAB_007 (contract ended)", time: "52 min ago", user: "CONT_LAB_007", tcode: "XK01", crs: 18, action: "Role revoked automatically", detail: "Contractor lab role retained vendor-create after contract end. Removed per de-provisioning policy." },
  { id: 6, agent: "Incident Responder", sev: "orange", text: "Off-hours access burst: PLANT_OPS_033 — 14 logins 02:00–04:00", time: "1 hr ago", user: "PLANT_OPS_033", tcode: "CO02", crs: 41, action: "Flagged for supervisor review", detail: "Repeated production-order changes during night shift outside the user's 90-day baseline." },
  { id: 7, agent: "Change Guardian", sev: "green", text: "Approved transport DEVK913790 — blast radius 12 (Low), regulatory clear", time: "1 hr ago", user: "PLANT_OPS_033", tcode: "STMS", crs: 12, action: "Auto-approved", detail: "Reactor R-204 tolerance change within validated range. OSHA check passed." },
  { id: 8, agent: "Access Sentinel", sev: "red", text: "Escalated firefighter overuse: FIN_CTRL_008 activated FF ID 3× this week", time: "2 hr ago", user: "FIN_CTRL_008", tcode: "F-53", crs: 63, action: "Escalated to GRC lead", detail: "Emergency-access (firefighter) ID used three times in seven days without incident tickets." },
  { id: 9, agent: "Risk Correlator", sev: "green", text: "CRS recalculated 49 → 42 after auto-mitigation batch (12 actions)", time: "2 hr ago", user: "—", tcode: "—", crs: 42, action: "Composite score updated", detail: "Twelve automated mitigations reduced the composite risk score by 7 points." },
  { id: 10, agent: "Incident Responder", sev: "red", text: "Sequence ZREC_FORMULA → F-53 → ME21N matched IP-exfil template — CISO alerted", time: "3 hr ago", user: "CHEM_TECH_042", tcode: "ZREC_FORMULA", crs: 76, action: "Escalated to CISO", detail: "Recipe view followed by financial posting and PO creation matches the IP-exfiltration pattern." },
];

const SOD_ROWS = [
  { id: "PROC_USR_017", name: "Anika Patel", roles: "Vendor Create (XK01) + PO Approve (ME29N)", risk: "Medium", crs: 14, detected: "2026-05-26 09:23", status: "Pending Review" },
  { id: "CHEM_TECH_042", name: "Dr. Priya Sharma", roles: "Recipe Mgmt (ZREC_FORMULA) + Marketing Export", risk: "High", crs: 22, detected: "2026-05-26 08:11", status: "Auto-Mitigated" },
  { id: "CONT_MAINT_019", name: "James Rodriguez", roles: "Maint Order (IW31) + Vendor Payment (F-53)", risk: "Critical", crs: 31, detected: "2026-05-25 22:47", status: "Escalated" },
  { id: "FIN_CTRL_008", name: "Sarah Williams", roles: "Invoice Verify (MIRO) + Vendor Payment (F-53)", risk: "High", crs: 24, detected: "2026-05-26 07:02", status: "Escalated" },
  { id: "PLANT_OPS_033", name: "Michael Chen", roles: "Prod Order Change (CO02) + Goods Receipt", risk: "Medium", crs: 12, detected: "2026-05-26 03:18", status: "Pending Review" },
  { id: "CONT_LAB_007", name: "Lisa Müller", roles: "Batch Record Read + Vendor Create (XK01)", risk: "Critical", crs: 29, detected: "2026-05-25 19:33", status: "Auto-Mitigated" },
  { id: "HR_ADMIN_025", name: "Rajesh Kumar", roles: "User Maint (SU01) + Role Maint (PFCG)", risk: "Low", crs: 7, detected: "2026-05-26 06:50", status: "Auto-Mitigated" },
  { id: "IT_BASIS_041", name: "Tom Anderson", roles: "Transport Mgmt (STMS) + Audit Log (SM20)", risk: "Critical", crs: 34, detected: "2026-05-26 01:05", status: "Escalated" },
  { id: "PROC_USR_022", name: "Daniel Brooks", roles: "PO Create (ME21N) + Invoice Verify (MIRO)", risk: "Medium", crs: 13, detected: "2026-05-25 16:20", status: "Pending Review" },
  { id: "CHEM_LAB_058", name: "Maria Garcia", roles: "Recipe View (ZREC_FORMULA) + PO Create (ME21N)", risk: "High", crs: 21, detected: "2026-05-25 14:09", status: "Pending Review" },
].map((r) => ({ ...r, rank: RANK[r.risk] }));

const ROLE_MINING = [
  { user: "CONT_MAINT_019", assigned: 142, used: 18 },
  { user: "IT_BASIS_041", assigned: 210, used: 96 },
  { user: "FIN_CTRL_008", assigned: 128, used: 71 },
  { user: "PROC_USR_017", assigned: 96, used: 52 },
  { user: "CHEM_TECH_042", assigned: 88, used: 23 },
];

const FP_AXES = ["T-code Diversity", "Access Hours", "Data Volume", "Role Sensitivity", "Cross-System"];
const FINGERPRINTS = {
  CHEM_TECH_042: { cur: [82, 70, 88, 75, 64], base: [45, 40, 50, 55, 30] },
  IT_BASIS_041: { cur: [76, 88, 72, 92, 80], base: [60, 55, 58, 70, 62] },
  FIN_CTRL_008: { cur: [58, 64, 70, 85, 55], base: [50, 45, 55, 72, 40] },
  CONT_MAINT_019: { cur: [40, 86, 48, 70, 52], base: [30, 35, 38, 40, 28] },
  PROC_USR_017: { cur: [62, 48, 66, 58, 50], base: [55, 42, 60, 52, 45] },
};

const CHANGES = [
  { id: "DEVK913842", desc: "Add Z_VENDOR_CREATE to maintenance role", req: "CONT_MAINT_019", blast: 64, flags: ["EPA"], ai: "Grants vendor creation to a contractor whose engagement ended; high SoD exposure.", status: "Blocked" },
  { id: "DEVK913790", desc: "Update batch tolerance for reactor R-204", req: "PLANT_OPS_033", blast: 12, flags: ["OSHA"], ai: "Minor config change within validated range; low downstream impact.", status: "Approved" },
  { id: "DEVK913855", desc: "Activate firefighter ID FF_FIN_03", req: "FIN_CTRL_008", blast: 47, flags: [], ai: "Third FF activation this week; recommend dual approval before release.", status: "Pending" },
  { id: "DEVK913861", desc: "Modify ZREC_FORMULA authorization group", req: "CHEM_TECH_042", blast: 78, flags: ["OSHA", "EPA"], ai: "Touches recipe IP across 3 plants; affects 214 users — escalate.", status: "Pending" },
  { id: "DEVK913702", desc: "Decommission legacy role Z_LAB_LEGACY", req: "HR_ADMIN_025", blast: 23, flags: [], ai: "Removes unused role; no active assignments at risk.", status: "Approved" },
  { id: "DEVK913870", desc: "Grant STMS import to IT_BASIS_041", req: "IT_BASIS_041", blast: 88, flags: [], ai: "Elevates transport control for a user with a recent audit-log anomaly.", status: "Blocked" },
  { id: "DEVK913833", desc: "Change PO release-strategy threshold", req: "PROC_USR_017", blast: 41, flags: [], ai: "Alters approval limits in Procurement; moderate financial exposure.", status: "Pending" },
];
const CHANGE_HISTORY = [
  { day: 2, blast: 14, id: "DEVK913510" }, { day: 5, blast: 33, id: "DEVK913548" },
  { day: 8, blast: 21, id: "DEVK913602" }, { day: 11, blast: 64, id: "DEVK913671" },
  { day: 13, blast: 47, id: "DEVK913705" }, { day: 16, blast: 28, id: "DEVK913744" },
  { day: 18, blast: 78, id: "DEVK913781" }, { day: 21, blast: 55, id: "DEVK913818" },
  { day: 23, blast: 41, id: "DEVK913833" }, { day: 26, blast: 88, id: "DEVK913870" },
  { day: 28, blast: 23, id: "DEVK913702" }, { day: 30, blast: 36, id: "DEVK913842" },
];

const ANOMALY_POOL = [
  { type: "Failed Login Burst", user: "CONT_MAINT_019", sev: "High", impact: 18 },
  { type: "Off-Hours Access", user: "PLANT_OPS_033", sev: "Medium", impact: 9 },
  { type: "Suspicious T-code Sequence", user: "CHEM_TECH_042", sev: "Critical", impact: 34 },
  { type: "Geo-Anomaly", user: "IT_BASIS_041", sev: "Critical", impact: 28 },
  { type: "Failed Login Burst", user: "PROC_USR_017", sev: "Medium", impact: 7 },
  { type: "Off-Hours Access", user: "FIN_CTRL_008", sev: "High", impact: 15 },
  { type: "Geo-Anomaly", user: "CONT_LAB_007", sev: "High", impact: 16 },
  { type: "Suspicious T-code Sequence", user: "FIN_CTRL_008", sev: "High", impact: 21 },
];
const SEQUENCE = [
  { tcode: "ZREC_FORMULA", desc: "Recipe / formulation view", time: "02:14:07" },
  { tcode: "F-53", desc: "Post vendor payment", time: "02:15:42" },
  { tcode: "ME21N", desc: "Create purchase order", time: "02:17:09" },
];
const ANOMALY_DIST = [
  [5, 3, 1, 0], [7, 4, 2, 1], [4, 6, 1, 0], [9, 5, 3, 2], [6, 8, 2, 1], [11, 6, 4, 2], [8, 5, 3, 3],
].map((v, i) => ({ label: dateLabel(6 - i), "Failed Login": v[0], "Off-Hours": v[1], "T-code Seq": v[2], "Geo-Anomaly": v[3] }));

const CORR = [
  [1, 0.73, 0.61],
  [0.73, 1, 0.45],
  [0.61, 0.45, 1],
];
const CORR_DOMAINS = ["Access", "Change", "Incident"];
const CORR_NOTE = {
  "0-1": "Recent SoD violations correlate with pending transport requests from the same users.",
  "0-2": "Over-provisioned access precedes anomalous T-code sequences in audit logs.",
  "1-2": "High blast-radius changes are followed by elevated off-hours activity.",
};
const THRESHOLDS = [
  { from: 0, to: 30, w: 31, color: C.good, label: "Log & Monitor" },
  { from: 31, to: 60, w: 30, color: C.warn, label: "Restrict & Notify" },
  { from: 61, to: 85, w: 25, color: C.bad, label: "Suspend · Dual Approval · CISO Alert" },
  { from: 86, to: 100, w: 14, color: C.crit, label: "Lockout · Session Kill · Auto-Incident" },
];
const PRIV_LABEL = ["—", "Standard", "Power", "Admin", "Super-Admin", "Firefighter"];

/* ============================================================
   Primitive components
   ============================================================ */
function Pill({ kind, children }) {
  const map = { good: "sap-pill-good", warn: "sap-pill-warn", bad: "sap-pill-bad", crit: "sap-pill-crit", info: "sap-pill-info", neutral: "sap-pill-neutral" };
  return <span className={`sap-pill ${map[kind] || map.neutral}`}>{children}</span>;
}
function RiskPill({ level }) {
  return <span className={`sap-pill ${RISK_PILL[level]}`}>{level}</span>;
}
function StatusPill({ status }) {
  const m = { "Auto-Mitigated": "good", "Auto-approved": "good", Approved: "good", "Pending Review": "warn", Pending: "warn", Escalated: "bad", Blocked: "bad" };
  return <Pill kind={m[status] || "neutral"}>{status}</Pill>;
}
function AgentBadge({ name }) {
  const I = { "Access Sentinel": Icon.Shield, "Change Guardian": Icon.GitBranch, "Incident Responder": Icon.Zap, "Risk Correlator": Icon.Layers }[name] || Icon.Activity;
  return (
    <span className="sap-pill sap-pill-info" style={{ fontWeight: 600 }}>
      <I size={12} color={C.brand} /> {name}
    </span>
  );
}
function Card({ title, right, children, className = "", style, pad = true }) {
  return (
    <div className={`sap-card ${className}`} style={style}>
      {(title || right) && (
        <div className="flex items-center justify-between" style={{ padding: "14px 16px 0 16px" }}>
          {title && <div className="sap-card-title">{title}</div>}
          {right}
        </div>
      )}
      <div style={{ padding: pad ? 16 : 0 }}>{children}</div>
    </div>
  );
}
function ChartFrame({ height, children }) {
  return <div style={{ width: "100%", height }}><ErrorBoundary><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></ErrorBoundary></div>;
}
function SortHead({ label, k, sort, align = "left" }) {
  const active = sort.sortKey === k;
  return (
    <th className="sortable" onClick={() => sort.toggle(k)} style={{ textAlign: align }}>
      <span className="inline-flex items-center" style={{ gap: 4 }}>
        {label}
        <span style={{ opacity: active ? 1 : 0.25, fontSize: 9 }}>{active && sort.dir === "asc" ? "▲" : "▼"}</span>
      </span>
    </th>
  );
}

/* ---------- Radial gauge (custom SVG, animated) ---------- */
const polar = (cx, cy, r, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
function arcPath(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}
function Gauge({ value, size = 180, stroke = 16, segments = null, caption, duration = 800 }) {
  const disp = useCountUp(value, duration);
  const cx = size / 2, cy = size / 2, r = (size - stroke) / 2;
  const START = 225, SWEEP = 270;
  const z = zone(value);
  const factor = value > 0 ? disp / value : 0;
  let acc = START;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={arcPath(cx, cy, r, START, START + SWEEP)} fill="none" stroke="#ECEFF2" strokeWidth={stroke} strokeLinecap="round" />
        {segments
          ? segments.map((s, i) => {
              const sweep = SWEEP * (s.value / 100) * factor;
              const p = arcPath(cx, cy, r, acc, acc + Math.max(sweep, 0.001));
              acc += sweep;
              return <path key={i} d={p} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="butt" />;
            })
          : <path d={arcPath(cx, cy, r, START, START + SWEEP * (disp / 100))} fill="none" stroke={z.color} strokeWidth={stroke} strokeLinecap="round" />}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: size * 0.3, fontWeight: 300, lineHeight: 1, color: z.color }}>{Math.round(disp)}</div>
        {caption && <div className="sap-label" style={{ marginTop: 4 }}>{caption}</div>}
        <div className="sap-pill" style={{ marginTop: 6, color: z.color, background: "transparent", padding: 0, fontSize: 12 }}>{z.label}</div>
      </div>
    </div>
  );
}

/* ============================================================
   Shell bar + notifications + tabs
   ============================================================ */
function SapLogo({ height = 28 }) {
  return (
    <svg height={height} viewBox="0 0 100 60" style={{ display: "block" }} role="img" aria-label="SAP">
      <defs>
        <linearGradient id="sapGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#0A6CB4" />
          <stop offset="55%" stopColor="#0E97D8" />
          <stop offset="100%" stopColor="#1CB8EE" />
        </linearGradient>
      </defs>
      <polygon points="0,0 100,0 74,60 0,60" fill="url(#sapGrad)" />
      <text x="7" y="46" textLength="62" lengthAdjust="spacingAndGlyphs"
        fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="40" fill="#FFFFFF">SAP</text>
    </svg>
  );
}

function ShellBar({ onOpenAction }) {
  const [notifOpen, setNotif] = useState(false);
  const [jouleOpen, setJoule] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setNotif(false); setJoule(false); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const critical = AGENT_FEED.filter((a) => a.sev === "red");
  return (
    <div style={{ height: 44, minHeight: 44, background: C.shell, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "relative", zIndex: 20 }}>
      <div className="flex items-center" style={{ gap: 12 }}>
        <SapLogo height={28} />
        <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.3)" }} />
        <span style={{ fontSize: 16, fontWeight: 600 }}>Proactive Risk Sentinel</span>
        <span style={{ fontSize: 11, opacity: 0.65, marginLeft: 4 }}>GRC 2026 · Joule</span>
      </div>
      <div className="flex items-center" style={{ gap: 14 }} ref={ref}>
        <div style={{ position: "relative" }}>
          <button onClick={() => { setNotif((v) => !v); setJoule(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, position: "relative", display: "flex" }} aria-label="Notifications">
            <Icon.Bell size={18} color="#fff" />
            <span style={{ position: "absolute", top: -2, right: -3, background: C.bad, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 8, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>5</span>
          </button>
          {notifOpen && (
            <div className="sap-dropdown" style={{ color: C.text }}>
              <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 14 }}>Critical Alerts</strong>
                <span className="sap-label" style={{ color: C.brand, cursor: "pointer" }}>Mark all read</span>
              </div>
              <div className="scroll-area" style={{ maxHeight: 320 }}>
                {critical.map((a) => (
                  <div key={a.id} onClick={() => { onOpenAction(a); setNotif(false); }} style={{ padding: "10px 14px", borderBottom: "1px solid #f2f2f2", cursor: "pointer", display: "flex", gap: 10 }} className="hover:bg-sap-rowHover">
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: SEV_COLOR[a.sev], marginTop: 5, flex: "none" }} />
                    <div>
                      <div style={{ fontSize: 13, lineHeight: 1.35 }}>{a.text}</div>
                      <div className="sap-label" style={{ marginTop: 2 }}>{a.agent} · {a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 14px", textAlign: "center", color: C.brand, fontSize: 13, cursor: "pointer" }}>View all notifications</div>
            </div>
          )}
        </div>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#5B7184", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>AS</div>
        <div style={{ position: "relative" }}>
          <button onClick={() => { setJoule((v) => !v); setNotif(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }} aria-label="Joule">
            <Icon.Sparkles size={18} color="#fff" />
          </button>
          {jouleOpen && (
            <div className="sap-dropdown" style={{ width: 300, color: C.text }}>
              <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, alignItems: "center" }}>
                <Icon.Sparkles size={16} color={C.brand} /><strong style={{ fontSize: 14 }}>Joule</strong>
              </div>
              <div style={{ padding: "12px 14px", fontSize: 13, lineHeight: 1.5 }}>
                Composite Risk Score is <strong style={{ color: C.warn }}>42 (Medium)</strong>. Two critical incidents need review — the terminated-contractor access on <span className="mono">CONT_MAINT_019</span> and the audit-log clearance on <span className="mono">IT_BASIS_041</span>. Shall I draft mitigation tasks?
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key: "overview", label: "Risk Overview", icon: Icon.Activity },
  { key: "access", label: "Access Sentinel", icon: Icon.Shield, badge: 23, badgeKind: "bad" },
  { key: "change", label: "Change Guardian", icon: Icon.GitBranch, badge: 3, badgeKind: "warn" },
  { key: "incident", label: "Incident Responder", icon: Icon.Zap, badge: 7, badgeKind: "warn" },
  { key: "correlator", label: "Risk Correlator", icon: Icon.Layers, badge: "AI", badgeKind: "info" },
];
function TabBar({ active, onChange }) {
  const bk = { bad: { c: "#fff", b: C.bad }, warn: { c: "#fff", b: C.warn }, info: { c: C.brand, b: "#EAF2FE" } };
  return (
    <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10 }}>
      <div className="max-w-content mx-auto flex" style={{ padding: "0 12px", overflowX: "auto" }}>
        {TABS.map((t) => {
          const A = active === t.key;
          return (
            <button key={t.key} className={`sap-tab ${A ? "sap-tab-active" : ""}`} onClick={() => onChange(t.key)}>
              <t.icon size={16} color={A ? C.brand : C.label} />
              {t.label}
              {t.badge != null && (
                <span className="sap-tab-badge" style={{ background: bk[t.badgeKind].b, color: bk[t.badgeKind].c }}>{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Side panel
   ============================================================ */
function SidePanel({ detail, onClose }) {
  if (!detail) return null;
  return (
    <>
      <div className="sap-overlay" onClick={onClose} />
      <div className="sap-sidepanel">
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="sap-label">{detail.kicker}</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{detail.title}</div>
            {detail.badge && <div style={{ marginTop: 8 }}>{detail.badge}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.label }} aria-label="Close"><Icon.X size={20} /></button>
        </div>
        <div className="scroll-area" style={{ padding: 20, flex: 1 }}>
          {detail.note && <div style={{ background: C.bg, borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>{detail.note}</div>}
          {detail.rows && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 12px", marginBottom: 16 }}>
              {detail.rows.map((r, i) => (
                <div key={i}>
                  <div className="sap-label">{r.k}</div>
                  <div style={{ fontSize: 14, marginTop: 2 }} className={r.mono ? "mono" : ""}>{r.v}</div>
                </div>
              ))}
            </div>
          )}
          {detail.evidence && (
            <>
              <div className="sap-card-title" style={{ fontSize: 14, marginBottom: 8 }}>Evidence Chain</div>
              <div className="sap-timeline" style={{ marginBottom: 8 }}>
                {detail.evidence.map((e, i) => (
                  <div key={i} style={{ position: "relative", paddingBottom: 14 }}>
                    <span className="sap-timeline-dot" style={{ background: e.color || C.brand }} />
                    <div style={{ fontSize: 13 }}>{e.text}</div>
                    <div className="sap-label">{e.time}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
          {(detail.actions || [{ label: "Acknowledge", kind: "primary" }, { label: "Escalate", kind: "ghost" }]).map((a, i) => (
            <button key={i} className={`sap-btn ${a.kind === "primary" ? "sap-btn-primary" : "sap-btn-ghost"}`} onClick={onClose}>{a.label}</button>
          ))}
        </div>
      </div>
    </>
  );
}
function actionToDetail(a) {
  return {
    kicker: "Agent Action", title: a.agent, badge: <Pill kind={a.sev === "red" ? "bad" : a.sev === "orange" ? "warn" : "good"}>CRS {a.crs} · {zone(a.crs).label}</Pill>,
    note: a.detail,
    rows: [
      { k: "User", v: a.user, mono: true }, { k: "T-code", v: a.tcode, mono: true },
      { k: "Composite Risk Score", v: a.crs }, { k: "Detected", v: a.time },
      { k: "Recommended Action", v: a.action }, { k: "Domain", v: a.agent.replace(" Sentinel", " · Access").replace(" Guardian", " · Change").replace(" Responder", " · Incident").replace("Risk Correlator", "Cross-domain") },
    ],
    evidence: [
      { text: `Signal captured by ${a.agent}`, time: a.time, color: SEV_COLOR[a.sev] },
      { text: "Policy evaluation completed — threshold breached", time: a.time, color: C.warn },
      { text: a.action, time: a.time, color: C.good },
    ],
  };
}

/* ============================================================
   VIEW 1 — Risk Overview
   ============================================================ */
function HeatTooltip({ data, pos }) {
  if (!data) return null;
  return (
    <div style={{ position: "fixed", left: pos.x + 14, top: pos.y + 14, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.12)", padding: "8px 10px", fontSize: 12, zIndex: 50, pointerEvents: "none" }}>
      <div style={{ fontWeight: 600 }}>{data.domain} × {data.bu}</div>
      <div style={{ color: scoreColor(data.score) }}>CRS {data.score} · {zone(data.score).label}</div>
      <div className="sap-label">{zone(data.score).action}</div>
    </div>
  );
}
function HeatMap() {
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      <div style={{ display: "grid", gridTemplateColumns: "84px repeat(5, 1fr)", gap: 6 }}>
        <div />
        {BUS_UNITS.map((b) => <div key={b} className="sap-label" style={{ textAlign: "center", fontWeight: 600 }}>{b}</div>)}
        {Object.keys(HEAT).map((dom) => (
          <Fragmentish key={dom}>
            <div className="sap-label" style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>{dom}</div>
            {HEAT[dom].map((s, i) => (
              <div key={i} className="heat-cell" onMouseEnter={() => setHover({ domain: dom, bu: BUS_UNITS[i], score: s })} onMouseLeave={() => setHover(null)}
                style={{ background: scoreColor(s), color: "#fff", borderRadius: 6, height: 46, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 15 }}>
                {s}
              </div>
            ))}
          </Fragmentish>
        ))}
      </div>
      <div className="flex items-center" style={{ gap: 14, marginTop: 12 }}>
        {[["Low", C.good], ["Medium", C.warn], ["High", C.bad], ["Critical", C.crit]].map(([l, c]) => (
          <span key={l} className="sap-label flex items-center" style={{ gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{l}</span>
        ))}
      </div>
      <HeatTooltip data={hover} pos={pos} />
    </div>
  );
}
// tiny fragment helper to keep grid children flat
function Fragmentish({ children }) { return <>{children}</>; }

function KpiCRS() {
  const v = useCountUp(42, 900);
  return (
    <Card pad>
      <div className="flex items-start justify-between">
        <div>
          <div className="sap-label">Composite Risk Score</div>
          <div style={{ fontSize: 36, fontWeight: 300, color: C.warn, lineHeight: 1.1 }}>{Math.round(v)}</div>
          <div style={{ fontSize: 12, color: C.warn, marginTop: 2 }}>Medium Risk — Restrict &amp; Notify</div>
        </div>
        <Gauge value={42} size={84} stroke={9} duration={900} />
      </div>
      <div style={{ height: 40, marginTop: 6 }}>
        <ErrorBoundary>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SPARK} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <Line type="monotone" dataKey="v" stroke={C.warn} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ErrorBoundary>
      </div>
      <div className="sap-label">7-day trend</div>
    </Card>
  );
}
function KpiSoD() {
  const v = useCountUp(23, 900);
  return (
    <Card pad>
      <div className="sap-label">Active SoD Violations</div>
      <div style={{ fontSize: 36, fontWeight: 300, color: C.bad, lineHeight: 1.1 }}>{Math.round(v)}</div>
      <div style={{ fontSize: 12, color: C.bad, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}><Icon.ArrowUp size={13} color={C.bad} /> +4 since yesterday</div>
      <div style={{ height: 52, marginTop: 8 }}>
        <ErrorBoundary>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEPT_BARS} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: C.label }} axisLine={false} tickLine={false} />
              <Bar dataKey="v" radius={[3, 3, 0, 0]} fill={C.bad} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ErrorBoundary>
      </div>
    </Card>
  );
}
function KpiIncidents() {
  const v = useCountUp(7, 900);
  const total = INC_SEV.reduce((s, x) => s + x.v, 0);
  return (
    <Card pad>
      <div className="sap-label">Open Incidents</div>
      <div style={{ fontSize: 36, fontWeight: 300, color: C.warn, lineHeight: 1.1 }}>{Math.round(v)}</div>
      <div style={{ fontSize: 12, color: C.label, marginTop: 2 }}>2 Critical · 3 High · 2 Medium</div>
      <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginTop: 14 }}>
        {INC_SEV.map((s) => <div key={s.label} style={{ width: `${(s.v / total) * 100}%`, background: s.color }} title={`${s.label}: ${s.v}`} />)}
      </div>
      <div className="flex" style={{ gap: 10, marginTop: 10 }}>
        {INC_SEV.map((s) => <span key={s.label} className="sap-label flex items-center" style={{ gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.label}</span>)}
      </div>
    </Card>
  );
}
function KpiActions() {
  const v = useCountUp(156, 900);
  return (
    <Card pad>
      <div className="flex items-start justify-between">
        <div>
          <div className="sap-label">Agent Actions (24h)</div>
          <div style={{ fontSize: 36, fontWeight: 300, color: C.good, lineHeight: 1.1 }}>{Math.round(v)}</div>
          <div style={{ fontSize: 12, color: C.good, marginTop: 2 }}>89% auto-resolved</div>
        </div>
        <div style={{ width: 86, height: 86 }}>
          <ErrorBoundary>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ACTION_DONUT} dataKey="value" innerRadius={26} outerRadius={40} paddingAngle={2} stroke="none" isAnimationActive={false}>
                  {ACTION_DONUT.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ErrorBoundary>
        </div>
      </div>
      <div className="flex flex-wrap" style={{ gap: 8, marginTop: 6 }}>
        {ACTION_DONUT.map((s) => <span key={s.name} className="sap-label flex items-center" style={{ gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: s.fill }} />{s.name}</span>)}
      </div>
    </Card>
  );
}

function CrsTrendTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
      <div style={{ fontSize: 12, color: C.label }}>{d.label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: scoreColor(d.crs) }}>CRS {d.crs}</div>
      {d.event && <div style={{ fontSize: 12, color: C.bad, marginTop: 2, maxWidth: 200 }}>{d.event}</div>}
    </div>
  );
}
function CrsTrendChart() {
  const spikes = TREND.filter((d) => d.event && d.crs >= 70);
  return (
    <ChartFrame height={270}>
      <AreaChart data={TREND} margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="crsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.brand} stopOpacity={0.28} />
            <stop offset="100%" stopColor={C.brand} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <ReferenceArea y1={0} y2={30} fill={C.good} fillOpacity={0.08} />
        <ReferenceArea y1={30} y2={60} fill={C.warn} fillOpacity={0.07} />
        <ReferenceArea y1={60} y2={85} fill={C.bad} fillOpacity={0.07} />
        <ReferenceArea y1={85} y2={100} fill={C.crit} fillOpacity={0.10} />
        <CartesianGrid strokeDasharray="3 3" stroke="#EEE" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.label }} interval={4} axisLine={{ stroke: C.border }} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.label }} axisLine={false} tickLine={false} width={36} />
        <Tooltip content={<CrsTrendTooltip />} />
        <Area type="monotone" dataKey="crs" stroke={C.brand} strokeWidth={2.5} fill="url(#crsFill)" dot={false} isAnimationActive={false} />
        {spikes.map((s) => (
          <ReferenceDot key={s.day} x={s.label} y={s.crs} r={5} fill={scoreColor(s.crs)} stroke="#fff" strokeWidth={2}
            label={{ value: s.event.length > 24 ? s.event.slice(0, 22) + "…" : s.event, position: "top", fontSize: 10, fill: scoreColor(s.crs) }} />
        ))}
      </AreaChart>
    </ChartFrame>
  );
}

function ActivityFeed({ onOpen }) {
  return (
    <div className="scroll-area sap-timeline" style={{ maxHeight: 420, paddingRight: 6 }}>
      {AGENT_FEED.map((a, i) => (
        <div key={a.id} className="fade-up" style={{ position: "relative", paddingBottom: 16, animationDelay: `${i * 55}ms` }}>
          <span className="sap-timeline-dot" style={{ background: SEV_COLOR[a.sev] }} />
          <div className="flex items-center justify-between" style={{ gap: 8 }}>
            <AgentBadge name={a.agent} />
            <span className="sap-label" style={{ whiteSpace: "nowrap" }}>{a.time}</span>
          </div>
          <div style={{ fontSize: 13, margin: "5px 0", lineHeight: 1.4 }}>{a.text}</div>
          <span onClick={() => onOpen(actionToDetail(a))} style={{ color: C.brand, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 2 }}>
            View Details <Icon.ChevronRight size={13} color={C.brand} />
          </span>
        </div>
      ))}
    </div>
  );
}

function OverviewView({ onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: 16 }}>
        <KpiCRS /><KpiSoD /><KpiIncidents /><KpiActions />
      </div>
      <Card title="Composite Risk Score — 30-Day Trend" right={<span className="sap-label">Thresholds: Low · Medium · High · Critical</span>}>
        <CrsTrendChart />
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
        <Card title="Risk Heat Map" right={<span className="sap-label">Domain × Business Unit</span>}><HeatMap /></Card>
        <Card title="Recent Agent Activity" right={<Pill kind="info">Last 10</Pill>}><ActivityFeed onOpen={onOpen} /></Card>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW 2 — Access Sentinel
   ============================================================ */
function SodTable({ onReview }) {
  const sort = useSortable(SOD_ROWS, "crs");
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="sap-table">
        <thead>
          <tr>
            <SortHead label="User ID" k="id" sort={sort} />
            <th>User Name</th>
            <th>Conflicting Roles</th>
            <SortHead label="Risk" k="rank" sort={sort} />
            <SortHead label="CRS" k="crs" sort={sort} align="right" />
            <SortHead label="Detected" k="detected" sort={sort} />
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {sort.sorted.map((r) => (
            <tr key={r.id}>
              <td className="mono">{r.id}</td>
              <td>{r.name}</td>
              <td style={{ minWidth: 240 }}>{r.roles}</td>
              <td><RiskPill level={r.risk} /></td>
              <td style={{ textAlign: "right", fontWeight: 600, color: scoreColor(r.crs * 2.6) }}>{r.crs}</td>
              <td className="sap-label" style={{ whiteSpace: "nowrap" }}>{r.detected}</td>
              <td><StatusPill status={r.status} /></td>
              <td style={{ textAlign: "right" }}><button className="sap-btn sap-btn-ghost sap-btn-sm" onClick={() => onReview(r)}>Review</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function RoleMining() {
  return (
    <ChartFrame height={300}>
      <BarChart data={ROLE_MINING} layout="vertical" margin={{ top: 4, right: 24, left: 30, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEE" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: C.label }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="user" tick={{ fontSize: 10, fill: C.label }} width={108} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="assigned" name="Assigned" fill="#A7C7F5" radius={[0, 3, 3, 0]} isAnimationActive={false} />
        <Bar dataKey="used" name="Actually Used" fill={C.brand} radius={[0, 3, 3, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartFrame>
  );
}
function Fingerprint() {
  const [user, setUser] = useState("CHEM_TECH_042");
  const fp = FINGERPRINTS[user];
  const data = FP_AXES.map((axis, i) => ({ axis, current: fp.cur[i], baseline: fp.base[i] }));
  const anomalies = data.filter((d) => d.current - d.baseline >= 25).map((d) => d.axis);
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span className="sap-label">Selected user</span>
        <select value={user} onChange={(e) => setUser(e.target.value)}
          style={{ fontFamily: "var(--sap-font)", fontSize: 13, padding: "4px 8px", border: `1px solid ${C.neutral}`, borderRadius: 6, color: C.text, background: "#fff" }}>
          {Object.keys(FINGERPRINTS).map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <ChartFrame height={250}>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#E0E0E0" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: C.label }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="90-day baseline" dataKey="baseline" stroke={C.label} fill={C.label} fillOpacity={0.12} isAnimationActive={false} />
          <Radar name="Current" dataKey="current" stroke={C.brand} fill={C.brand} fillOpacity={0.28} isAnimationActive={false} />
          <Tooltip />
        </RadarChart>
      </ChartFrame>
      <div style={{ fontSize: 12, marginTop: 6 }}>
        {anomalies.length
          ? <span style={{ color: C.bad }}><strong>Anomalies:</strong> {anomalies.join(", ")} exceed baseline</span>
          : <span style={{ color: C.good }}>Within 90-day behavioural baseline</span>}
      </div>
    </div>
  );
}
function sodToDetail(r) {
  return {
    kicker: "SoD Violation Review", title: `${r.name} · ${r.id}`, badge: <RiskPill level={r.risk} />,
    note: `Segregation-of-Duties conflict: ${r.roles}. Detected by Access Sentinel against policy library SAP_GRC_RULESET_2026.`,
    rows: [
      { k: "User ID", v: r.id, mono: true }, { k: "Risk Level", v: r.risk },
      { k: "CRS Contribution", v: r.crs }, { k: "Status", v: r.status },
      { k: "Detected", v: r.detected }, { k: "Conflict", v: r.roles },
    ],
    evidence: [
      { text: "Authorization assignment ingested from PFCG", time: r.detected, color: C.brand },
      { text: `Rule match: ${r.roles}`, time: r.detected, color: C.warn },
      { text: r.status === "Auto-Mitigated" ? "Conflicting role auto-revoked" : "Routed for manual review", time: r.detected, color: r.status === "Escalated" ? C.bad : C.good },
    ],
    actions: [{ label: "Approve Mitigation", kind: "primary" }, { label: "Assign Reviewer", kind: "ghost" }],
  };
}
function AccessView({ onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="Active Segregation-of-Duties Violations" right={<Pill kind="bad">23 active</Pill>} pad={false}>
        <div style={{ padding: "12px 0 0" }}><SodTable onReview={(r) => onOpen(sodToDetail(r))} /></div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
        <Card title="Role Mining — Assigned vs. Actually Used" right={<span className="sap-label">Top 5 over-provisioned</span>}>
          <RoleMining />
          <div className="sap-label" style={{ marginTop: 4 }}>The gap between assigned and used authorisations is the attack surface.</div>
        </Card>
        <Card title="Behavioural Fingerprint" right={<Icon.Eye size={16} color={C.label} />}><Fingerprint /></Card>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW 3 — Change Guardian
   ============================================================ */
function BlastBar({ v }) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: "#EEE", borderRadius: 4, overflow: "hidden", minWidth: 60 }}>
        <div style={{ width: `${v}%`, height: "100%", background: scoreColor(v) }} />
      </div>
      <span style={{ fontWeight: 600, fontSize: 13, color: scoreColor(v), width: 22 }}>{v}</span>
    </div>
  );
}
function RegFlags({ flags }) {
  if (!flags.length) return <span className="sap-label">—</span>;
  return <span className="flex" style={{ gap: 4 }}>{flags.map((f) => <Pill key={f} kind="warn">{f}</Pill>)}</span>;
}
function ChangesTable({ statuses, setStatus, onSelect, selected }) {
  const rows = CHANGES.map((c) => ({ ...c, status: statuses[c.id] || c.status }));
  const sort = useSortable(rows, "blast");
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="sap-table">
        <thead>
          <tr>
            <SortHead label="Transport ID" k="id" sort={sort} />
            <th>Description</th>
            <SortHead label="Blast Radius" k="blast" sort={sort} />
            <th>Regulatory</th>
            <th style={{ minWidth: 220 }}>AI Risk Assessment</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sort.sorted.map((c) => (
            <tr key={c.id} onClick={() => onSelect(c.id)} style={{ cursor: "pointer", background: selected === c.id ? "var(--sap-row-hover)" : undefined }}>
              <td className="mono">{c.id}</td>
              <td style={{ minWidth: 200 }}>{c.desc}<div className="sap-label mono">{c.req}</div></td>
              <td style={{ width: 130 }}><BlastBar v={c.blast} /></td>
              <td><RegFlags flags={c.flags} /></td>
              <td className="sap-label" style={{ lineHeight: 1.4 }}>{c.ai}</td>
              <td><StatusPill status={c.status} /></td>
              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <button className="sap-btn sap-btn-primary sap-btn-sm" style={{ marginRight: 6 }} onClick={(e) => { e.stopPropagation(); setStatus(c.id, "Approved"); }}>Approve</button>
                <button className="sap-btn sap-btn-ghost sap-btn-sm" onClick={(e) => { e.stopPropagation(); setStatus(c.id, "Blocked"); }}>Block</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function TreeCell(props) {
  const { x, y, width, height, name, value, color } = props;
  if (width < 1 || height < 1) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} />
      {width > 56 && height > 28 && (
        <>
          <text x={x + 8} y={y + 20} fill="#fff" fontSize={13} fontWeight={600}>{name}</text>
          <text x={x + 8} y={y + 38} fill="#fff" fontSize={12} opacity={0.85}>{value}</text>
        </>
      )}
    </g>
  );
}
function BlastTree({ change }) {
  const b = change.blast;
  const data = [
    { name: "Users", value: Math.round(b * 2.7), color: scoreColor(b) },
    { name: "Roles", value: Math.round(b * 0.5), color: C.warn },
    { name: "Processes", value: Math.max(2, Math.round(b * 0.16)), color: C.bad },
    { name: "Plants", value: Math.max(1, Math.round(b / 26)), color: C.crit },
    { name: "Interfaces", value: Math.max(2, Math.round(b * 0.12)), color: C.warn },
    { name: "Reports", value: Math.max(3, Math.round(b * 0.25)), color: C.good },
  ];
  return (
    <>
      <div className="sap-label" style={{ marginBottom: 6 }}>Impact of <span className="mono" style={{ color: C.text }}>{change.id}</span> — {change.desc}</div>
      <ChartFrame height={240}>
        <Treemap data={data} dataKey="value" stroke="#fff" content={<TreeCell />} isAnimationActive={false} />
      </ChartFrame>
    </>
  );
}
function ChangeTimeline({ onSelect }) {
  const W = 100;
  return (
    <div>
      <div style={{ position: "relative", height: 120, marginTop: 8 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 60, height: 2, background: C.neutral }} />
        {CHANGE_HISTORY.map((c) => {
          const left = (c.day / 30) * W;
          const r = 5 + (c.blast / 100) * 12;
          return (
            <div key={c.id} title={`${c.id} · day ${c.day} · blast ${c.blast}`} onClick={() => onSelect(c)}
              style={{ position: "absolute", left: `${left}%`, top: 60, transform: "translate(-50%,-50%)", width: r * 2, height: r * 2, borderRadius: "50%", background: scoreColor(c.blast), border: "2px solid #fff", boxShadow: "0 0 0 1px " + C.border, cursor: "pointer" }} />
          );
        })}
        <div className="sap-label" style={{ position: "absolute", left: 0, top: 92 }}>30 days ago</div>
        <div className="sap-label" style={{ position: "absolute", right: 0, top: 92 }}>Today</div>
      </div>
      <div className="sap-label" style={{ marginTop: 4 }}>Dot size = blast radius · colour = risk level · click to inspect</div>
    </div>
  );
}
function changeToDetail(c) {
  return {
    kicker: "Change Request", title: c.id, badge: <Pill kind={c.blast > 60 ? "bad" : c.blast > 30 ? "warn" : "good"}>Blast {c.blast} · {zone(c.blast).label}</Pill>,
    note: c.desc + (c.ai ? ` — ${c.ai}` : ""),
    rows: [
      { k: "Transport", v: c.id, mono: true }, { k: "Requestor", v: c.req || "—", mono: true },
      { k: "Blast Radius", v: c.blast }, { k: "Status", v: c.status || zone(c.blast).label },
      { k: "Regulatory", v: (c.flags && c.flags.length) ? c.flags.join(", ") : "None" }, { k: "Risk Zone", v: zone(c.blast).action },
    ],
    actions: [{ label: "Approve", kind: "primary" }, { label: "Block", kind: "ghost" }],
  };
}
function ChangeView({ onOpen }) {
  const [statuses, setStatuses] = useState({});
  const [selectedId, setSelectedId] = useState("DEVK913861");
  const setStatus = (id, s) => setStatuses((p) => ({ ...p, [id]: s }));
  const selected = CHANGES.find((c) => c.id === selectedId) || CHANGES[3];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="Pending Change Requests" right={<Pill kind="warn">3 pending approval</Pill>} pad={false}>
        <div style={{ padding: "12px 0 0" }}><ChangesTable statuses={statuses} setStatus={setStatus} onSelect={setSelectedId} selected={selectedId} /></div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
        <Card title="Blast Radius" right={<Pill kind="info">{selected.id}</Pill>}><BlastTree change={selected} /></Card>
        <Card title="Change History — 30 Days"><ChangeTimeline onSelect={(c) => onOpen(changeToDetail(c))} /></Card>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW 4 — Incident Responder
   ============================================================ */
function LiveFeed() {
  const [items, setItems] = useState(() =>
    ANOMALY_POOL.slice(0, 6).map((a, i) => ({ ...a, id: i, t: new Date(Date.now() - i * 42000) }))
  );
  const next = useRef(6);
  useEffect(() => {
    const iv = setInterval(() => {
      setItems((prev) => {
        const a = ANOMALY_POOL[next.current % ANOMALY_POOL.length];
        next.current += 1;
        return [{ ...a, id: next.current + 100, t: new Date() }, ...prev].slice(0, 9);
      });
    }, 3800);
    return () => clearInterval(iv);
  }, []);
  const sevPill = { Critical: "crit", High: "bad", Medium: "warn", Low: "good" };
  const clock = (d) => d.toLocaleTimeString("en-GB", { hour12: false });
  return (
    <div>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
        <span className="live-dot" /><span style={{ fontSize: 12, fontWeight: 700, color: C.good, letterSpacing: 0.5 }}>LIVE</span>
        <span className="sap-label">SM20 / SM21 audit stream</span>
      </div>
      <div className="scroll-area" style={{ maxHeight: 360 }}>
        {items.map((a) => (
          <div key={a.id} className="fade-in" style={{ display: "flex", gap: 10, padding: "10px 4px", borderBottom: "1px solid #f2f2f2" }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: SEV_COLOR[a.sev === "Critical" ? "red" : a.sev === "High" ? "red" : a.sev === "Medium" ? "orange" : "green"], marginTop: 6, flex: "none" }} />
            <div style={{ flex: 1 }}>
              <div className="flex items-center justify-between" style={{ gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{a.type}</span>
                <span className="sap-label mono">{clock(a.t)}</span>
              </div>
              <div className="flex items-center" style={{ gap: 8, marginTop: 3 }}>
                <span className="mono sap-label">{a.user}</span>
                <Pill kind={sevPill[a.sev]}>{a.sev}</Pill>
                <span style={{ fontSize: 12, color: C.bad, fontWeight: 600 }}>CRS +{a.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function SequenceFlow() {
  return (
    <div>
      <div className="flex items-stretch" style={{ gap: 0, flexWrap: "wrap" }}>
        {SEQUENCE.map((s, i) => (
          <Fragmentish key={s.tcode}>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", minWidth: 150, flex: 1, background: C.bg }}>
              <div className="mono" style={{ fontWeight: 700, color: C.text }}>{s.tcode}</div>
              <div className="sap-label" style={{ margin: "4px 0", lineHeight: 1.3 }}>{s.desc}</div>
              <div className="mono" style={{ fontSize: 12, color: C.label }}>{s.time}</div>
            </div>
            {i < SEQUENCE.length - 1 && (
              <div style={{ display: "flex", alignItems: "center", padding: "0 6px" }}><Icon.ArrowRight size={20} color={C.bad} /></div>
            )}
          </Fragmentish>
        ))}
      </div>
      <div style={{ marginTop: 14, background: C.badBg, border: `1px solid ${C.bad}`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Icon.Alert size={18} color={C.bad} style={{ flex: "none", marginTop: 1 }} />
        <div>
          <div style={{ fontWeight: 600, color: C.bad }}>Pattern matches IP Exfiltration Template</div>
          <div style={{ fontSize: 13, marginTop: 2 }}>CRS +34 · Escalated to CISO · Evidence chain preserved</div>
        </div>
      </div>
    </div>
  );
}
function AnomalyDist() {
  return (
    <ChartFrame height={280}>
      <BarChart data={ANOMALY_DIST} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEE" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.label }} axisLine={{ stroke: C.border }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: C.label }} axisLine={false} tickLine={false} width={36} />
        <Tooltip />
        <Bar dataKey="Failed Login" stackId="a" fill={C.brand} isAnimationActive={false} />
        <Bar dataKey="Off-Hours" stackId="a" fill={C.warn} isAnimationActive={false} />
        <Bar dataKey="T-code Seq" stackId="a" fill={C.bad} isAnimationActive={false} />
        <Bar dataKey="Geo-Anomaly" stackId="a" fill={C.crit} radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartFrame>
  );
}
function Legend({ items }) {
  return (
    <span className="flex flex-wrap" style={{ gap: 10 }}>
      {items.map(([l, c]) => <span key={l} className="sap-label flex items-center" style={{ gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{l}</span>)}
    </span>
  );
}
function IncidentView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
        <Card title="Live Anomaly Feed"><LiveFeed /></Card>
        <Card title="Suspicious T-code Sequence" right={<Pill kind="bad">Critical</Pill>}><SequenceFlow /></Card>
      </div>
      <Card title="Anomaly Distribution — 7 Days" right={<Legend items={[["Failed Login", C.brand], ["Off-Hours", C.warn], ["T-code Seq", C.bad], ["Geo-Anomaly", C.crit]]} />}>
        <AnomalyDist />
      </Card>
    </div>
  );
}

/* ============================================================
   VIEW 5 — Risk Correlator (innovation)
   ============================================================ */
function CorrelatorView() {
  const [s, setS] = useState({ sod: 10, priv: 3, blast: 40, anomaly: 36, days: 37 });
  const set = (k) => (e) => setS((p) => ({ ...p, [k]: Number(e.target.value) }));
  const reset = () => setS({ sod: 10, priv: 3, blast: 40, anomaly: 36, days: 37 });

  const dims = useMemo(() => {
    const access = Math.round(Math.min(100, s.sod * 2.3 + s.priv * 7));
    const change = s.blast;
    const incident = s.anomaly;
    const temporal = Math.round(Math.max(0, 100 - s.days * 1.1));
    return { access, change, incident, temporal };
  }, [s]);
  const W = { access: 0.35, change: 0.25, incident: 0.30, temporal: 0.10 };
  const crs = Math.round(W.access * dims.access + W.change * dims.change + W.incident * dims.incident + W.temporal * dims.temporal);
  const z = zone(crs);
  const segs = [
    { value: W.access * dims.access, color: C.brand },
    { value: W.change * dims.change, color: C.warn },
    { value: W.incident * dims.incident, color: C.bad },
    { value: W.temporal * dims.temporal, color: C.label },
  ];
  const BREAK = [
    { key: "Access Risk", w: 0.35, raw: dims.access, color: C.brand },
    { key: "Change Risk", w: 0.25, raw: dims.change, color: C.warn },
    { key: "Incident Risk", w: 0.30, raw: dims.incident, color: C.bad },
    { key: "Temporal Decay", w: 0.10, raw: dims.temporal, color: C.label },
  ];
  const sliders = [
    { k: "sod", label: "Active SoD Violations", min: 0, max: 30, val: s.sod, disp: s.sod },
    { k: "priv", label: "Privilege Level", min: 1, max: 5, val: s.priv, disp: PRIV_LABEL[s.priv] },
    { k: "blast", label: "Change Blast Radius", min: 0, max: 100, val: s.blast, disp: s.blast },
    { k: "anomaly", label: "Anomaly Severity", min: 0, max: 100, val: s.anomaly, disp: s.anomaly },
    { k: "days", label: "Days Since Last Incident", min: 0, max: 90, val: s.days, disp: s.days + "d" },
  ];
  const [corrHover, setCorrHover] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Row 1: gauge + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: 16 }}>
        <Card title="Composite Risk Score" className="lg:col-span-5" right={<Pill kind={crs <= 30 ? "good" : crs <= 60 ? "warn" : crs <= 85 ? "bad" : "crit"}>{z.label}</Pill>}>
          <div className="flex flex-col items-center">
            <Gauge value={crs} size={200} stroke={18} segments={segs} caption="Composite Risk Score" duration={300} />
            <div style={{ fontSize: 13, color: z.color, fontWeight: 600, marginTop: 4 }}>{z.action}</div>
            <div className="grid grid-cols-2" style={{ gap: "6px 18px", marginTop: 14, width: "100%" }}>
              {BREAK.map((d) => (
                <span key={d.key} className="flex items-center justify-between" style={{ fontSize: 12 }}>
                  <span className="flex items-center" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />{d.key}</span>
                  <span style={{ fontWeight: 600 }}>{(d.w * d.raw).toFixed(1)}</span>
                </span>
              ))}
            </div>
          </div>
        </Card>
        <Card title="CRS Breakdown" className="lg:col-span-7">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {BREAK.map((d) => (
              <div key={d.key}>
                <div className="flex items-center justify-between" style={{ fontSize: 13, marginBottom: 4 }}>
                  <span>{d.key} <span className="sap-label">(w={d.w})</span></span>
                  <span className="sap-label">raw {d.raw} → <strong style={{ color: d.color }}>{(d.w * d.raw).toFixed(1)}</strong></span>
                </div>
                <div style={{ position: "relative", height: 10, background: "#EEE", borderRadius: 5 }}>
                  <div style={{ position: "absolute", height: "100%", width: `${d.raw}%`, background: d.color, opacity: 0.25, borderRadius: 5 }} />
                  <div style={{ position: "absolute", height: "100%", width: `${d.w * d.raw}%`, background: d.color, borderRadius: 5 }} />
                </div>
              </div>
            ))}
            <div style={{ background: "#1E2A36", color: "#D6E2EF", borderRadius: 8, padding: "12px 14px", fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.6 }}>
              <div style={{ color: "#7FB2F0" }}>CRS = w₁·AccessRisk + w₂·ChangeRisk + w₃·IncidentRisk + w₄·TemporalDecay</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;= 0.35·{dims.access} + 0.25·{dims.change} + 0.30·{dims.incident} + 0.10·{dims.temporal}</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;= <span style={{ color: z.color === C.crit ? "#FF8A8A" : "#9EE6B4", fontWeight: 700 }}>{crs}</span> &nbsp;→&nbsp; {z.label} · {z.action}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: correlation matrix + threshold */}
      <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: 16 }}>
        <Card title="Cross-Domain Correlation" className="lg:col-span-5" right={<Pill kind="info">signal strength</Pill>}>
          <div style={{ display: "grid", gridTemplateColumns: "70px repeat(3, 1fr)", gap: 6 }}>
            <div />
            {CORR_DOMAINS.map((d) => <div key={d} className="sap-label" style={{ textAlign: "center", fontWeight: 600 }}>{d}</div>)}
            {CORR.map((row, i) => (
              <Fragmentish key={i}>
                <div className="sap-label" style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>{CORR_DOMAINS[i]}</div>
                {row.map((val, j) => {
                  const key = i < j ? `${i}-${j}` : `${j}-${i}`;
                  const note = i === j ? "Self-correlation (baseline)." : CORR_NOTE[key];
                  return (
                    <div key={j} onMouseEnter={() => setCorrHover({ i, j, val, note })} onMouseLeave={() => setCorrHover(null)}
                      style={{ height: 56, borderRadius: 6, background: `rgba(0,112,242,${val * 0.82 + 0.08})`, color: val > 0.5 ? "#fff" : C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 15, cursor: "default", position: "relative" }}>
                      {val.toFixed(2)}
                    </div>
                  );
                })}
              </Fragmentish>
            ))}
          </div>
          <div style={{ minHeight: 38, marginTop: 10, fontSize: 12, color: C.text }}>
            {corrHover
              ? <><strong>{CORR_DOMAINS[corrHover.i]} × {CORR_DOMAINS[corrHover.j]}: {corrHover.val.toFixed(2)}</strong> — {corrHover.note}</>
              : <span className="sap-label">Hover a cell to see the cross-domain rationale.</span>}
          </div>
        </Card>
        <Card title="Threshold Response Actions" className="lg:col-span-7">
          <div style={{ position: "relative", marginTop: 26, marginBottom: 8 }}>
            <div style={{ display: "flex", height: 30, borderRadius: 6, overflow: "hidden" }}>
              {THRESHOLDS.map((t) => (
                <div key={t.from} style={{ width: `${t.w}%`, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 600 }}>{t.from}–{t.to}</div>
              ))}
            </div>
            <div style={{ position: "absolute", left: `${crs}%`, top: -22, transform: "translateX(-50%)", transition: "left 0.3s ease-in-out", textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: z.color }}>CRS {crs}</div>
              <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `8px solid ${z.color}`, margin: "1px auto 0" }} />
            </div>
            <div style={{ position: "absolute", left: `${crs}%`, top: 0, bottom: 0, width: 2, background: z.color, transform: "translateX(-50%)", transition: "left 0.3s ease-in-out" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {THRESHOLDS.map((t) => {
              const live = crs >= t.from && crs <= t.to;
              return (
                <div key={t.from} className="flex items-center" style={{ gap: 10, padding: "8px 10px", borderRadius: 8, background: live ? "var(--sap-row-hover)" : "transparent", border: live ? `1px solid ${t.color}` : "1px solid transparent" }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: t.color, flex: "none" }} />
                  <span style={{ fontSize: 13, fontWeight: live ? 600 : 400 }}><span className="mono" style={{ color: t.color }}>{t.from}–{t.to}</span> &nbsp; {t.label}</span>
                  {live && <span style={{ marginLeft: "auto" }}><Pill kind="info">current</Pill></span>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 3: What-If simulator */}
      <Card title="What-If Simulator" right={<button className="sap-btn sap-btn-ghost sap-btn-sm" onClick={reset}><Icon.Refresh size={14} color={C.brand} /> Reset</button>}>
        <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: 24 }}>
          <div className="lg:col-span-7" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="sap-label flex items-center" style={{ gap: 6 }}><Icon.Sliders size={14} color={C.label} /> Adjust the risk drivers — the Composite Risk Score recalculates live.</div>
            {sliders.map((sl) => (
              <div key={sl.k}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{sl.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.brand }}>{sl.disp}</span>
                </div>
                <input type="range" className="sap-range" min={sl.min} max={sl.max} step={1} value={sl.val} onChange={set(sl.k)} />
              </div>
            ))}
          </div>
          <div className="lg:col-span-5">
            <div style={{ background: C.bg, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Gauge value={crs} size={150} stroke={14} duration={250} caption="Live CRS" />
              <div style={{ fontSize: 13, fontWeight: 600, color: z.color, marginTop: 2 }}>{z.action}</div>
              <div className="grid grid-cols-2" style={{ gap: "8px 16px", width: "100%", marginTop: 16 }}>
                {BREAK.map((d) => (
                  <div key={d.key} className="flex items-center justify-between" style={{ fontSize: 12 }}>
                    <span className="flex items-center" style={{ gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: d.color }} />{d.key}</span>
                    <span style={{ fontWeight: 600 }}>{d.raw}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   App shell
   ============================================================ */
export default function App() {
  const [tab, setTab] = useState("overview");
  const [detail, setDetail] = useState(null);
  const open = (d) => setDetail(d);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setDetail(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, color: C.text, fontFamily: "var(--sap-font)" }}>
      <ShellBar onOpenAction={(a) => open(actionToDetail(a))} />
      <TabBar active={tab} onChange={setTab} />
      <div className="scroll-area" style={{ flex: 1, position: "relative" }}>
        <div className="sap-busy" key={tab} />
        <div className="max-w-content mx-auto px-4 md:px-6 xl:px-12" style={{ paddingTop: 20, paddingBottom: 40 }}>
          <div key={tab} className="fade-in">
            {tab === "overview" && <OverviewView onOpen={open} />}
            {tab === "access" && <AccessView onOpen={open} />}
            {tab === "change" && <ChangeView onOpen={open} />}
            {tab === "incident" && <IncidentView />}
            {tab === "correlator" && <CorrelatorView />}
          </div>
        </div>
      </div>
      <SidePanel detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

export { OverviewView, AccessView, ChangeView, IncidentView, CorrelatorView };
