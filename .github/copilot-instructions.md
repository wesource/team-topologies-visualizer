# Team Topologies Visualization Project

## Machine-Specific Context
**IMPORTANT**: Check `.ai-context.md` in the project root for machine-specific setup, test commands, and development workflows. This file is gitignored and contains local environment details.

## Development Workflow
- **Local development preferred**: For frontend changes, just start Python backend (`python -m uvicorn main:app --reload`) and refresh browser - no Docker/Podman build needed
- **Use containers sparingly**: Only for final validation, not regular iteration
- **Update CHANGELOG.md**: Document design decisions, approaches tried, and why certain implementations were chosen during development
- **Test-driven development preferred**: Write failing test first, then implement feature
- **Always add tests when implementing new features** - unit tests (Vitest/pytest) and consider E2E tests (Playwright) for user-facing features

## Linting Requirements
**CRITICAL**: Always run linters before committing:

### Python (Ruff)
```powershell
python -m ruff check backend/ tests_backend/ main.py --fix
```

**Common rules to avoid**:
- **F401**: Remove unused imports
- **B007**: Prefix unused loop variables with underscore (e.g., `for _key, value in items()`)
- **Trailing whitespace**: Auto-fixed with `--fix`

### JavaScript (ESLint)
```powershell
cd frontend
npm run lint -- --fix
```

## Running Tests
**IMPORTANT**: Always use venv Python to run pytest on Windows:

### Backend Tests (pytest)
```powershell
# CORRECT way (Windows with venv)
.\venv\Scripts\python.exe -m pytest tests_backend/ -v

# DON'T try these - they won't work:
pytest tests_backend/ -v  # ❌ pytest not in PATH
python -m pytest          # ❌ wrong Python interpreter
```

### Frontend Tests (Vitest)
```powershell
cd frontend
npm test
```

### E2E Tests (Playwright)
```powershell
cd tests
npx playwright test
```

**E2E tests auto-start backend**: Playwright automatically starts/stops uvicorn server on port 8000.

### Run All Tests
```powershell
.\run-all-tests.ps1
```

**Test Coverage**: 332 total tests (55 backend + 195 frontend + 82 E2E)

## Project Overview
A webapp for visualizing Team Topologies concepts using HTML5 Canvas and Python FastAPI backend.

**Views**:
- **Pre-TT (Current State)**: Organization hierarchy, product lines, value streams
- **TT Design**: Team topologies design with 4 team types and 3 interaction modes
- **Comparison**: Side-by-side comparison of snapshots

## Technology Stack
- **Backend**: Python 3.8+ with FastAPI
- **Frontend**: HTML5 Canvas with vanilla JavaScript (no build step)
- **Testing**: pytest (backend), Vitest (frontend), Playwright (E2E)
- **Linting**: Ruff (Python), ESLint (JavaScript)
- **Data Storage**: Markdown files with YAML front matter (Team API template format)

## Team Topologies Concepts
- **4 Team Types**: Stream-aligned, Enabling, Complicated Subsystem, Platform
- **3 Interaction Modes**: Collaboration, X-as-a-Service, Facilitating
- **Team API**: Using https://github.com/TeamTopologies/Team-API-template format

## Development Guidelines

### Code Quality
- Run linters before every commit (ruff + eslint)
- Prefix unused variables with underscore: `_unused`
- Remove unused imports immediately
- No trailing whitespace

### Testing
- **Test-driven development**: Write failing test first, then implement
- **Always add tests** for new features (unit + E2E for user-facing features)
- Run full test suite before committing: `.\run-all-tests.ps1`

### Data & API Design
- Keep markdown files simple and follow Team API template structure
- Parse YAML front matter for team metadata
- Use RESTful API design for team CRUD operations
- API routes split: `/api/pre-tt/*` (current state) and `/api/tt/*` (TT design)

### Frontend
- Canvas should support drag-and-drop team positioning
- Visual distinction between team types and interaction modes
- No build step required - FastAPI serves static files from `frontend/` directory
- Just refresh browser after code changes during development
