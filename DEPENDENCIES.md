# Project Dependencies

This document lists all external components and libraries used in the Team Topologies Visualizer, explaining what they do and why we use them.

## Philosophy

We follow a pragmatic approach:
- ✅ **Use proven libraries** for common problems (HTTP, validation, parsing)
- ✅ **Keep dependencies minimal** - only add when there's clear value
- ✅ **Prefer standard library** when performance/features are sufficient
- ❌ **Avoid reinventing** solved problems (don't build our own YAML parser)

---

## Backend (Python)

### Core Framework
- **FastAPI** (`fastapi==0.115.12`)
  - Modern web framework for building APIs
  - Why: Fast, automatic API documentation, type checking, async support
  - Alternative considered: Flask (chosen FastAPI for better type safety)

- **Uvicorn** (`uvicorn==0.34.0`)
  - ASGI server to run FastAPI
  - Why: Production-ready, fast, supports auto-reload in development

### Data Handling
- **PyYAML** (`pyyaml==6.0.2`)
  - YAML parser for markdown front matter
  - Why: Industry standard, handles YAML in team files
  - Alternative: Write custom parser (unnecessary - YAML is standard)

- **Pydantic** (`pydantic==2.10.5`)
  - Data validation using Python type hints
  - Why: Automatic validation, serialization, comes with FastAPI
  - Note: Built-in with FastAPI, not an extra dependency

### Testing (Development Only)
- **pytest** (`pytest==9.0.2`)
  - Testing framework
  - Why: Most popular Python testing tool, great fixture system
  
- **pytest-cov** (`pytest-cov==7.0.0`)
  - Test coverage reports
  - Why: See which code is tested, ensure quality

- **httpx** (`httpx==0.28.1`)
  - HTTP client for testing
  - Why: Required by FastAPI's TestClient for API tests
  - Note: **Only used in tests**, not in production code

---

## Frontend (JavaScript)

### Core Libraries
- **None (Vanilla JavaScript)** 🎉
  - Why: Project is simple enough, no framework needed
  - Benefits: Fast, no build step (besides tests), no framework lock-in
  - HTML5 Canvas API used directly for visualization

### Testing (Development Only)
- **Vitest** (`vitest@3.0.5`)
  - Modern test runner for JavaScript
  - Why: Fast, Vite-compatible, good DX
  - Alternative: Jest (chosen Vitest for speed)

- **@vitest/ui** (`@vitest/ui@3.0.5`)
  - Web UI for test results
  - Why: Nice visual test debugging

- **jsdom** (`jsdom@26.0.0`)
  - DOM implementation for Node.js
  - Why: Test browser code in Node environment

### E2E Testing
- **Playwright** (`@playwright/test@1.49.1`)
  - Browser automation for end-to-end tests
  - Why: Test real user interactions across browsers
  - Alternative: Cypress (chose Playwright for multi-browser support)

---

## Python Dependencies (requirements.txt)

```txt
fastapi==0.115.12        # API framework
uvicorn==0.34.0          # ASGI server
pyyaml==6.0.2            # YAML parsing
pytest==9.0.2            # Testing
pytest-cov==7.0.0        # Test coverage
httpx==0.28.1            # HTTP client (tests only)
```

**Total: 6 packages** (5 core + 1 test-only)

---

## Frontend Dependencies (package.json)

```json
{
  "devDependencies": {
    "vitest": "^3.0.5",
    "@vitest/ui": "^3.0.5",
    "jsdom": "^26.0.0"
  }
}
```

**Total: 3 packages** (all dev-only)

### E2E Test Dependencies (tests/package.json)

```json
{
  "devDependencies": {
    "@playwright/test": "^1.49.1"
  }
}
```

**Total: 1 package** (dev-only)

---

## Security & Maintenance

### Dependency Updates
- **Check regularly**: `pip list --outdated` (Python) and `npm outdated` (JavaScript)
- **Update carefully**: Test thoroughly after updates
- **Security**: Monitor CVE databases for known vulnerabilities

### Version Pinning
- **Python**: Exact versions in requirements.txt for reproducibility
- **JavaScript**: Caret (`^`) for minor updates, flexible within major version

---

## What We DON'T Use (And Why)

### Frontend
- ❌ **React/Vue/Angular**: Overkill for our use case, vanilla JS is sufficient
- ❌ **TypeScript**: Would add build step, type checking less critical for this project
- ❌ **Lodash/Underscore**: Modern JS has built-in array methods
- ❌ **Axios**: Fetch API works fine for our needs
- ❌ **D3.js**: Canvas API gives us full control for custom visualization

### Backend
- ❌ **SQLAlchemy/Database**: Files are perfect for this scale
- ❌ **Celery/Task Queue**: No async jobs needed
- ❌ **Redis/Cache**: File system caching sufficient
- ❌ **Custom YAML parser**: PyYAML is battle-tested

---

## Adding New Dependencies

**Before adding a dependency, ask:**

1. **Is it needed?** Can we solve this with existing tools/standard library?
2. **Is it maintained?** Check last update, issue count, downloads
3. **Is it stable?** Avoid beta/alpha versions in production
4. **What's the cost?** Bundle size, complexity, learning curve
5. **What's the benefit?** Time saved, bugs avoided, features gained

**If adding, document here:**
- What it does
- Why we chose it
- What alternatives were considered
- Whether it's dev-only or production

---

## Transitive Dependencies

These are pulled in automatically by our direct dependencies. We don't manage them directly but should be aware:

### Python (via FastAPI/Uvicorn)
- `starlette` - ASGI framework (FastAPI's foundation)
- `anyio` - Async compatibility layer
- `pydantic-core` - Pydantic's Rust core
- `typing-extensions` - Backported type hints
- `click` - CLI framework (Uvicorn uses it)

### JavaScript (via Vitest/Playwright)
- Various bundler and test runner internals

**Total ecosystem size**: ~20-30 transitive packages (typical for modern Python/JS)

---

## License Compatibility

All dependencies use permissive licenses compatible with our project:
- **MIT**: FastAPI, Uvicorn, PyYAML, Vitest, Playwright
- **Apache 2.0**: Pydantic
- **PSF**: Python standard library

✅ No GPL or restrictive licenses that would affect our code.

---

Last updated: January 3, 2026
