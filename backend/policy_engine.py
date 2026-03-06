# policy_engine.py
# Extracted from CAPSTONE_DEMO3.ipynb — pure Python module (no Colab widgets)

import os, re, json, yaml, subprocess, tempfile, random
import os
from pathlib import Path
from typing import List, Optional, Literal, Union
from collections import Counter
from pydantic import BaseModel, Field, model_validator

# Define OPA binary path (in the same directory as this file)
OPA_BINARY = str(Path(__file__).parent / 'opa.exe')

# ── Schema (from Cell 5) ──────────────────────────────────────────────────────

ALLOWED_CONDITION_PATHS = {
    "subject.user_role",
    "subject.account_status",
    "subject.mfa_verified",
    "device.managed",
    "device.compliant",
    "device.risk_level",
    "environment.ip_reputation",
    "environment.geo_risk",
    "environment.time_window",
    "resource.sensitivity",
}

class Condition(BaseModel):
    path: str
    op: Literal["eq", "neq", "in", "not_in", "gte_ranked", "lte_ranked"]
    value: Union[str, bool, int, List[Union[str, bool, int]]]

    @model_validator(mode="after")
    def _validate_path(self):
        if self.path not in ALLOWED_CONDITION_PATHS:
            raise ValueError(f"Condition path not allowed: {self.path}")
        return self

class Rule(BaseModel):
    rule_id: str = Field(..., min_length=3)
    effect: Literal["allow", "deny"]
    description: str = Field(..., min_length=5)
    action: Literal["login", "view", "edit", "admin_panel"]
    app: str = Field(..., min_length=1)
    path_prefix: str = Field(..., min_length=1)
    sensitivity: Literal["public", "internal", "restricted"]
    conditions_all: List[Condition] = Field(default_factory=list)
    conditions_any: List[Condition] = Field(default_factory=list)
    obligations: List[str] = Field(default_factory=lambda: ["log"])
    nist_notes: List[str] = Field(default_factory=list)

class Example(BaseModel):
    name: str
    expect_allow: bool
    input: dict

class PolicyDraft(BaseModel):
    policy_id: str = Field(..., min_length=3)
    description: str = Field(..., min_length=5)
    app: str = Field(..., min_length=1)
    default_effect: Literal["deny", "allow"] = "deny"
    rules: Optional[List[Rule]] = None
    nl_requirements: Optional[str] = None
    examples: List[Example] = Field(default_factory=list)

    @model_validator(mode="after")
    def _rules_or_nl(self):
        if (not self.rules or len(self.rules) == 0) and \
           (not self.nl_requirements or len(self.nl_requirements.strip()) == 0):
            raise ValueError("Provide either 'rules' OR 'nl_requirements'.")
        return self

RANK = {"low": 0, "medium": 1, "high": 2}

# ── NIST Alignment on YAML (from NIST alignment check cell) ──────────────────

def nist_alignment_report(draft: PolicyDraft) -> dict:
    report = {"pass": True, "checks": []}

    def add(check_name, ok, detail=""):
        report["checks"].append({"check": check_name, "ok": bool(ok), "detail": detail})
        if not ok:
            report["pass"] = False

    add("Default deny", draft.default_effect == "deny",
        f"default_effect={draft.default_effect}")

    rules = draft.rules or []
    deny_rules = [r for r in rules if r.effect == "deny"]
    allow_rules = [r for r in rules if r.effect == "allow"]

    add("Has deny rules", len(deny_rules) > 0, f"deny_rules={len(deny_rules)}")
    add("Has allow rules", len(allow_rules) > 0, f"allow_rules={len(allow_rules)}")

    risky_paths = {"environment.ip_reputation", "environment.geo_risk"}
    risky_deny = any(
        {c.path for c in (r.conditions_all + r.conditions_any)} & risky_paths
        for r in deny_rules
    )
    add("Deny covers risky environment signals (ip/geo)", risky_deny,
        "Need a deny rule using environment.ip_reputation and/or environment.geo_risk")

    ID_PATHS = {"subject.user_role", "subject.account_status", "subject.mfa_verified"}
    DEVICE_PATHS = {"device.managed", "device.compliant", "device.risk_level"}
    ENV_PATHS = {"environment.ip_reputation", "environment.geo_risk", "environment.time_window"}

    def has_any(rule, paths):
        used = {c.path for c in (rule.conditions_all + rule.conditions_any)}
        return bool(used & set(paths))

    ok_mix = all(
        has_any(r, ID_PATHS) and (has_any(r, DEVICE_PATHS) or has_any(r, ENV_PATHS))
        for r in allow_rules
    )
    add("Allow rules use explicit verification signals", ok_mix,
        "Each allow rule should include identity + device/environment conditions")

    log_ok = all("log" in (r.obligations or []) for r in allow_rules)
    add("Allow rules include log obligation", log_ok, "Add obligations: [log] to allow rules")

    admin_allows = [r for r in allow_rules if r.action == "admin_panel"]
    if admin_allows:
        mfa_ok = all(
            "subject.mfa_verified" in {c.path for c in (r.conditions_all + r.conditions_any)}
            for r in admin_allows
        )
        add("Admin panel allow requires MFA", mfa_ok,
            "Admin allow rules must include subject.mfa_verified == true")

    return report

