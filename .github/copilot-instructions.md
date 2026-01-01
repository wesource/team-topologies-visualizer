# Team Topologies Visualization Project

## Machine-Specific Context
**IMPORTANT**: Check `.ai-context.md` in the project root for machine-specific setup, test commands, and development workflows. This file is gitignored and contains local environment details.

## Development Workflow
- **Local development preferred**: For frontend changes, just start Python backend (`python -m uvicorn main:app --reload`) and refresh browser - no Docker/Podman build needed
- **Use containers sparingly**: Only for final validation, not regular iteration
- **Update CHANGELOG.md**: Document design decisions, approaches tried, and why certain implementations were chosen during development
- **Test-driven development preferred**: Write failing test first, then implement feature
- **Always add tests when implementing new features** - unit tests (Vitest/pytest) and consider E2E tests (Playwright) for user-facing features

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

**Test Summary**: 95 total tests (10 backend + 62 frontend + 23 E2E)

## Project Overview
A webapp for visualizing Team Topologies concepts using HTML5 Canvas and Python FastAPI backend.

## Technology Stack
- **Backend**: Python with FastAPI
- **Frontend**: HTML5 Canvas with vanilla JavaScript
- **Data Storage**: Markdown files with YAML front matter (Team API template format)

## Team Topologies Concepts
- **4 Team Types**: Stream-aligned, Enabling, Complicated Subsystem, Platform
- **3 Interaction Modes**: Collaboration, X-as-a-Service, Facilitating
- **Team API**: Using https://github.com/TeamTopologies/Team-API-template format

## Development Guidelines
- Keep markdown files simple and follow Team API template structure
- Parse YAML front matter for team metadata
- Use RESTful API design for team CRUD operations
- Canvas should support drag-and-drop team positioning
- Visual distinction between team types and interaction modes
- **Always add tests when implementing new features** - unit tests (Vitest/pytest) and consider E2E tests (Playwright) for user-facing features
- Test-driven development preferred: write failing test first, then implement feature
