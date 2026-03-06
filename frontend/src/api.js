// api.js  —  drop this in your React src/ folder
// All calls to the FastAPI backend go through here

const BASE = "http://localhost:8000/api";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

/**
 * Step 1 — Validate YAML structure
 * Call when user clicks "Done" on the YAML editor
 */
export async function parseYAML(yamlText) {
  return post("/parse-yaml", { yaml_text: yamlText });
}

/**
 * Step 2 — Full generation pipeline (YAML → Rego + NIST + OPA tests)
 * Call when user clicks "Generate Policy"
 * Returns: { draft, rego_code, nist_yaml, opa_tests }
 */
export async function generatePolicy(yamlText) {
  return post("/generate", { yaml_text: yamlText });
}

/**
 * Step 2 (alt) — Generate from natural language using Gemini
 * Call if user types a description instead of YAML
 */
export async function generateFromNL({ nlRequirements, app, policyId, geminiApiKey }) {
  return post("/generate-from-nl", {
    nl_requirements: nlRequirements,
    app,
    policy_id: policyId,
    gemini_api_key: geminiApiKey,
  });
}

/**
 * Step 4 — Evaluate a single access request
 * Returns: { decision: { allow, deny, matched_allow, matched_deny, obligations } }
 */
export async function evalRequest(regoCode, inputObj) {
  return post("/eval", { rego_code: regoCode, input_obj: inputObj });
}

/**
 * Step 4 — Shadow-mode simulation
 * n: number of synthetic requests (use 500 for fast demo, 5000 for full)
 * Returns: { total, allow_rate, allow_rules, deny_rules }
 */
export async function simulate(regoCode, { n = 500, app = "demo_webapp" } = {}) {
  return post("/simulate", { rego_code: regoCode, n, app });
}
