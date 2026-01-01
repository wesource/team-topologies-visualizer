# Development Guide

Comprehensive guide for developing, testing, and contributing to the Team Topologies Visualizer.

## Project Context

**Date**: January 2026  
**Approach**: AI-assisted development (GitHub Copilot / Claude Sonnet 4)  
**Purpose**: Learning project - exploring Python, FastAPI, and testing tools while building a practical Team Topologies visualization tool

## Architecture Overview

### Backend (Python + FastAPI)

Modular architecture with clear separation of concerns:

- **main.py** (42 lines) - Application setup, CORS middleware, router inclusion, static file serving
- **backend/models.py** - Pydantic data models (TeamData, PositionUpdate) for type validation
- **backend/services.py** - File operations and business logic (parse_team_file, write_team_file, find_all_teams, etc.)
- **backend/routes.py** - FastAPI router with all API endpoints

### Frontend (Vanilla JavaScript ES6 Modules)

**Core modules**:
- **constants.js** - Shared layout constants (LAYOUT object with dimensions, spacing, offsets)
- **config.js** - API configuration (API_BASE_URL, getApiUrl helper)
- **notifications.js** - Unified notification system (showError, showSuccess, showInfo, showWarning)
- **layout-utils.js** - Shared position calculation functions

**Feature modules**:
- **api.js** - API client layer for backend communication
- **app.js** - Main application orchestration and initialization
- **canvas-interactions.js** - Canvas event handling (drag, zoom, pan, click)
- **renderer-common.js** - Shared rendering utilities (drawTeam, wrapText, darkenColor)
- **renderer-current.js** - Current State org-chart view rendering
- **svg-export.js** - SVG export functionality
- **team-alignment.js** - Auto-align teams functionality

**Why Vanilla JavaScript?**
- No build step required - simplicity for straightforward visualization app
- Direct browser execution - edit and refresh workflow
- Lower learning curve for contributors
- TypeScript was evaluated but added more complexity than value for single-maintainer learning project

### Data Storage

- **Markdown files with YAML front matter** - Human-readable, git-friendly team data
- **JSON configuration files** - Team type definitions with colors and descriptions
- **No database** - Keeps the solution simple and version-control friendly

## Testing

The project includes **72 tests total** across three layers to ensure quality during development.

### Backend Unit Tests (Fast)

Tests core Python functions in isolation. Run these frequently during backend development.

**Location**: `tests_backend/`  
**Framework**: pytest  
**Coverage**: 10 tests covering parse_team_file(), get_data_dir(), data validation, and business logic  
**Speed**: ~0.5s

```bash
# Run all backend unit tests (with activated venv)
pytest tests_backend/ -v

# Or Windows direct path
.\venv\Scripts\python.exe -m pytest tests_backend/ -v

# With coverage report
pytest tests_backend/ --cov=backend --cov=main --cov-report=html

# Run specific test
pytest tests_backend/test_main.py::test_parse_team_file -v
```

### Frontend Unit Tests (Fast)

Tests JavaScript modules (wrapText, API functions, rendering utilities) in isolation. Run these during frontend development.

**Location**: `frontend/`  
**Framework**: Vitest  
**Coverage**: 40 tests covering renderer-common.js, api.js, current-state-alignment.js, svg-export.js  
**Speed**: ~1.3s  
**Linting**: ESLint catches syntax errors, formatting issues, unused variables

```bash
# From frontend directory
cd frontend
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Lint JavaScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### End-to-End Tests (Comprehensive)

Full application tests using Playwright. Run these before commits to verify everything works together.

**Location**: `tests/`  
**Framework**: Playwright  
**Coverage**: 23 tests (14 UI/integration + 9 backend validation)  
**Speed**: ~3-5s  
**Requirement**: Server must be running on localhost:8000

```bash
# From tests directory
cd tests
npm test

# Run with UI for debugging
npm run test:ui

# Run specific test file
npx playwright test visualizer.spec.ts
npx playwright test backend-validation.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

