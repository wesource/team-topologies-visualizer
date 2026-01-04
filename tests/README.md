# Playwright E2E Test Suite

## Setup

```powershell
cd tests
npm install
npx playwright install
```

## Running Tests

### ✨ Automatic Server Start (Recommended)

The test suite now automatically starts and stops the backend server:

```bash
cd tests
npm test
```

That's it! The Playwright config will:
- Start the FastAPI backend server automatically
- Wait for it to be ready
- Run all tests
- Shut down the server when done

### Manual Server Start (Optional)

If you prefer to manage the server yourself:

```powershell
# Terminal 1: Start backend (from project root)
.\venv\Scripts\python.exe -m uvicorn main:app --port 8000

# Terminal 2: Run tests
cd tests
npm test
```

## Test Commands

- `npm test` - Run all tests headless (auto-starts server)
- `npm run test:headed` - Run tests with browser visible
- `npm run test:ui` - Open Playwright UI for interactive testing
- `npm run test:debug` - Debug tests step by step

## Running All Tests at Once

From the project root, use the helper script:

```powershell
# Windows PowerShell
.\run-all-tests.ps1
```

This runs backend tests → frontend tests → E2E tests in sequence.

## Configuration

The test configuration includes:
- **Automatic retries**: Tests retry once locally, twice in CI
- **Timeout settings**: 60s per test, 30s for navigation
- **Parallel execution**: 6 workers for faster test runs
- **Screenshot on failure**: Automatic screenshot capture for debugging

## What's Tested

✅ Application loads correctly
✅ Canvas element is rendered
✅ API endpoints return valid data (organization hierarchy, teams, team types)
✅ View switching (Pre-TT ↔ TT Design)
✅ Team sidebar displays teams
✅ Organization hierarchy structure (6 departments)
✅ Customer Solutions has 4 regions
✅ Engineering has 5 line managers
✅ Legend displays team types
✅ Markdown rendering in team detail modals
✅ Screenshot regression tests

## Test Results

Recent test run: **19-24/24 tests passing** (some occasional timeouts)

## Troubleshooting

**Tests timing out?**
- Check that no other process is using port 8000
- Try running with `npm run test:headed` to see what's happening
- Increase timeouts in `playwright.config.ts` if needed

**Server won't start?**
- Ensure virtual environment is set up: `python -m venv venv`
- Install dependencies: `pip install -r requirements.txt`
- Test server manually: `.\venv\Scripts\python.exe -m uvicorn main:app --port 8000`

## Screenshots

Screenshots are saved to `tests/screenshots/` for visual verification.
