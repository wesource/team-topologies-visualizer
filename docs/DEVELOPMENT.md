# Development Guide

Quick reference for developing, testing, and contributing to the Team Topologies Visualizer.

## Project Context

**Date**: January 2026  
**Approach**: AI-assisted development (GitHub Copilot + Claude)  
**Purpose**: Learning project - exploring FastAPI, frontend Canvas rendering, and testing while building a practical Team Topologies visualization tool

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for technical design details and module structure.

**Quick Overview**:
- **Backend**: Python 3.10+ with FastAPI (modular: models, services, routes)
- **Frontend**: Vanilla JavaScript with HTML5 Canvas (ES6 modules, no build step)
- **Data**: Markdown + YAML (git-friendly, human-readable)

## Testing

See [TESTING.md](TESTING.md) for the test strategy (unit vs E2E) and the hidden DOM pattern used for canvas testing.

**Quick Commands**:
```powershell
# Run all tests
.\scripts\run-all-tests.ps1

# Backend only (Windows)
.\venv\Scripts\python.exe -m pytest tests_backend/ -v

# Frontend only
cd frontend && npm test

# E2E only
cd tests && npx playwright test
```

## Quick Workflow
Keep changes small and validate quickly:

- Backend: edit `backend/` + refresh browser
- Frontend: edit `frontend/` + refresh browser
- Run unit tests during development; run E2E before merging

```bash
# Frontend unit tests
cd frontend
npm test

# Watch mode
npm run test:watch

# Lint
npm run lint -- --fix
```

## Development Workflow

### Initial Setup

1. **Clone and setup**
   ```bash
   git clone <repo>
   cd team-topologies-visualizer
   py -m venv venv
   .\venv\Scripts\activate
   python -m pip install -r requirements.txt
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install E2E test dependencies**
   ```bash
   cd tests
   npm install
   npx playwright install
   cd ..
   ```

### Running the Application

```bash
# Start FastAPI server with hot-reload
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

# Or with activated venv
python -m uvicorn main:app --reload --port 8000

# Open browser
# http://localhost:8000/static/index.html
```

### Making Changes

**Backend changes**:
1. Edit Python files in `backend/` or `main.py`
2. Server automatically reloads (hot-reload enabled)
3. Run backend unit tests: `python -m pytest tests_backend/ -v` (or `\.\venv\Scripts\python.exe -m pytest tests_backend/ -v` on Windows)
4. Test manually in browser

**Frontend changes**:
1. Edit JavaScript files in `frontend/`
2. Refresh browser (Ctrl+Shift+R for hard refresh to bypass cache)
3. Run frontend unit tests: `cd frontend && npm test`
4. Check console for errors

**Data changes**:
1. Edit markdown files in `data/baseline-teams/` or `data/tt-teams/`
2. Click "Refresh" button in UI to reload
3. Or restart server

## Debugging Tips

### Backend Debugging

- **Enable debug logging**: Add `--log-level debug` to uvicorn command
- **Use print statements**: Add `print()` or `logger.debug()` in services.py
- **Check API docs**: Visit http://localhost:8000/docs for interactive API testing
- **Validate YAML**: Use online YAML validators if team files aren't parsing

### Frontend Debugging

- **Browser DevTools**: F12 to open, check Console and Network tabs
- **Canvas debugging**: console.log statements in rendering functions
- **Hard refresh**: Ctrl+Shift+R to bypass browser cache
- **Inspect API calls**: Network tab shows all API requests/responses
- **Check constants**: Verify LAYOUT constants in constants.js for positioning issues

### Test Debugging

- **Playwright UI mode**: `npm run test:ui` in tests directory
- **Headed mode**: `npx playwright test --headed` to see browser
- **Debug mode**: `npx playwright test --debug` for step-by-step execution
- **Screenshots**: E2E tests automatically capture screenshots on failure

## Common Issues

### "Module not found" errors

**Cause**: Import paths incorrect after refactoring  
**Solution**: Verify imports use new module structure:
```python
from backend.models import TeamData
from backend.services import parse_team_file
```

### Tests failing after backend refactor

**Cause**: Test imports still reference old main.py functions  
**Solution**: Update test imports to use backend modules

### Canvas not rendering

**Cause**: JavaScript errors or API failures  
**Solution**: 
1. Check browser console for errors
2. Verify server is running (http://localhost:8000/api/teams?view=current)
3. Hard refresh browser (Ctrl+Shift+R)

### Team positions not saving

**Cause**: API PATCH endpoint failing  
**Solution**: 
1. Check network tab for 400/500 errors
2. Verify team name matches exactly (case-sensitive)
3. Check file permissions on data/ directory

## Git Workflow

### Branch Strategy

- **main**: Stable, tested code
- **feature/***: New features (e.g., feature/auto-align)
- **fix/***: Bug fixes (e.g., fix/team-position)
- **refactor/***: Code improvements (e.g., refactor/backend-modules)

### Commit Guidelines

**Format**: `type: description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `docs`: Documentation changes
- `test`: Test additions or modifications
- `chore`: Maintenance tasks

**Examples**:
```bash
git commit -m "feat: Add auto-align teams functionality"
git commit -m "fix: Correct Build & Integration Team position"
git commit -m "refactor: Modularize backend architecture"
git commit -m "docs: Update CONCEPTS.md with references"
```

### Release Process

1. Run all tests: backend, frontend, E2E
2. Update [CHANGELOG.md](CHANGELOG.md) with changes
3. Update version in relevant files
4. Create git tag: `git tag -a v1.0.0 -m "Release 1.0.0"`
5. Push with tags: `git push --follow-tags`

## Performance Considerations

This app is optimized for local use and workshops (not massive scale). If you ever need to scale it up (many users / 100+ teams), these are the main levers:

- **Rendering**: avoid unnecessary redraws; keep draw work proportional to what changed
- **Data loading**: cache loaded team data and refresh explicitly
- **Interactions**: keep pan/zoom/drag handlers lightweight

## Future Improvements

Some power-user features already exist (e.g., undo/redo and keyboard shortcuts). Remaining ideas (if you want to grow scope):

- **Mobile support**: Touch-optimized interactions
- **Dark mode**: Alternative color scheme
- **Real-time collaboration**: Multiple users editing simultaneously
- **Alternative storage**: optional DB backend for very large org models

### Technical Debt

- Consider adding integration tests for API endpoints
- Improve error handling in frontend (more specific error messages)
- Add input validation for manual JSON/YAML editing
- Consider adding a proper state management solution if complexity grows
