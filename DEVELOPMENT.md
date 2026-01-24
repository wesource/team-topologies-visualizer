# Development Guide

Comprehensive guide for developing, testing, and contributing to the Team Topologies Visualizer.

## Project Context

**Date**: January 2026  
**Approach**: AI-assisted development (GitHub Copilot)  
**Purpose**: Learning project - exploring FastAPI, frontend Canvas rendering, and testing while building a practical Team Topologies visualization tool

## Architecture Overview

For a detailed list of third-party libraries (and why they’re used), see [DEPENDENCIES.md](DEPENDENCIES.md).

### Technology Stack

**Backend**:
- **Python 3.8+** - Core language
- **FastAPI** - Modern async web framework
- **Pydantic** - Data validation with type hints
- **uvicorn** - ASGI server

**Frontend**:
- **Vanilla JavaScript (ES6 modules)** - No build step required
- **HTML5 Canvas** - Interactive visualization
- **marked.js** - Markdown rendering with GitHub Flavored Markdown (GFM) support
  - Replaces custom regex parsing for security and robustness
  - XSS protection and comprehensive markdown feature support
   - CDN import is defined in the frontend code

**Testing**:
- **pytest** - Backend unit tests (Python)
- **Vitest** - Frontend unit tests (JavaScript)
- **Playwright** - End-to-end browser tests (with hidden DOM for canvas testing)
- **ESLint** - JavaScript linting

**Data Format**:
- **Markdown with YAML front matter** - Team files (Team API template)
- **JSON** - Configuration files (team types, org hierarchy)

### Backend (Python + FastAPI)

Modular architecture with clear separation of concerns:

- **main.py** (42 lines) - Application setup, CORS middleware, router inclusion, static file serving
- **backend/models.py** - Pydantic data models (TeamData, PositionUpdate) for type validation
- **backend/services.py** - File operations and business logic (parse_team_file, write_team_file, find_all_teams, etc.)
- **backend/routes_pre_tt.py** - Pre-TT (Baseline) API endpoints
- **backend/routes_tt.py** - TT Design API endpoints

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

The project uses three layers of tests to ensure quality during development.

### Test Architecture Overview

**Three-Layer Testing Strategy**:
1. **Backend Unit Tests** (10 tests, ~0.5s) - Python/pytest
2. **Frontend Unit Tests** (62 tests, ~1.3s) - JavaScript/Vitest
3. **E2E Tests** (40 tests, ~11s) - Playwright with hidden DOM for canvas testing

### Backend Unit Tests (Fast)

Tests core Python functions in isolation. Run these frequently during backend development.

**Location**: `tests_backend/`  
**Framework**: pytest  
**Coverage**: 10 tests covering:
- parse_team_file() - YAML front matter parsing
- get_data_dir() - Directory resolution
- Team API field validation
- URL-safe team name slugification
- Interaction table parsing
**Speed**: ~0.5s

```bash
# Run all backend unit tests (Windows venv)
.\venv\Scripts\python.exe -m pytest tests_backend/ -v

# Linux/Mac
python -m pytest tests_backend/ -v

# With coverage report
python -m pytest tests_backend/ --cov=backend --cov=main --cov-report=html

# Run specific test
python -m pytest tests_backend/test_main.py::test_parse_team_file -v
```

### Frontend Unit Tests (Fast)

Tests JavaScript modules (wrapText, API functions, rendering utilities) in isolation. Run these during frontend development.

**Location**: `frontend/`  
**Framework**: Vitest  
**Coverage**: 62 tests covering:
- Text wrapping and rendering utilities
- API client functions
- Current state alignment algorithms
- TT Design alignment logic
- Value stream and platform grouping
- SVG export functionality
- Markdown table parsing
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
**Coverage**: 40 tests across 6 focused, independent test files  
**Speed**: ~11s with 6 parallel workers  
**Note**: Playwright is configured to start/stop the backend server on port 8000 automatically.

#### Hidden DOM for Canvas Testing

**Problem**: Canvas-rendered content is difficult to test because there's no DOM representation of what's drawn. Traditional approaches rely on:
- Counting sidebar elements (indirect, unreliable)
- Waiting for UI state changes (flaky, timing-dependent)
- Testing button clicks without verifying effects (incomplete)

**Solution**: Hidden `#canvasTestState` div that mirrors canvas state

