# Development Guide

This file is a short entry point for contributors. The canonical docs live in:

- [docs/development.md](docs/development.md) (workflow, debugging, git conventions)
- [docs/testing.md](docs/testing.md) (what to run + how to debug tests)
- [docs/architecture.md](docs/architecture.md) (code structure)

Also note: `.ai-context.md` (gitignored) contains machine-specific commands and setup notes.

## Quick Start (Local)

```powershell
# Create venv
py -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python deps
python -m pip install -r requirements.txt

# Install frontend deps
cd frontend
npm install
cd ..

# Run the app
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Open: http://localhost:8000/static/index.html

## Tests

```powershell
# Run everything
.\scripts\run-all-tests.ps1

# Backend only (Windows venv)
.\venv\Scripts\python.exe -m pytest tests_backend/ -v

# Frontend only
cd frontend
npm test

# E2E only
cd ..\tests
npx playwright test
```

## Lint

```powershell
# Python (Ruff)
python -m ruff check backend/ tests_backend/ main.py --fix

# JavaScript (ESLint)
cd frontend
npm run lint -- --fix
```

## Common Loop

- Edit backend (`backend/`, `main.py`) → server reloads
- Edit frontend (`frontend/`) → refresh browser (Ctrl+Shift+R if cached)
- Edit data (`data/`) → click “Refresh” in the UI