# ── Rego Compiler (from Cell 11) ─────────────────────────────────────────────

def rego_lit(x):
    if isinstance(x, bool): return "true" if x else "false"
    if isinstance(x, (int, float)): return str(x)
    if isinstance(x, str): return json.dumps(x)
    if isinstance(x, list): return "[" + ", ".join(rego_lit(v) for v in x) + "]"
    if x is None: return "null"
    return json.dumps(x)

def _sanitize(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_]", "_", name)

def compile_to_rego(d: PolicyDraft, package_name="zta.authz") -> str:
    if not d.rules or len(d.rules) == 0:
        raise ValueError("No rules available to compile.")

    lines = []
    lines.append(f"package {package_name}\n")
    lines.append('rank := {"low": 0, "medium": 1, "high": 2}\n')
    lines.append("default allow := false")
    lines.append("default deny := false\n")

    helper_blocks = []

    def cond_expr_or_helper(rule_id, idx, c):
        path = "input." + c.path
        if c.op == "eq": return f"{path} == {rego_lit(c.value)}"
        if c.op == "neq": return f"{path} != {rego_lit(c.value)}"
        if c.op == "lte_ranked": return f"rank[{path}] <= rank[{rego_lit(c.value)}]"
        if c.op == "gte_ranked": return f"rank[{path}] >= rank[{rego_lit(c.value)}]"
        if c.op in ["in", "not_in"]:
            if not isinstance(c.value, list):
                raise ValueError(f"{c.op} requires list value")
            hname = f"cond_{_sanitize(rule_id)}_{idx}"
            for v in c.value:
                helper_blocks.append(f"{hname} if {{ {path} == {rego_lit(v)} }}")
            return hname if c.op == "in" else f"not {hname}"
        raise ValueError(f"Unsupported op: {c.op}")

    obligations_map_entries = []
    allow_blocks, deny_blocks = [], []

    for r in d.rules:
        common = [
            f'input.action.name == "{r.action}"',
            f'input.resource.app == "{r.app}"',
            f'startswith(input.resource.path, "{r.path_prefix}")',
            f'input.resource.sensitivity == "{r.sensitivity}"',
        ]
        all_lines = ["  " + x for x in common]
        idx_counter = 0

        for c in r.conditions_all:
            idx_counter += 1
            all_lines.append("  " + cond_expr_or_helper(r.rule_id, idx_counter, c))

        if r.conditions_any:
            any_name = f"any_{_sanitize(r.rule_id)}"
            for c in r.conditions_any:
                idx_counter += 1
                expr = cond_expr_or_helper(r.rule_id, idx_counter, c)
                helper_blocks.append(f"{any_name} if {{ {expr} }}")
            all_lines.append(f"  {any_name}")

        head = "allow_rule" if r.effect == "allow" else "deny_rule"
        block = [f'{head}[{rego_lit(r.rule_id)}] if {{'] + (all_lines or ["  true"]) + ["}"]

        if r.effect == "allow":
            allow_blocks.append("\n".join(block))
            obligations_map_entries.append(f"  {rego_lit(r.rule_id)}: {rego_lit(r.obligations)},")
        else:
            deny_blocks.append("\n".join(block))

    if helper_blocks:
        lines.append("\n# --- Helper predicates (OR via multiple bodies) ---")
        lines.extend(helper_blocks)
        lines.append("")
    if allow_blocks:
        lines.append("# --- Allow rules ---")
        lines.extend(allow_blocks)
        lines.append("")
    if deny_blocks:
        lines.append("# --- Deny rules ---")
        lines.extend(deny_blocks)
        lines.append("")

    lines.append("matched_allow := {rid | allow_rule[rid]}")
    lines.append("matched_deny  := {rid | deny_rule[rid]}\n")
    lines.append("deny if { count(matched_deny) > 0 }")
    lines.append("allow if { count(matched_allow) > 0; not deny }\n")
    lines.append("rule_obligations := {")
    lines.extend(obligations_map_entries or ["  # no allow rules"])
    lines.append("}\n")
    lines.append("obligations := [o | some rid; allow_rule[rid]; o := rule_obligations[rid][_]]\n")
    lines.append("decision := {")
    lines.append('  "allow": allow,')
    lines.append('  "deny": deny,')
    lines.append('  "matched_allow": matched_allow,')
    lines.append('  "matched_deny": matched_deny,')
    lines.append('  "obligations": obligations')
    lines.append("}\n")

    return "\n".join(lines)

