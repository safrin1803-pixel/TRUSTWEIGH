# TRUSTWEIGH
## Detection and Prevention of Tampering in Weighing and Measuring Instruments

TRUSTWEIGH is a prototype for monitoring weighing/measuring instruments, evaluating device trust, and presenting device status, alerts, analytics, and reports through a web dashboard.

> **Implementation note:** This documentation pack is a starting point based on the repository structure (`backend/`, `frontend/`, and `wokwi/`). Verify setup commands, database details, API fields, and model behavior against the actual source code before relying on them.

## Repository structure

- `backend/` — Python backend, routes, device handling, trust evaluation, and reporting.
- `frontend/` — React/Vite web interface.
- `wokwi/` — Wokwi simulation files.
- `docs/` — technical design and architecture.
- `sample_data/` — illustrative sample device records.
- `tests/` — manual test cases.

## Prerequisites

- Python version compatible with the backend dependencies.
- Node.js and npm.
- Git.
- Any database/service required by the backend configuration.

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/safrin1803-pixel/TRUSTWEIGH.git
cd TRUSTWEIGH
```

### 2. Backend setup

Create and activate a virtual environment from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies using the dependency manifest that actually exists in this repository. For example, if the backend has a `requirements.txt` file:

```powershell
pip install -r backend/requirements.txt
```

If that file does not exist, inspect the backend's dependency files and install from the correct manifest. Do not create an empty requirements file or guess package versions.

The repository has previously been run with this command, if `backend/main.py` exposes a FastAPI application named `app`:

```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001
```

Check `backend/main.py` and the installed dependencies if startup fails.

### 3. Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. The port may vary if the default port is busy.

Check `frontend/src/api.js` and the backend configuration to ensure the API base URL and backend port match.

### 4. Wokwi simulation

Open the files in `wokwi/` in the appropriate Wokwi environment. Verify the simulation's device settings and communication configuration against the backend before testing end-to-end behavior.

## Environment variables and secrets

Inspect the backend source and configuration to determine the exact environment variable names required by this project. Document the names and safe example values in a `.env.example` file only after verifying them.

- Never commit real `.env` files, passwords, database credentials, access tokens, or private keys.
- Do not put real secrets in README examples or screenshots.
- If a secret was committed previously, removing it from a later commit is not enough; rotate/revoke it and clean repository history as appropriate.

## Sample data and testing

- Illustrative device records: `sample_data/sample_devices.json`
- Manual test cases: `tests/TEST_CASES.md`
- Architecture and technical design: `docs/TECHNICAL_DESIGN.md`

Sample fields and expected outcomes must be checked against the actual API/model schema before using the data in live requests.

## Main areas to verify

- Backend startup and frontend connectivity.
- Device registration and status.
- Trust evaluation and suspicious-device alerts.
- Analytics and report generation.
- Wokwi data transmission.
- Authentication, database configuration, and error handling.

## Repository

https://github.com/safrin1803-pixel/TRUSTWEIGH
