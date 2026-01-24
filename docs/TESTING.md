# Testing Guide

Comprehensive testing strategy for the Team Topologies Visualizer.

## Overview

The project uses three layers of tests to ensure quality during development.

**Gotcha (demo mode)**: If you started the server via demo mode (which sets `READ_ONLY_MODE=true`) in the same shell/session, unset it before running tests that expect write endpoints to work.

## Test Architecture

**Three-Layer Testing Strategy**:
1. **Backend Unit Tests** (10 tests, ~0.5s) - Python/pytest
2. **Frontend Unit Tests** (62 tests, ~1.3s) - JavaScript/Vitest
3. **E2E Tests** (40 tests, ~11s) - Playwright with hidden DOM for canvas testing

## Backend Unit Tests (Fast)

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

## Frontend Unit Tests (Fast)

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

## End-to-End Tests (Comprehensive)

Full application tests using Playwright. Run these before commits to verify everything works together.

**Location**: `tests/`  
**Framework**: Playwright  
**Coverage**: 40 tests across 6 focused, independent test files  
**Speed**: ~11s with 6 parallel workers  
**Note**: Playwright is configured to start/stop the backend server on port 8000 automatically.

### Hidden DOM for Canvas Testing

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

### Test Organization

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

## Test Strategy

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

## Debugging Tests

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

### E2E Test Debugging

- **Playwright UI mode**: `npm run test:ui` in tests directory
- **Headed mode**: `npx playwright test --headed` to see browser
- **Debug mode**: `npx playwright test --debug` for step-by-step execution
- **Screenshots**: E2E tests automatically capture screenshots on failure
