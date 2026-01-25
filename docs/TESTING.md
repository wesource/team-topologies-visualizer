# Testing Guide

Keep this doc stable and useful: it focuses on *what to run* and *how to debug*, not exact test counts or timings.

## Overview

The project uses three layers:

1. Backend unit tests (pytest)
2. Frontend unit tests (Vitest)
3. E2E tests (Playwright)

**Gotcha (demo mode)**: If you started the server via demo mode (sets `READ_ONLY_MODE=true`) in the same shell/session, unset it before running tests that expect write endpoints.

## Commands

```powershell
# Run everything (recommended)
.\scripts\run-all-tests.ps1

# Backend (Windows venv)
.\venv\Scripts\python.exe -m pytest tests_backend/ -v

# Frontend
cd frontend
npm test

# E2E
cd tests
npx playwright test
```

## Canvas E2E Testing (Hidden DOM)

Canvas rendering is hard to assert directly because a `<canvas>` has no DOM representation. The app maintains a hidden element that mirrors key state for tests.

```html
<!-- In frontend/index.html -->
<div id="canvasTestState" style="display: none;"
  data-total-teams="..."
  data-filtered-teams="..."
  data-active-filters='{"valueStreams":[],"platformGroupings":[]}'
  data-search-term=""
  data-current-view="tt"></div>
```

E2E tests read `#canvasTestState` attributes to verify filtering, view switches, and other state changes without relying on pixel comparisons.

## Debugging

### Backend

- API docs: `http://localhost:8000/docs`
- If markdown/YAML parsing fails, validate the front matter and tables first

### Frontend

- Use browser DevTools (Console + Network)
- Hard refresh: Ctrl+Shift+R

### E2E (Playwright)

```bash
cd tests

# Visual runner
npm run test:ui

# See the browser
npx playwright test --headed

# Step-by-step
npx playwright test --debug
```
