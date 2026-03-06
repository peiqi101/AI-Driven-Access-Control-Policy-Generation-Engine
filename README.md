# PolicyGenAI - Access Control Policy Generator

AI-driven system for generating, validating, and deploying access control policies.

## 🏗️ Architecture

- **Backend**: Python FastAPI + OPA (Open Policy Agent)
- **Frontend**: React + Vite
- **Features**: YAML → Rego compilation, NIST compliance checks, shadow-mode simulation

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt --break-system-packages

# Download OPA (Windows)
curl -L -o opa.exe https://openpolicyagent.org/downloads/latest/opa_windows_amd64.exe
chmod +x opa.exe

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## 📁 Project Structure
```
project/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── policy_engine.py     # Policy generation logic
│   ├── requirements.txt     # Python dependencies
│   └── opa.exe             # OPA binary
└── frontend/
    ├── src/
    │   ├── PolicyGenUI.jsx  # Main UI component
    │   ├── api.js          # Backend API client
    │   └── App.jsx         # App entry point
    ├── package.json
    └── vite.config.js
```

## 🔗 API Endpoints

- `POST /api/generate` - Generate policy from YAML
- `POST /api/eval` - Evaluate access request
- `POST /api/simulate` - Run shadow-mode simulation
- `GET /api/health` - Health check
