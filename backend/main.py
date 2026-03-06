# main.py  —  FastAPI backend for PolicyGenAI
# Run with:  uvicorn main:app --reload --port 8000

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import yaml, json, os

from policy_engine import (
    PolicyDraft,
    nist_alignment_report,
    compile_to_rego,
    generate_rego_tests,
    opa_eval,
    opa_test,
    run_simulation,
    draft_rules_with_gemini,
)

app = FastAPI(title="PolicyGenAI Backend", version="1.0.0")

# Allow React dev server (localhost:3000 / 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request/Response models ───────────────────────────────────────────────────

class YAMLInput(BaseModel):
    yaml_text: str

class NLInput(BaseModel):
    nl_requirements: str
    app: str = "demo_webapp"
    policy_id: str = "generated_policy_v1"
    gemini_api_key: Optional[str] = None  # or set via env var GEMINI_API_KEY

class EvalInput(BaseModel):
    rego_code: str
    input_obj: dict

class SimInput(BaseModel):
    rego_code: str
    n: int = 5000
    app: str = "demo_webapp"

# ── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/api/parse-yaml")
def parse_yaml(body: YAMLInput):
    """
    Step 1 of wizard: parse + validate YAML input.
    React sends the YAML string, gets back the structured PolicyDraft.
    """
    try:
        raw = yaml.safe_load(body.yaml_text)
        draft = PolicyDraft(**raw)
        return {
            "ok": True,
            "policy_id": draft.policy_id,
            "rule_count": len(draft.rules or []),
            "example_count": len(draft.examples),
            "draft": json.loads(draft.model_dump_json()),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/generate")
def generate_policy(body: YAMLInput):
    """
    Step 2 of wizard: full pipeline.
    1. Parse YAML
    2. Run NIST alignment on YAML
    3. Compile to Rego
    4. Run Rego NIST static checks
    5. Generate test code
    6. Run OPA tests
    Returns everything the UI needs to show in the Review step.
    """
    try:
        raw = yaml.safe_load(body.yaml_text)
        draft = PolicyDraft(**raw)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"YAML parse error: {e}")

    # NIST check on YAML rules
    nist_yaml = nist_alignment_report(draft)

    # Compile to Rego
    try:
        rego_code = compile_to_rego(draft)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Rego compile error: {e}")

    # Generate + run OPA tests
    tests_code = generate_rego_tests(draft)
    opa_results = opa_test(rego_code, tests_code)

    return {
        "ok": True,
        "draft": json.loads(draft.model_dump_json()),
        "rego_code": rego_code,
        "tests_code": tests_code,
        "nist_yaml": nist_yaml,
        "opa_tests": opa_results,
    }


@app.post("/api/generate-from-nl")
def generate_from_nl(body: NLInput):
    """
    Alternative Step 2: generate from natural language using Gemini.
    Used when the user types a description instead of YAML.
    """
    api_key = body.gemini_api_key or os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=400, detail="No Gemini API key provided.")

    # Build a minimal draft with just NL requirements
    stub = PolicyDraft(
        policy_id=body.policy_id,
        description=body.nl_requirements,
        app=body.app,
        nl_requirements=body.nl_requirements,
        rules=None,
    )

    try:
        draft = draft_rules_with_gemini(stub, api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {e}")

    nist_yaml = nist_alignment_report(draft)
    rego_code = compile_to_rego(draft)
    tests_code = generate_rego_tests(draft)
    opa_results = opa_test(rego_code, tests_code)

    return {
        "ok": True,
        "draft": json.loads(draft.model_dump_json()),
        "rego_code": rego_code,
        "tests_code": tests_code,
        "nist_yaml": nist_yaml,
        "opa_tests": opa_results,
    }


@app.post("/api/nist-check")
def nist_check(body: YAMLInput):
    """
    Run NIST alignment checks on a YAML policy draft.
    """
    try:
        raw = yaml.safe_load(body.yaml_text)
        draft = PolicyDraft(**raw)
        report = nist_alignment_report(draft)
        return {"ok": True, "report": report}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/eval")
def eval_request(body: EvalInput):
    """
    Step 4 / custom eval: evaluate a single access request against a Rego policy.
    React sends rego_code + input JSON, gets back allow/deny decision.
    """
    try:
        decision = opa_eval(body.rego_code, body.input_obj)
        return {"ok": True, "decision": decision}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/simulate")
def simulate(body: SimInput):
    """
    Step 4: shadow-mode simulation.
    Generates N synthetic requests, evaluates them, returns stats.
    Warning: N=5000 takes ~30s. For UI demos, use n=500.
    """
    try:
        results = run_simulation(body.rego_code, n=body.n, app=body.app)
        return {"ok": True, **results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health():
    return {"status": "ok"}
