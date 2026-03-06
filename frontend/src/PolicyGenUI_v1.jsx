import { useState, useEffect, useRef } from "react";

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
// Aesthetic: Industrial-precision. Crisp white base, deep teal accents.
// Monospaced data, clean geometric structure. "Security audit meets modern SaaS."

const COLORS = {
  bg: "#f4f6f9",
  surface: "#ffffff",
  surfaceHigh: "#eef2f7",
  border: "#d8e2ed",
  borderBright: "#b8cfe0",
  accent: "#0a7c5c",
  accentDim: "#0d9e76",
  accentGlow: "rgba(10,124,92,0.08)",
  accentMid: "#0bb882",
  warn: "#c97c10",
  danger: "#d63355",
  dangerDim: "#fce8ed",
  info: "#1a6fc4",
  text: "#1a2b3c",
  textMuted: "#5a7a95",
  textDim: "#9ab0c4",
  white: "#0f1e2d",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'IBM Plex Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${COLORS.surfaceHigh}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.borderBright}; border-radius: 2px; }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(10,124,92,0.25); }
    50% { box-shadow: 0 0 0 6px rgba(10,124,92,0); }
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes progressFill {
    from { width: 0%; }
    to { width: 100%; }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .fade-slide-up { animation: fadeSlideUp 0.4s ease forwards; }
  .fade-in { animation: fadeIn 0.3s ease forwards; }

  .card {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .card-high {
    background: ${COLORS.surfaceHigh};
    border: 1px solid ${COLORS.borderBright};
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  .btn {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    padding: 10px 20px;
    border-radius: 2px;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-primary {
    background: ${COLORS.accent};
    color: #ffffff;
  }

  .btn-primary:hover {
    background: ${COLORS.accentMid};
    box-shadow: 0 2px 12px rgba(10,124,92,0.3);
  }

  .btn-secondary {
    background: transparent;
    color: ${COLORS.accent};
    border: 1px solid ${COLORS.accentDim};
  }

  .btn-secondary:hover {
    background: ${COLORS.accentGlow};
    border-color: ${COLORS.accent};
  }

  .btn-ghost {
    background: transparent;
    color: ${COLORS.textMuted};
    border: 1px solid ${COLORS.border};
  }

  .btn-ghost:hover {
    color: ${COLORS.text};
    border-color: ${COLORS.borderBright};
    background: ${COLORS.surfaceHigh};
  }

  .btn-danger {
    background: transparent;
    color: ${COLORS.danger};
    border: 1px solid ${COLORS.dangerDim};
  }

  .btn-danger:hover {
    background: rgba(255,77,109,0.1);
    border-color: ${COLORS.danger};
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 2px;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .tag-allow { background: rgba(10,124,92,0.08); color: ${COLORS.accent}; border: 1px solid rgba(10,124,92,0.2); }
  .tag-deny { background: rgba(214,51,85,0.08); color: ${COLORS.danger}; border: 1px solid rgba(214,51,85,0.2); }
  .tag-warn { background: rgba(201,124,16,0.08); color: ${COLORS.warn}; border: 1px solid rgba(201,124,16,0.2); }
  .tag-info { background: rgba(26,111,196,0.08); color: ${COLORS.info}; border: 1px solid rgba(26,111,196,0.2); }
  .tag-muted { background: rgba(90,122,149,0.08); color: ${COLORS.textMuted}; border: 1px solid rgba(90,122,149,0.15); }

  .input {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 2px;
    color: ${COLORS.text};
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    padding: 10px 12px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s;
  }

  .input:focus { border-color: ${COLORS.accentDim}; }
  .input::placeholder { color: ${COLORS.textDim}; }

  .select {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 2px;
    color: ${COLORS.text};
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    padding: 10px 12px;
    outline: none;
    cursor: pointer;
    appearance: none;
    transition: border-color 0.15s;
  }

  .select:focus { border-color: ${COLORS.accentDim}; }

  .label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${COLORS.textMuted};
    margin-bottom: 6px;
    display: block;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: ${COLORS.white};
    letter-spacing: -0.01em;
  }

  .mono { font-family: 'IBM Plex Mono', monospace; }
  .syne { font-family: 'Syne', sans-serif; }

  .divider {
    height: 1px;
    background: ${COLORS.border};
    margin: 16px 0;
  }

  .step-connector {
    width: 1px;
    background: linear-gradient(to bottom, ${COLORS.border}, transparent);
    margin: 0 auto;
    flex: 1;
  }

  .nist-pass { color: ${COLORS.accent}; }
  .nist-fail { color: ${COLORS.danger}; }

  .rule-card {
    border-left: 2px solid transparent;
    transition: all 0.2s;
  }
  .rule-card:hover { border-color: ${COLORS.accentDim}; }
  .rule-card.allow { border-left-color: ${COLORS.accentDim}; }
  .rule-card.deny { border-left-color: ${COLORS.dangerDim}; }
  .rule-card.rejected { border-left-color: ${COLORS.border}; opacity: 0.4; }
  .rule-card.editing { border-left-color: ${COLORS.warn}; }

  .progress-bar {
    height: 2px;
    background: ${COLORS.border};
    border-radius: 1px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: ${COLORS.accent};
    transition: width 0.4s ease;
  }

  .glow-text {
    color: ${COLORS.accent};
    text-shadow: none;
  }

  .terminal-line {
    padding: 2px 0;
    font-size: 11px;
    color: ${COLORS.textMuted};
    opacity: 0;
    animation: fadeIn 0.2s ease forwards;
  }

  .terminal-line.success { color: ${COLORS.accent}; }
  .terminal-line.warn { color: ${COLORS.warn}; }
  .terminal-line.error { color: ${COLORS.danger}; }
  .terminal-line.info { color: ${COLORS.info}; }

  .cursor::after {
    content: '|';
    animation: blink 1s ease infinite;
    color: ${COLORS.accentDim};
  }

  .checkbox-custom {
    width: 16px;
    height: 16px;
    border: 1px solid ${COLORS.border};
    border-radius: 2px;
    background: ${COLORS.bg};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;
  }

  .checkbox-custom.checked {
    background: ${COLORS.accent};
    border-color: ${COLORS.accent};
    color: white;
  }

  .tab {
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${COLORS.textMuted};
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
  }

  .tab.active {
    color: ${COLORS.accent};
    border-bottom-color: ${COLORS.accent};
  }

  .tab:hover:not(.active) {
    color: ${COLORS.text};
  }

  .tooltip {
    position: relative;
  }

  .sim-bar {
    height: 8px;
    border-radius: 1px;
    background: ${COLORS.border};
    overflow: hidden;
  }

  .sim-bar-fill {
    height: 100%;
    border-radius: 1px;
    transition: width 0.8s ease;
  }
`;

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  { id: "eng", name: "Engineering", roles: ["engineer", "senior_engineer", "lead"], headcount: 120 },
  { id: "fin", name: "Finance", roles: ["analyst", "manager", "director"], headcount: 45 },
  { id: "hr", name: "Human Resources", roles: ["coordinator", "manager"], headcount: 20 },
  { id: "exec", name: "Executive", roles: ["vp", "c_suite"], headcount: 8 },
];

const RESOURCES = [
  { id: "login", path: "/login", sensitivity: "internal", description: "Main login portal" },
  { id: "dashboard", path: "/dashboard", sensitivity: "internal", description: "Employee dashboard" },
  { id: "admin", path: "/admin", sensitivity: "restricted", description: "Admin control panel" },
  { id: "payroll", path: "/payroll", sensitivity: "restricted", description: "Payroll system" },
  { id: "wiki", path: "/wiki", sensitivity: "public", description: "Company knowledge base" },
  { id: "reports", path: "/reports", sensitivity: "internal", description: "Analytics & reports" },
];

const GENERATED_RULES = [
  {
    id: "deny_bad_ip",
    effect: "deny",
    description: "Block access from suspicious or malicious IP addresses",
    action: "login",
    path: "/login",
    sensitivity: "internal",
    conditions: ["environment.ip_reputation ∈ {suspicious, malicious}"],
    nist: ["Continuous Verification", "Environmental Risk"],
    reasoning: "All login attempts from flagged IP ranges must be blocked regardless of credentials. Derived from NIST SP 800-207 Section 3.3.",
    status: "accepted",
  },
  {
    id: "deny_locked_account",
    effect: "deny",
    description: "Deny login for locked or disabled accounts",
    action: "login",
    path: "/login",
    sensitivity: "internal",
    conditions: ["subject.account_status ∈ {locked, disabled}"],
    nist: ["Identity Assurance", "Least Privilege"],
    reasoning: "Accounts flagged in HR directory as inactive must not authenticate. Prevents ghost account exploitation.",
    status: "accepted",
  },
  {
    id: "allow_login_standard",
    effect: "allow",
    description: "Allow login for active employees with MFA on compliant devices",
    action: "login",
    path: "/login",
    sensitivity: "internal",
    conditions: [
      "subject.account_status == active",
      "subject.mfa_verified == true",
      "device.managed == true",
      "device.compliant == true",
      "device.risk_level ≤ medium",
    ],
    nist: ["Least Privilege", "Device Posture", "Strong Authentication"],
    reasoning: "Standard employee access requires all three pillars: verified identity (MFA), managed device, and acceptable risk posture.",
    status: "accepted",
  },
  {
    id: "deny_admin_no_mfa",
    effect: "deny",
    description: "Deny admin panel access without MFA verification",
    action: "admin_panel",
    path: "/admin",
    sensitivity: "restricted",
    conditions: ["subject.mfa_verified == false"],
    nist: ["Privileged Access Management", "Step-Up Auth"],
    reasoning: "Admin operations require step-up authentication. MFA is mandatory for all privileged path access per NIST AC-17.",
    status: "accepted",
  },
  {
    id: "deny_admin_bad_signals",
    effect: "deny",
    description: "Block admin access under high-risk environmental conditions",
    action: "admin_panel",
    path: "/admin",
    sensitivity: "restricted",
    conditions: [
      "environment.ip_reputation ∈ {suspicious, malicious}",
      "OR environment.geo_risk == high",
      "OR device.compliant == false",
    ],
    nist: ["Continuous Verification", "Zero Trust Pillars"],
    reasoning: "Admin panel is highest sensitivity resource. Any environmental red flag triggers immediate deny regardless of identity.",
    status: "pending",
  },
  {
    id: "allow_admin_strict",
    effect: "allow",
    description: "Allow admin access only for active admins on low-risk managed devices",
    action: "admin_panel",
    path: "/admin",
    sensitivity: "restricted",
    conditions: [
      "subject.user_role == admin",
      "subject.account_status == active",
      "subject.mfa_verified == true",
      "device.managed == true",
      "device.compliant == true",
      "device.risk_level == low",
    ],
    nist: ["Least Privilege", "Privileged Access Management", "Admin Isolation"],
    reasoning: "Strictest allow rule: all six conditions must be simultaneously true. No exceptions. Maps to NIST AC-6 and IA-2(1).",
    status: "pending",
  },
];

const NIST_CHECKS = [
  { name: "Default deny posture", ok: true, detail: "default_effect = deny" },
  { name: "Deny rules present", ok: true, detail: "4 deny rules generated" },
  { name: "Allow rules present", ok: true, detail: "2 allow rules generated" },
  { name: "Risky signal coverage (IP/Geo)", ok: true, detail: "Deny rules include environment checks" },
  { name: "MFA enforced on privileged paths", ok: true, detail: "Admin allow requires mfa_verified == true" },
  { name: "Device posture checked on allow", ok: true, detail: "All allow rules include device.compliant check" },
  { name: "Logging obligation present", ok: true, detail: "obligations: [log] on all allow rules" },
  { name: "Audit trail field exported", ok: true, detail: "JSON decision includes matched_allow + matched_deny" },
];

const SIM_RESULTS = {
  total: 5000,
  allowRate: 0.008,
  allowRules: [
    { name: "allow_login_standard", count: 113 },
    { name: "allow_admin_strict", count: 26 },
  ],
  denyRules: [
    { name: "deny_admin_bad_signals", count: 2128 },
    { name: "deny_bad_ip", count: 1600 },
    { name: "deny_admin_no_mfa", count: 1313 },
    { name: "deny_locked_account", count: 606 },
  ],
};

const EVAL_SCENARIOS = [
  {
    name: "Standard employee login",
    input: { role: "engineer", mfa: true, device: "compliant", ip: "good", geo: "low" },
    decision: { allow: true, matched_allow: ["allow_login_standard"], matched_deny: [], obligations: ["log"] },
  },
  {
    name: "Login from malicious IP",
    input: { role: "engineer", mfa: true, device: "compliant", ip: "malicious", geo: "low" },
    decision: { allow: false, matched_allow: ["allow_login_standard"], matched_deny: ["deny_bad_ip"], obligations: [] },
  },
  {
    name: "Admin access — full compliance",
    input: { role: "admin", mfa: true, device: "low-risk managed", ip: "good", geo: "low" },
    decision: { allow: true, matched_allow: ["allow_admin_strict"], matched_deny: [], obligations: ["log"] },
  },
  {
    name: "Admin access — no MFA",
    input: { role: "admin", mfa: false, device: "compliant", ip: "good", geo: "low" },
    decision: { allow: false, matched_allow: [], matched_deny: ["deny_admin_no_mfa"], obligations: [] },
  },
];

// ─── ICONS ─────────────────────────────────────────────────────────────────────

const Icon = {
  check: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chevronRight: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevronDown: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v4c0 3.3 2.5 5.7 6 6.5C11.5 13.7 14 11.3 14 8V4L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  code: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 4L1 7l3 3M10 4l3 3-3 3M8 2l-2 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  sparkle: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v2M7 11v2M1 7h2M11 7h2M3.2 3.2l1.4 1.4M9.4 9.4l1.4 1.4M9.4 4.6L8 6M6 8l-1.4 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  download: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5l3 3 3-3M2 10h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  play: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 2l7 4-7 4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor"/></svg>,
  edit: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2l2 2-6 6H2V8L8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M4 3V2h4v1M5 5v4M7 5v4M2 3l1 7h6l1-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  building: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12V3l5-1.5L12 3v9M2 12h10M5 12V8h4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  info: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 5.5v3M6 4v-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  users: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="10" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M12.5 12c0-1.7-1.1-3-2.5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  lock: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="5.5" width="8" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16,
      border: `2px solid ${COLORS.border}`,
      borderTop: `2px solid ${COLORS.accent}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      flexShrink: 0,
    }} />
  );
}

function StatusBadge({ status }) {
  const map = {
    accepted: { label: "Accepted", cls: "tag-allow" },
    pending: { label: "Pending Review", cls: "tag-warn" },
    rejected: { label: "Rejected", cls: "tag-deny" },
    editing: { label: "Editing", cls: "tag-info" },
  };
  const s = map[status] || { label: status, cls: "tag-muted" };
  return <span className={`tag ${s.cls}`}>{s.label}</span>;
}

function ProgressBar({ value, color = COLORS.accent, animate = false }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{
          width: `${value}%`,
          background: color,
          ...(animate ? { animation: "progressFill 2s ease forwards" } : {}),
        }}
      />
    </div>
  );
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <div style={{
                width: 28, height: 28,
                border: `1.5px solid ${done ? COLORS.accent : active ? COLORS.accent : COLORS.border}`,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? COLORS.accentDim : active ? COLORS.accentGlow : COLORS.bg,
                fontSize: 10, fontWeight: 600, color: done ? COLORS.accent : active ? COLORS.accent : COLORS.textDim,
                animation: active ? "pulse-glow 2s infinite" : "none",
                transition: "all 0.3s",
                flexShrink: 0,
              }}>
                {done ? <Icon.check /> : i + 1}
              </div>
              <span style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: active ? COLORS.accent : COLORS.textDim, whiteSpace: "nowrap", fontWeight: active ? 600 : 400 }}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 1, background: i < current ? COLORS.accentDim : COLORS.border, margin: "0 8px", marginBottom: 18, transition: "all 0.3s", flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP 1: COMPANY STRUCTURE INPUT ─────────────────────────────────────────