# ── OPA helpers ───────────────────────────────────────────────────────────────

def opa_eval(rego_code: str, input_obj: dict, package_name="zta.authz") -> dict:
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, "policy.rego"), "w") as f:
            f.write(rego_code)
        in_path = os.path.join(td, "input.json")
        with open(in_path, "w") as f:
            f.write(json.dumps(input_obj))
        q = f"data.{package_name}.decision"
        p = subprocess.run(
            [OPA_BINARY, "eval", "-d", td, "-i", in_path, q, "--format=json"],
            capture_output=True, text=True
        )
        if p.returncode != 0:
            raise RuntimeError(f"OPA eval failed:\n{p.stderr}")
        out = json.loads(p.stdout)
        return out["result"][0]["expressions"][0]["value"]

def opa_test(rego_code: str, tests_code: str) -> dict:
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, "policy.rego"), "w") as f:
            f.write(rego_code)
        with open(os.path.join(td, "policy_test.rego"), "w") as f:
            f.write(tests_code)
        p = subprocess.run(
            [OPA_BINARY, "test", td, "-v", "--format=json"],
            capture_output=True, text=True
        )
        try:
            return json.loads(p.stdout)
        except Exception:
            return {"raw": p.stdout, "error": p.stderr, "passed": p.returncode == 0}

def generate_rego_tests(d: PolicyDraft, package_name="zta.authz") -> str:
    lines = [f"package {package_name}\n"]
    for ex in d.examples:
        test_name = re.sub(r"[^a-zA-Z0-9_]", "_", ex.name)
        expect = "true" if ex.expect_allow else "false"
        inp = json.dumps(ex.input, indent=2)
        lines.append(f"test_{test_name} if {{")
        lines.append(f"  dec := data.{package_name}.decision with input as {inp}")
        lines.append(f"  dec.allow == {expect}")
        lines.append("}\n")
    return "\n".join(lines)

# ── Shadow simulation (from last cell) ───────────────────────────────────────

def run_simulation(rego_code: str, n: int = 5000, app: str = "demo_webapp",
                   package_name: str = "zta.authz") -> dict:
    def random_ctx():
        action = random.choice(["login", "admin_panel"])
        path = "/login" if action == "login" else random.choice(["/admin", "/admin/settings"])
        return {
            "subject": {
                "user_role": random.choice(["guest", "user", "admin"]),
                "account_status": random.choice(["active", "active", "active", "locked"]),
                "mfa_verified": random.choice([True, False]),
            },
            "device": {
                "managed": random.choice([True, False]),
                "compliant": random.choice([True, False]),
                "risk_level": random.choice(["low", "medium", "high"]),
            },
            "environment": {
                "ip_reputation": random.choice(["good", "good", "suspicious", "malicious"]),
                "geo_risk": random.choice(["low", "medium", "high"]),
                "time_window": random.choice(["business_hours", "after_hours"]),
            },
            "resource": {
                "app": app,
                "path": path,
                "sensitivity": "internal" if action == "login" else "restricted",
            },
            "action": {"name": action},
        }

    decisions, allow_rules, deny_rules = [], Counter(), Counter()
    for _ in range(n):
        ctx = random_ctx()
        dec = opa_eval(rego_code, ctx, package_name)
        decisions.append(bool(dec.get("allow", False)))
        for rid in dec.get("matched_allow", []):
            allow_rules[rid] += 1
        for rid in dec.get("matched_deny", []):
            deny_rules[rid] += 1

    return {
        "total": n,
        "allow_rate": round(sum(decisions) / n, 4),
        "allow_rules": dict(allow_rules.most_common(10)),
        "deny_rules": dict(deny_rules.most_common(10)),
    }

# ── Gemini drafting (from Cell 9) ────────────────────────────────────────────

def draft_rules_with_gemini(d: PolicyDraft, gemini_api_key: str,
                             model: str = "gemini-2.0-flash") -> PolicyDraft:
    from google import genai
    client = genai.Client(api_key=gemini_api_key)
    schema = PolicyDraft.model_json_schema()
    prompt = f"""
You draft NIST Zero Trust access-control rules for website/login authorization.
Return ONLY valid JSON conforming to this schema (no markdown, no commentary):
{json.dumps(schema, indent=2)}

Hard constraints:
- default_effect must be "deny"
- Use ONLY these condition paths: {sorted(ALLOWED_CONDITION_PATHS)}
- Include both deny and allow rules
- Actions limited to: login, view, edit, admin_panel
- Sensitivity limited to: public, internal, restricted

Input draft:
{d.model_dump_json(indent=2)}
""".strip()

    resp = client.models.generate_content(model=model, contents=prompt)
    m = re.search(r"\{.*\}", resp.text or "", flags=re.DOTALL)
    if not m:
        raise ValueError("No JSON found in Gemini response")
    return PolicyDraft(**json.loads(m.group(0)))
