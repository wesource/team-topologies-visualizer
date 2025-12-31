# Playwright Test Suite

## Setup

```powershell
cd tests
npm install
npx playwright install
```

## Running Tests

```bash
# Start the backend server first (from project root)
python -m uvicorn main:app --port 8000
# Or on Windows with venv: .\venv\Scripts\python.exe -m uvicorn main:app --port 8000
# Or on Linux/Mac with venv: ./venv/bin/python -m uvicorn main:app --port 8000

# In another terminal, run tests
cd tests
npm test
```

## Test Commands

- `npm test` - Run all tests headless
- `npm run test:headed` - Run tests with browser visible
- `npm run test:ui` - Open Playwright UI for interactive testing
- `npm run test:debug` - Debug tests step by step

## What's Tested

✅ Application loads correctly
✅ Canvas element is rendered
✅ API endpoints return valid data
✅ View switching (Current State ↔ TT Vision)
✅ Team sidebar displays teams
✅ Organization hierarchy structure (6 departments)
✅ Customer Solutions has 4 regions
✅ Engineering has 5 line managers
✅ Legend displays team types
✅ Screenshots for visual regression

## Screenshots

Screenshots are saved to `tests/screenshots/` for visual verification.