**E2E Test Coverage**:
- Application load and initialization
- View switching (Current State ↔ TT Vision)
- Canvas interactions (drag, zoom, pan)
- Team selection and details modal
- API integration and data loading
- Organization hierarchy validation
- Auto-align functionality
- SVG export

### Test Strategy

**Test Pyramid Approach**:
1. **Unit tests** (backend + frontend): Run frequently, catch issues early (~2s total)
2. **E2E tests**: Run before commits, ensure full system works (~5s)
3. Focus on fast feedback - unit tests optimized for speed

**When to Run What**:
- **During development**: Run relevant unit tests continuously
- **Before committing**: Run all three test layers
- **Before pushing**: Ensure all tests pass
- **CI/CD**: Run full test suite on every push

## Development Workflow

### Initial Setup

1. **Clone and setup**
   ```bash
   git clone <repo>
   cd team-topologies-visualizer
   py -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
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
3. Run backend unit tests: `pytest tests_backend/ -v`
4. Test manually in browser

**Frontend changes**:
1. Edit JavaScript files in `frontend/`
2. Refresh browser (Ctrl+Shift+R for hard refresh to bypass cache)
3. Run frontend unit tests: `cd frontend && npm test`
4. Check console for errors

**Data changes**:
1. Edit markdown files in `data/current-teams/` or `data/tt-teams/`
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

## Key Technical Decisions

### Backend Modularization

**Why**: Original main.py was 229 lines - too large and hard to maintain

**Solution**: Split into focused modules:
- models.py: Data validation with Pydantic
- services.py: Business logic and file operations
- routes.py: API endpoint definitions
- main.py: Application setup (now 42 lines)

**Benefits**: 
- Easier to test individual functions
- Clear separation of concerns
- Simpler imports and dependencies

### Frontend Utility Modules

**Why**: Duplicate code (3 darkenColor functions) and magic numbers throughout codebase

**Solution**: Created shared utility modules:
- constants.js: All layout dimensions centralized
- config.js: API configuration in one place
- notifications.js: Consistent user feedback
- layout-utils.js: Shared position calculations

**Benefits**:
- DRY principle (Don't Repeat Yourself)
- Consistent spacing and positioning
- Easy to adjust layout globally
- Better maintainability

### Team Box Dimensions

**Decision**: 144px × 80px with 3px borders

**Rationale**:
- 144px width provides good text wrapping for team names
- 80px height fits name + metadata without crowding
- 3px borders (increased from 2px) improve visibility
- Consistent sizing across all views

### Communication Lines Toggle

**Decision**: Hidden by default in Current State view

**Rationale**:
- Org-chart view focuses on reporting structure
- Too many dependency lines create visual clutter
- Users can toggle on when needed
- TT Vision view has lines enabled by default (shows interaction patterns)

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
2. Update CHANGELOG.md with changes
3. Update version in relevant files
4. Create git tag: `git tag -a v1.0.0 -m "Release 1.0.0"`
5. Push with tags: `git push --follow-tags`

## Performance Considerations

### Canvas Rendering

- **Optimize draw calls**: Batch similar operations
- **Avoid redundant renders**: Only redraw when data changes
- **Use requestAnimationFrame**: For smooth animations

### File Operations

- **Cache team data**: Load once, reuse until refresh
- **Lazy loading**: Load team details only when needed
- **Async operations**: Don't block UI during file reads

## Future Improvements

### Potential Enhancements

1. **TypeScript migration**: If project grows and team expands
2. **Database backend**: For larger organizations (100+ teams)
3. **Real-time collaboration**: Multiple users editing simultaneously
4. **Undo/redo**: Canvas operation history
5. **Keyboard shortcuts**: Power user features
6. **Mobile support**: Touch-optimized interactions
7. **Dark mode**: Alternative color scheme
8. **Team templates**: Quick team creation from presets

### Technical Debt

- Consider adding integration tests for API endpoints
- Improve error handling in frontend (more specific error messages)
- Add input validation for manual JSON/YAML editing
- Consider adding a proper state management solution if complexity grows