function Step1({ onNext }) {
  const [depts, setDepts] = useState(DEPARTMENTS);
  const [resources, setResources] = useState(RESOURCES);
  const [signals, setSignals] = useState({
    mfa: true, devicePosture: true, ipReputation: true, geoRisk: true, timeWindow: false, accountStatus: true,
  });
  const [activeTab, setActiveTab] = useState("org");

  const toggleSignal = (k) => setSignals(s => ({ ...s, [k]: !s[k] }));

  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6, maxWidth: 600 }}>
          Define your organization's structure. The AI engine will analyze this together with its pretrained knowledge of access control frameworks to generate a complete company-wide policy.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
        {[["org", "Organization"], ["resources", "Resources"], ["signals", "Policy Signals"]].map(([k, v]) => (
          <div key={k} className={`tab ${activeTab === k ? "active" : ""}`} onClick={() => setActiveTab(k)}>{v}</div>
        ))}
      </div>

      {activeTab === "org" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {depts.map((dept) => (
            <div key={dept.id} className="card-high" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon.building />
                  <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.white }}>{dept.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted, fontSize: 11 }}>
                  <Icon.users />
                  {dept.headcount}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {dept.roles.map(r => (
                  <span key={r} className="tag tag-muted">{r}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "resources" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {resources.map((res) => (
            <div key={res.id} className="card" style={{ padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <code style={{ fontSize: 11, color: COLORS.accent, background: COLORS.accentGlow, padding: "2px 8px", borderRadius: 2, border: `1px solid rgba(10,124,92,0.15)` }}>{res.path}</code>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{res.description}</span>
              </div>
              <span className={`tag ${res.sensitivity === "restricted" ? "tag-deny" : res.sensitivity === "internal" ? "tag-warn" : "tag-allow"}`}>
                <Icon.lock /> {res.sensitivity}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "signals" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {Object.entries({
            mfa: ["MFA Verification", "Require multi-factor authentication for all login attempts"],
            devicePosture: ["Device Posture", "Check if device is managed and compliant with MDM policy"],
            ipReputation: ["IP Reputation", "Block requests from suspicious or known malicious IP ranges"],
            geoRisk: ["Geographic Risk", "Deny high-risk geographic locations based on threat intelligence"],
            timeWindow: ["Time Window", "Restrict access to business hours only (optional)"],
            accountStatus: ["Account Status", "Verify account is active — block locked or disabled accounts"],
          }).map(([k, [title, desc]]) => (
            <div key={k} className={`card ${signals[k] ? "card-high" : ""}`} style={{ padding: 14, cursor: "pointer", transition: "all 0.15s" }} onClick={() => toggleSignal(k)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: signals[k] ? COLORS.white : COLORS.textMuted }}>{title}</span>
                <div className={`checkbox-custom ${signals[k] ? "checked" : ""}`}>
                  {signals[k] && <Icon.check />}
                </div>
              </div>
              <p style={{ fontSize: 10, color: COLORS.textMuted, lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-ghost">Load from CSV</button>
        <button className="btn btn-primary" onClick={onNext}>
          Generate Policy <Icon.sparkle />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: GENERATION ───────────────────────────────────────────────────────

function Step2({ onNext }) {
  const [phase, setPhase] = useState(0);
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const LOG_LINES = [
    [0, "success", "✓ Company structure parsed — 4 departments, 193 employees"],
    [600, "info", "→ Loading NIST SP 800-207 Zero Trust guidelines..."],
    [1200, "success", "✓ NIST framework loaded (v1.0, 2020)"],
    [1800, "info", "→ Analyzing resource sensitivity classifications..."],
    [2400, "info", "→ Running LLM policy drafting (claude-sonnet-4)..."],
    [3200, "success", "✓ Draft generated — 6 rules across 2 endpoints"],
    [3800, "info", "→ Compiling draft to Rego (OPA policy language)..."],
    [4400, "success", "✓ Rego compilation successful — no syntax errors"],
    [4900, "info", "→ Running NIST alignment checks..."],
    [5400, "success", "✓ NIST checks passed — 8/8 (100%)"],
    [5900, "info", "→ Running shadow-mode simulation (5,000 requests)..."],
    [6800, "success", "✓ Simulation complete — allow rate: 0.8%"],
    [7200, "success", "✓ Policy ready for review"],
  ];

  useEffect(() => {
    let progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressInterval); return 100; }
        return p + (100 / 72);
      });
    }, 100);

    LOG_LINES.forEach(([delay, type, text]) => {
      setTimeout(() => {
        setLines(l => [...l, { type, text }]);
      }, delay);
    });

    setTimeout(() => {
      setPhase(1);
      onNext();
    }, 7800);

    return () => clearInterval(progressInterval);
  }, []);

  const PHASES = ["Parsing Structure", "Loading Frameworks", "Drafting Rules", "Compiling Rego", "NIST Validation", "Simulation"];
  const currentPhase = Math.min(5, Math.floor(progress / 17));

  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease" }}>
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.06em" }}>PIPELINE</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {progress < 100 ? <Spinner /> : <span style={{ color: COLORS.accent }}><Icon.check /></span>}
            <span style={{ fontSize: 11, color: progress < 100 ? COLORS.textMuted : COLORS.accent }}>
              {progress < 100 ? `${Math.floor(progress)}%` : "Complete"}
            </span>
          </div>
        </div>
        <ProgressBar value={progress} animate />
        <div style={{ display: "flex", gap: 0, marginTop: 16, flexWrap: "wrap", gap: 4 }}>
          {PHASES.map((p, i) => (
            <span key={i} className={`tag ${i < currentPhase ? "tag-allow" : i === currentPhase ? "tag-warn" : "tag-muted"}`} style={{ fontSize: 9 }}>
              {i < currentPhase ? "✓ " : ""}{p}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 16, fontFamily: "'IBM Plex Mono', monospace", minHeight: 200, background: COLORS.surfaceHigh }}>
        <div style={{ marginBottom: 10, fontSize: 10, color: COLORS.textDim, letterSpacing: "0.06em" }}>EXECUTION LOG</div>
        {lines.map((line, i) => (
          <div key={i} className={`terminal-line ${line.type}`} style={{ animationDelay: `${i * 0.05}s` }}>
            {line.text}
          </div>
        ))}
        {lines.length < LOG_LINES.length && (
          <div className="terminal-line cursor" style={{ animationDelay: "0s", opacity: 1, color: COLORS.textDim }}>
            &nbsp;
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STEP 3: REVIEW & EDIT ────────────────────────────────────────────────────

function Step3({ onNext }) {
  const [rules, setRules] = useState(GENERATED_RULES);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState("rules");

  const accept = (id) => setRules(r => r.map(x => x.id === id ? { ...x, status: "accepted" } : x));
  const reject = (id) => setRules(r => r.map(x => x.id === id ? { ...x, status: "rejected" } : x));
  const restore = (id) => setRules(r => r.map(x => x.id === id ? { ...x, status: "pending" } : x));

  const accepted = rules.filter(r => r.status === "accepted").length;
  const total = rules.length;

  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Rules Generated", value: total, color: COLORS.text },
          { label: "Accepted", value: rules.filter(r => r.status === "accepted").length, color: COLORS.accent },
          { label: "Pending", value: rules.filter(r => r.status === "pending").length, color: COLORS.warn },
          { label: "Rejected", value: rules.filter(r => r.status === "rejected").length, color: COLORS.danger },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ flex: 1, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "Syne, sans-serif" }}>{value}</div>
            <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
        {[["rules", "Policy Rules"], ["nist", "NIST Report"], ["rego", "Rego Code"]].map(([k, v]) => (
          <div key={k} className={`tab ${activeTab === k ? "active" : ""}`} onClick={() => setActiveTab(k)}>{v}</div>
        ))}
      </div>

      {activeTab === "rules" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rules.map((rule) => (
            <div key={rule.id} className={`card rule-card ${rule.effect} ${rule.status}`} style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
                onClick={() => setExpanded(expanded === rule.id ? null : rule.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span className={`tag ${rule.effect === "allow" ? "tag-allow" : "tag-deny"}`}>{rule.effect.toUpperCase()}</span>
                    <code style={{ fontSize: 11, color: COLORS.info }}>{rule.id}</code>
                    <StatusBadge status={rule.status} />
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.text, marginBottom: 6 }}>{rule.description}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <code style={{ fontSize: 10, color: COLORS.accent, background: COLORS.accentGlow, padding: "1px 6px", borderRadius: 2 }}>{rule.path}</code>
                    {rule.nist.slice(0, 2).map(n => <span key={n} className="tag tag-info" style={{ fontSize: 9 }}>{n}</span>)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 12 }}>
                  {rule.status === "pending" ? (
                    <>
                      <button className="btn btn-secondary" style={{ padding: "6px 12px" }} onClick={(e) => { e.stopPropagation(); accept(rule.id); }}>
                        <Icon.check /> Accept
                      </button>
                      <button className="btn btn-danger" style={{ padding: "6px 12px" }} onClick={(e) => { e.stopPropagation(); reject(rule.id); }}>
                        <Icon.x /> Reject
                      </button>
                    </>
                  ) : rule.status === "rejected" ? (
                    <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={(e) => { e.stopPropagation(); restore(rule.id); }}>
                      Restore
                    </button>
                  ) : (
                    <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={(e) => { e.stopPropagation(); reject(rule.id); }}>
                      <Icon.trash />
                    </button>
                  )}
                  <div style={{ color: COLORS.textMuted, transform: expanded === rule.id ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
                    <Icon.chevronRight />
                  </div>
                </div>
              </div>

              {expanded === rule.id && (
                <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: 16, background: COLORS.surfaceHigh, animation: "fadeIn 0.2s ease" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div className="label">Conditions</div>
                      {rule.conditions.map((c, i) => (
                        <div key={i} style={{ fontSize: 11, color: COLORS.text, padding: "4px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                          <code style={{ color: COLORS.accent }}>{c}</code>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="label">AI Reasoning</div>
                      <p style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6 }}>{rule.reasoning}</p>
                      <div style={{ marginTop: 12 }}>
                        <div className="label">NIST Principles</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {rule.nist.map(n => <span key={n} className="tag tag-info" style={{ fontSize: 9 }}>{n}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "nist" && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="section-title" style={{ fontSize: 14 }}>NIST SP 800-207 Alignment</div>
            <span className="tag tag-allow">8/8 PASS</span>
          </div>
          <ProgressBar value={100} />
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {NIST_CHECKS.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ color: c.ok ? COLORS.accent : COLORS.danger, flexShrink: 0, marginTop: 1 }}>
                  {c.ok ? <Icon.check /> : <Icon.x />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: c.ok ? COLORS.text : COLORS.danger, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted }}>{c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "rego" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: COLORS.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            </div>
            <span style={{ fontSize: 10, color: COLORS.textMuted }}>policy.rego</span>
            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 10 }}><Icon.download /> Copy</button>
          </div>
          <pre style={{ padding: 16, fontSize: 10, lineHeight: 1.8, color: COLORS.text, overflowX: "auto", maxHeight: 400, background: "#f8fafc" }}>
{`package zta.authz

rank := {"low": 0, "medium": 1, "high": 2}

default allow := false
default deny  := false

# ── Helper predicates ──────────────────────────────
any_deny_bad_ip if { input.environment.ip_reputation == "suspicious" }
any_deny_bad_ip if { input.environment.ip_reputation == "malicious" }

# ── Allow rules ────────────────────────────────────
allow_rule["allow_login_standard"] if {
  input.action.name == "login"
  input.resource.sensitivity == "internal"
  input.subject.account_status == "active"
  input.subject.mfa_verified == true
  input.device.managed == true
  input.device.compliant == true
  rank[input.device.risk_level] <= rank["medium"]
}

allow_rule["allow_admin_strict"] if {
  input.action.name == "admin_panel"
  input.resource.sensitivity == "restricted"
  input.subject.user_role == "admin"
  input.subject.account_status == "active"
  input.subject.mfa_verified == true
  input.device.risk_level == "low"
}

# ── Deny rules ─────────────────────────────────────
deny_rule["deny_bad_ip"] if {
  any_deny_bad_ip
}

deny_rule["deny_locked_account"] if {
  input.subject.account_status == "locked"
}

# ── Final decision ─────────────────────────────────
deny  if { count(matched_deny) > 0 }
allow if { count(matched_allow) > 0; not deny }

decision := {
  "allow":         allow,
  "deny":          deny,
  "matched_allow": matched_allow,
  "matched_deny":  matched_deny,
  "obligations":   obligations,
}`}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: COLORS.textMuted }}>
          {accepted}/{total} rules accepted
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost">Save Draft</button>
          <button className="btn btn-primary" onClick={onNext}>
            Run Simulation <Icon.play />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 4: SIMULATION ───────────────────────────────────────────────────────

function Step4({ onNext }) {
  const [simRan, setSimRan] = useState(false);
  const [running, setRunning] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [activeTab, setActiveTab] = useState("sim");

  const runSim = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setSimRan(true); }, 2000);
  };

  const evalScenario = (s) => setScenario(s);

  const maxDeny = Math.max(...SIM_RESULTS.denyRules.map(r => r.count));
  const maxAllow = Math.max(...SIM_RESULTS.allowRules.map(r => r.count));

  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease" }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
        {[["sim", "Shadow Simulation"], ["eval", "Custom Evaluation"]].map(([k, v]) => (
          <div key={k} className={`tab ${activeTab === k ? "active" : ""}`} onClick={() => setActiveTab(k)}>{v}</div>
        ))}
      </div>

      {activeTab === "sim" && (
        <>
          <div className="card" style={{ padding: 20, marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 16 }}>
              Shadow simulation generates 5,000 synthetic access requests across all roles, devices, and environmental conditions. It reveals allow/deny rate distributions and which rules are triggered most.
            </p>
            {!simRan && (
              <button className="btn btn-primary" onClick={runSim} disabled={running}>
                {running ? <><Spinner /> Running...</> : <><Icon.play /> Run Simulation (5,000 requests)</>}
              </button>
            )}
            {running && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 8 }}>Evaluating requests...</div>
                <ProgressBar value={65} animate />
              </div>
            )}
          </div>

          {simRan && (
            <div style={{ animation: "fadeSlideUp 0.4s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Total Requests", value: "5,000", color: COLORS.text },
                  { label: "Allow Rate", value: "0.8%", color: COLORS.accent, sub: "39 allowed" },
                  { label: "Deny Rate", value: "99.2%", color: COLORS.danger, sub: "4,961 denied" },
                ].map(({ label, value, color, sub }) => (
                  <div key={label} className="card-high" style={{ padding: 16 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "Syne, sans-serif", marginBottom: 2 }}>{value}</div>
                    {sub && <div style={{ fontSize: 10, color: COLORS.textMuted }}>{sub}</div>}
                    <div style={{ fontSize: 9, color: COLORS.textDim, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="label" style={{ marginBottom: 12 }}>Top Allow Rules</div>
                  {SIM_RESULTS.allowRules.map(r => (
                    <div key={r.name} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                        <code style={{ color: COLORS.accent }}>{r.name}</code>
                        <span style={{ color: COLORS.textMuted }}>{r.count}</span>
                      </div>
                      <div className="sim-bar">
                        <div className="sim-bar-fill" style={{ width: `${(r.count / maxAllow) * 100}%`, background: COLORS.accent }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="label" style={{ marginBottom: 12 }}>Top Deny Rules</div>
                  {SIM_RESULTS.denyRules.map(r => (
                    <div key={r.name} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                        <code style={{ color: COLORS.danger }}>{r.name}</code>
                        <span style={{ color: COLORS.textMuted }}>{r.count}</span>
                      </div>
                      <div className="sim-bar">
                        <div className="sim-bar-fill" style={{ width: `${(r.count / maxDeny) * 100}%`, background: COLORS.danger }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "eval" && (
        <div>
          <p style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
            Test specific access scenarios against the policy to verify correct behavior before deployment.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {EVAL_SCENARIOS.map((s, i) => (
              <div
                key={i}
                className={`card ${scenario === s ? "card-high" : ""}`}
                style={{ padding: 14, cursor: "pointer", transition: "all 0.15s" }}
                onClick={() => evalScenario(s)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, color: COLORS.white, marginBottom: 6 }}>{s.name}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {Object.entries(s.input).map(([k, v]) => (
                        <span key={k} className="tag tag-muted" style={{ fontSize: 9 }}>{k}: {String(v)}</span>
                      ))}
                    </div>
                  </div>
                  {scenario === s && (
                    <span className={`tag ${s.decision.allow ? "tag-allow" : "tag-deny"}`} style={{ marginLeft: 12, flexShrink: 0 }}>
                      {s.decision.allow ? "ALLOW" : "DENY"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {scenario && (
            <div className="card" style={{ padding: 16, animation: "fadeSlideUp 0.3s ease", borderColor: scenario.decision.allow ? COLORS.accentDim : COLORS.dangerDim }}>
              <div className="label" style={{ marginBottom: 12 }}>Decision Output</div>
              <pre style={{ fontSize: 11, color: COLORS.text, lineHeight: 1.8 }}>
{JSON.stringify(scenario.decision, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-ghost">Export Report</button>
        <button className="btn btn-primary" onClick={onNext}>
          Export & Deploy <Icon.download />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 5: EXPORT ───────────────────────────────────────────────────────────

function Step5() {
  const [exported, setExported] = useState({});

  const doExport = (type) => {
    setExported(e => ({ ...e, [type]: true }));
  };

  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease" }}>
      <div className="card" style={{ padding: 20, marginBottom: 12, borderColor: COLORS.accentDim }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ color: COLORS.accent }}><Icon.check /></div>
          <span className="section-title" style={{ fontSize: 14, color: COLORS.accent }}>Policy Ready</span>
        </div>
        <p style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6 }}>
          Your access control policy has been generated, reviewed, NIST-validated, and simulated. It is ready for export and deployment to your enforcement layer.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          {
            type: "rego",
            title: "Rego Policy File",
            desc: "Ready for OPA deployment. Compatible with Kong, Envoy, and API gateway integrations.",
            tag: ".rego",
            tagCls: "tag-allow",
          },
          {
            type: "json",
            title: "JSON Policy Export",
            desc: "Structured explainability format. Each rule includes AI reasoning, NIST mapping, and audit metadata.",
            tag: ".json",
            tagCls: "tag-info",
          },
          {
            type: "report",
            title: "Audit Report",
            desc: "Full NIST compliance report with rule-by-rule breakdown. Suitable for governance and compliance review.",
            tag: ".pdf",
            tagCls: "tag-warn",
          },
          {
            type: "yaml",
            title: "Policy YAML Source",
            desc: "Human-editable source format. Re-import to regenerate or modify policy rules in future iterations.",
            tag: ".yaml",
            tagCls: "tag-muted",
          },
        ].map(({ type, title, desc, tag, tagCls }) => (
          <div key={type} className={`card ${exported[type] ? "card-high" : ""}`} style={{ padding: 16, transition: "all 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.white }}>{title}</div>
              <span className={`tag ${tagCls}`}>{tag}</span>
            </div>
            <p style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5, marginBottom: 14 }}>{desc}</p>
            <button
              className={`btn ${exported[type] ? "btn-ghost" : "btn-secondary"}`}
              style={{ width: "100%" }}
              onClick={() => doExport(type)}
            >
              {exported[type] ? <><Icon.check /> Downloaded</> : <><Icon.download /> Download {tag}</>}
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="label" style={{ marginBottom: 12 }}>Integration Guidance</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { step: "01", text: "Deploy OPA as a sidecar or policy server in your infrastructure" },
            { step: "02", text: "Load the generated policy.rego into OPA using bundle API or file mount" },
            { step: "03", text: "Route authorization decisions from your app to OPA via REST endpoint" },
            { step: "04", text: "Use the JSON export for audit logging — each decision is fully traceable" },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 10, color: COLORS.accentDim, fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>{step}</span>
              <span style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ onBack }) {
  const metrics = [
    { label: "Policies Generated", value: "3", delta: "+1 this week", color: COLORS.accent },
    { label: "NIST Score", value: "100%", delta: "All 8 checks pass", color: COLORS.accent },
    { label: "Rules Active", value: "12", delta: "across 3 apps", color: COLORS.info },
    { label: "Avg Allow Rate", value: "0.8%", delta: "Shadow sim", color: COLORS.warn },
  ];

  const policies = [
    { id: "website_login_v1", app: "demo_webapp", rules: 6, nist: 100, date: "2026-03-01", status: "active" },
    { id: "api_gateway_v2", app: "internal_api", rules: 9, nist: 87, date: "2026-02-15", status: "draft" },
    { id: "finance_portal_v1", app: "fin_portal", rules: 11, nist: 100, date: "2026-02-01", status: "active" },
  ];

  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {metrics.map(({ label, value, delta, color }) => (
          <div key={label} className="card-high" style={{ padding: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "Syne, sans-serif" }}>{value}</div>
            <div style={{ fontSize: 9, color: COLORS.textDim, letterSpacing: "0.06em", textTransform: "uppercase", margin: "4px 0" }}>{label}</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted }}>{delta}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="section-title" style={{ fontSize: 14 }}>Generated Policies</div>
          <button className="btn btn-primary" style={{ padding: "8px 16px" }} onClick={onBack}>
            <Icon.plus /> New Policy
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {policies.map(p => (
            <div key={p.id} className="card" style={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ color: COLORS.accent }}><Icon.shield /></div>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.white, marginBottom: 3 }}>
                    <code>{p.id}</code>
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted }}>{p.app} · {p.rules} rules · {p.date}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: p.nist === 100 ? COLORS.accent : COLORS.warn, fontWeight: 600 }}>NIST {p.nist}%</div>
                  <div className="progress-bar" style={{ width: 60, marginTop: 4 }}>
                    <div className="progress-fill" style={{ width: `${p.nist}%`, background: p.nist === 100 ? COLORS.accent : COLORS.warn }} />
                  </div>
                </div>
                <span className={`tag ${p.status === "active" ? "tag-allow" : "tag-muted"}`}>{p.status}</span>
                <button className="btn btn-ghost" style={{ padding: "5px 10px" }}>View</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="label" style={{ marginBottom: 12 }}>Policy Coverage by Department</div>
          {[
            { dept: "Engineering", pct: 88 },
            { dept: "Finance", pct: 100 },
            { dept: "HR", pct: 72 },
            { dept: "Executive", pct: 100 },
          ].map(({ dept, pct }) => (
            <div key={dept} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: COLORS.text }}>{dept}</span>
                <span style={{ color: pct === 100 ? COLORS.accent : COLORS.warn }}>{pct}%</span>
              </div>
              <div className="sim-bar">
                <div className="sim-bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? COLORS.accent : COLORS.warn }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="label" style={{ marginBottom: 12 }}>Recent Activity</div>
          {[
            { time: "2h ago", event: "Policy website_login_v1 generated", type: "success" },
            { time: "2h ago", event: "NIST validation passed (8/8)", type: "success" },
            { time: "3h ago", event: "Shadow simulation ran — 5,000 requests", type: "info" },
            { time: "1d ago", event: "api_gateway_v2 saved as draft", type: "warn" },
            { time: "1d ago", event: "deny_admin_bad_signals flagged for review", type: "warn" },
          ].map(({ time, event, type }, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 9, color: COLORS.textDim, flexShrink: 0, marginTop: 1 }}>{time}</span>
              <span style={{ fontSize: 11, color: type === "success" ? COLORS.text : type === "warn" ? COLORS.warn : COLORS.info }}>{event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("wizard"); // "wizard" | "dashboard"
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  const STEPS = ["Structure", "Generate", "Review", "Simulate", "Export"];

  const goNext = () => {
    if (step === 1) {
      // Generation step: auto-advance handled by component
      setStep(2);
    } else {
      setStep(s => Math.min(4, s + 1));
    }
  };

  const resetWizard = () => {
    setStep(0);
    setView("wizard");
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: COLORS.bg }}>

        {/* NAV */}
        <nav style={{
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "0 32px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: COLORS.surface,
          zIndex: 100,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: COLORS.accent }}><Icon.shield /></div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: COLORS.white, letterSpacing: "0.02em" }}>
              PolicyGen<span style={{ color: COLORS.accent }}>AI</span>
            </span>
            <span style={{ fontSize: 9, color: COLORS.textDim, letterSpacing: "0.08em", marginLeft: 4 }}>ENTERPRISE</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["wizard", "dashboard"].map(v => (
              <button
                key={v}
                className={`btn ${view === v ? "btn-secondary" : "btn-ghost"}`}
                style={{ padding: "6px 14px" }}
                onClick={() => { setView(v); if (v === "wizard") setStep(0); }}
              >
                {v === "wizard" ? "New Policy" : "Dashboard"}
              </button>
            ))}
          </div>
        </nav>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

          {view === "dashboard" ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <div className="section-title" style={{ marginBottom: 4 }}>Policy Dashboard</div>
                <p style={{ fontSize: 11, color: COLORS.textMuted }}>Monitor all generated policies, NIST scores, and deployment status.</p>
              </div>
              <Dashboard onBack={() => { setView("wizard"); setStep(0); }} />
            </>
          ) : (
            <>
              {/* WIZARD HEADER */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div className="section-title" style={{ marginBottom: 4 }}>
                      {["Define Company Structure", "Generating Policy", "Review & Edit Rules", "Simulation & Validation", "Export & Deploy"][step]}
                    </div>
                    <p style={{ fontSize: 11, color: COLORS.textMuted }}>
                      {[
                        "Tell us about your organization. The AI will learn your structure.",
                        "The AI is analyzing your input and drafting access control rules.",
                        "Review each generated rule. Provide human oversight before deployment.",
                        "Validate behavior with shadow-mode simulation before going live.",
                        "Export in multiple formats. Integrate with your enforcement layer.",
                      ][step]}
                    </p>
                  </div>
                  <StepIndicator steps={STEPS} current={step} />
                </div>
                <ProgressBar value={(step / 4) * 100} />
              </div>

              {/* WIZARD CONTENT */}
              {step === 0 && <Step1 onNext={() => { setStep(1); }} />}
              {step === 1 && <Step2 onNext={() => setStep(2)} />}
              {step === 2 && <Step3 onNext={() => setStep(3)} />}
              {step === 3 && <Step4 onNext={() => setStep(4)} />}
              {step === 4 && <Step5 />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