```html
<!-- Added to frontend/index.html -->
<div id="canvasTestState" style="display: none;" 
   data-total-teams="..." 
   data-filtered-teams="..."
   data-active-filters='{"valueStreams":["..."],"platformGroupings":[]}'
     data-search-term=""
     data-current-view="tt"></div>
```

Updated in `renderer.js` after each `draw()` call via `updateTestState()` function.

**Benefits**:
- **Reliable assertions** - Test actual state, not indirect indicators
- **No race conditions** - State updates atomically with canvas render
- **Better debugging** - Inspect state in browser DevTools during test failures
- **Future-proof** - Easy to add more attributes as needed

**Example Test Usage**:
```typescript
test('should filter teams by value stream', async ({ page }) => {
  const testState = page.locator('#canvasTestState');
  
  // Verify initial state
  const initialTotal = await testState.getAttribute('data-total-teams');
  const initialFiltered = await testState.getAttribute('data-filtered-teams');
  expect(initialTotal).toBe(initialFiltered); // No filters initially
  
  // Apply filter
  await vsFilters.first().check();
  await page.locator('#applyFiltersBtn').click();
  
  // Verify filter is active using hidden DOM
  const activeFilters = await testState.getAttribute('data-active-filters');
  const filters = JSON.parse(activeFilters);
  expect(filters.valueStreams.length).toBeGreaterThan(0);
  
  // Verify filtered count
  const filteredCount = await testState.getAttribute('data-filtered-teams');
  expect(parseInt(filteredCount)).toBeGreaterThan(0);
});
```

#### Test Organization

Tests are organized into focused, independent files for better maintainability:

**Split Test Files** (40 tests total across 6 files):
- `api-validation.spec.ts` (3 tests) - API endpoints, JSON validation
- `organization-hierarchy.spec.ts` (9 tests) - Department structure, team counts, region validation
- `ui-basic.spec.ts` (9 tests) - Page load, view switching, canvas rendering, legend, sidebar
- `ui-interactions.spec.ts` (8 tests) - Filters (using hidden DOM), search, zoom, validation modal, toggles
- `modal-rendering.spec.ts` (1 test) - Validation modal content rendering
- `backend-validation.spec.ts` (1 test) - Backend file structure validation

**Why Split?**: 
- **Better organization** - Logical grouping of related tests
- **Faster feedback** - Run only the tests relevant to your changes
- **Easier maintenance** - Smaller, focused files are easier to understand and update
- **Independent test execution** - Tests in different files run in parallel
- **Better coverage** - Split files improved test coverage and organization

**Why Keep visualizer.spec.ts?**: 
- **Integration baseline** - Comprehensive test coverage in a single file
- **Stability reference** - Always 100% passing (32/32) as a sanity check
- **Backwards compatibility** - Original tests remain available

```bash
# From tests directory
cd tests
npm test

# Run specific test file
npx playwright test api-validation.spec.ts
npx playwright test organization-hierarchy.spec.ts
npx playwright test ui-basic.spec.ts
npx playwright test ui-interactions.spec.ts
npx playwright test modal-rendering.spec.ts
npx playwright test backend-validation.spec.ts

# Run original comprehensive suite
npx playwright test visualizer.spec.ts

# Run with UI for debugging
npm run test:ui

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Serial execution (if needed for debugging)
npm run test:serial
```

**E2E Test Coverage**:
- Application load and initialization
- View switching (Current State ↔ TT Design)
- Canvas interactions (drag, zoom, pan)
- Team selection and details modal
- API integration and data loading
- Organization hierarchy validation (6 departments, regions, line managers)
- Auto-align functionality (both views)
- Filter and search with hidden DOM state verification
- SVG export
- Validation modal
- Toggle controls (interaction modes, cognitive load)

### Test Strategy

**Test Pyramid Approach**:
1. **Unit tests** (backend + frontend): Run frequently, catch issues early (~1.8s total)
2. **E2E tests**: Run before commits, ensure full system works (~12s)
3. Focus on fast feedback - unit tests optimized for speed

**When to Run What**:
- **During development**: Run relevant unit tests continuously
- **Before committing**: Run all three test layers (104 tests in ~14s)
- **Before pushing**: Ensure all tests pass
- **CI/CD**: Run full test suite on every push

**Test Execution via PowerShell Script**:
```powershell
# Run all tests in sequence (Windows)
.\scripts\run-all-tests.ps1
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
- routes_pre_tt.py / routes_tt.py: API endpoint definitions
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
