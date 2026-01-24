# Setup and Configuration Guide

## Prerequisites

**Option 1: Local Python**
- Python 3.10 or higher
  - CI runs tests on Python 3.11 (Ubuntu) in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- Modern web browser with HTML5 Canvas support

**Option 2: Docker/Podman**
- Docker or Podman installed
- Modern web browser with HTML5 Canvas support

## Quick Setup

### Option A: Local Python Setup

1. **Clone or navigate to the project directory**

2. **Create a virtual environment**
   ```bash
   # Windows
   py -m venv venv

   # Linux/Mac
   python3 -m venv venv
   ```

3. **Activate the virtual environment**
   ```bash
   # Windows
   .\venv\Scripts\activate

   # Linux/Mac
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   python -m pip install -r requirements.txt
   ```

5. **Start the server**
   ```bash
   python -m uvicorn main:app --reload
   ```

6. **Open the app**
  - Open http://localhost:8000/static/index.html

### Option B: Docker/Podman Setup

1. **Build the container image**
   ```bash
   docker build -t team-topologies-viz .
   ```
   
   Or with Podman:
   ```bash
   podman build -t team-topologies-viz .
   ```

2. **Run the container**
   ```bash
   docker run -p 8000:8000 -v ./data:/app/data team-topologies-viz
   ```
   
   Or with Podman:
   ```bash
   podman run -p 8000:8000 -v ./data:/app/data:z team-topologies-viz
   ```
   
   **Windows PowerShell/Podman**: Git Bash may have path conversion issues. Use PowerShell:
   ```powershell
   podman run -p 8000:8000 -v ${PWD}/data:/app/data team-topologies-viz
   ```
   
   **Volume mount explanation**:
   - `-v ./data:/app/data` mounts your local `data/` directory into the container
   - This allows you to edit team markdown files on your host machine
   - Changes are immediately visible in the running application
   - On Podman with SELinux, add `:z` flag for proper permissions
   - On Windows, use `${PWD}` in PowerShell instead of `./` and omit `:z`

3. **Stop the container**
   ```bash
   docker ps  # Find container ID
   docker stop <container-id>
   ```

## Demo Mode (Read-Only)

For public demonstrations or workshops where you want users to explore without saving changes:

**Local:**

```bash
# Windows
.\scripts\start-demo.ps1

# Linux/Mac
./scripts/start-demo.sh
```

**Docker:**

```bash
docker run -p 8000:8000 -e READ_ONLY_MODE=true team-topologies-viz
```

Demo mode displays a banner and blocks all write operations (position updates, snapshot creation) while allowing full interaction with the visualization.

## TT Design Variants

The repo includes two example TT designs:

- **Mid-Stage Transformation** (default): [data/tt-teams/](../data/tt-teams/)
- **First-Step Transformation** (optional): [data/tt-teams-initial/](../data/tt-teams-initial/) (see [data/tt-teams-initial/README.md](../data/tt-teams-initial/README.md))

You can switch which TT dataset is loaded by setting the `TT_TEAMS_VARIANT` environment variable.

**Local (Linux/Mac):**

```bash
export TT_TEAMS_VARIANT=tt-teams-initial
python -m uvicorn main:app --reload
```

**Local (Windows PowerShell):**

```powershell
$env:TT_TEAMS_VARIANT="tt-teams-initial"
python -m uvicorn main:app --reload
```

**Docker/Podman:**

```bash
docker run -p 8000:8000 -e TT_TEAMS_VARIANT=tt-teams-initial team-topologies-viz
```

If `TT_TEAMS_VARIANT` is not set, the app uses the default variant.

## Testing

### Running Tests Locally

Tests are split across three layers: backend (pytest), frontend (Vitest), and E2E (Playwright).

#### Backend Tests (pytest)

**IMPORTANT**: On Windows with venv, always use the full Python path:

```powershell
# Run all backend tests
.\venv\Scripts\python.exe -m pytest tests_backend/ -v

# Run specific test file
.\venv\Scripts\python.exe -m pytest tests_backend/test_routes_pre_tt.py -v

# Run with coverage
.\venv\Scripts\python.exe -m pytest tests_backend/ --cov=backend --cov=main --cov-report=html --cov-report=term
```

**Coverage report location**: `htmlcov/index.html` (open in browser)

**Why use venv Python path?**
- `pytest` command not in PATH on Windows
- Using system Python may have wrong dependencies
- Venv ensures consistent test environment

#### Frontend Tests (Vitest)

```powershell
cd frontend

# Run tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage
npm run test:coverage
```

**Coverage report location**: `frontend/coverage/index.html`

**Test files**: All `*.test.js` files in `frontend/` directory

#### E2E Tests (Playwright)

```powershell
cd tests

# Run all E2E tests
npx playwright test

# Run with UI (interactive mode)
npx playwright test --ui

# Run specific test file
npx playwright test ui-basic.spec.ts

# Debug mode (step through tests)
npx playwright test --debug
```

**Important**: Playwright automatically starts/stops the backend server on port 8000 during test runs.

**HTML Report**: After test run, open `tests/playwright-report/index.html` to view detailed results with screenshots and traces.

#### Run All Tests

```powershell
# From project root
.\scripts\run-all-tests.ps1
```

This script runs backend → frontend → E2E tests in sequence and shows summary.

### Test Coverage in CI

GitHub Actions automatically runs all tests and generates coverage reports:

**Artifacts available after each push:**
1. **backend-coverage-report** - Python coverage HTML (7-day retention)
2. **frontend-coverage-report** - JavaScript coverage HTML (7-day retention)
3. **playwright-report** - E2E test results with screenshots (7-day retention)

**To download:**
1. Go to **Actions** tab in GitHub
2. Click latest workflow run
3. Scroll to **Artifacts** section
4. Download and unzip the report
5. Open `index.html` in browser

Coverage changes over time. Use the commands above to generate up-to-date coverage reports locally.

## Linting

**CRITICAL**: Always lint before committing to catch errors early and maintain code quality.

### Python Linting (Ruff)

```powershell
# Check for issues
python -m ruff check backend/ tests_backend/ main.py

# Auto-fix issues
python -m ruff check backend/ tests_backend/ main.py --fix
```

**Common issues Ruff catches:**
- **F401**: Unused imports (remove them)
- **B007**: Unused loop variables (prefix with `_`, e.g., `for _key, value in items()`)
- **Trailing whitespace**: Auto-fixed with `--fix`
- **Line too long**: Split long lines

**Configuration**: See `ruff.toml` in project root

### JavaScript Linting (ESLint)

```powershell
cd frontend

# Check for issues
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**Configuration**: See `frontend/eslint.config.js`

### Pre-Commit Checklist

Before committing code:

1. Run linters (Python + JavaScript)
2. Run relevant tests (at minimum, test the area you changed)
3. Check for console errors in the browser (for frontend changes)
4. Verify the app still loads (run uvicorn and open browser)

**Tip**: The CI pipeline runs linters and tests automatically, but catching issues locally saves time.

## Data Organization

The `data/` directory has two subdirectories for different visualization purposes:

### Pre-TT Data (`data/current-teams/`)

**Purpose**: Document your **current organizational reality** BEFORE Team Topologies transformation.

**What to include:**
- Current team structures as they exist today
- Reporting hierarchy (line_manager field)
- Department assignments
- Product/project allocations (product_line field)
- Value stream mapping (value_stream field, if applicable)
- Actual dependencies that exist
- Current pain points and cognitive load issues

**Configuration files:**
- `current-team-types.json` - Your organization's current team classifications (e.g., "feature-team", "platform-team", "support-team")

**Team file fields:**
```yaml
---
name: Backend Services Team
team_type: feature-team
line_manager: Sarah Johnson        # Reporting structure
department: Engineering            # Org chart grouping
product_line: DispatchHub          # Product assignment
value_stream: B2B Services         # Customer journey (if known)
dependencies:                      # Who we coordinate with
  - Database Platform Team
  - QA & Testing Team
position: {x: 300, y: 200}
metadata:
  size: 6
  cognitive_load: high             # Current reality
---
```

**Template**: Use `templates/pre-tt-team-template.md` as starting point

### TT Design Data (`data/tt-teams/`)

**Purpose**: Document your **designed future state** following Team Topologies principles.

**What to include:**
- Proposed team structures with TT team types
- Value stream groupings
- Platform groupings
- Designed interaction modes (not organic dependencies)
- Team APIs (services provided, SLAs, communication channels)
- Thinnest Viable Platform (TVP) definitions

**Configuration files:**
- `tt-team-types.json` - Four TT team types (stream-aligned, platform, enabling, complicated-subsystem)

**Team file fields:**
```yaml
---
name: E-commerce Checkout Team
team_type: stream-aligned          # TT team type
value_stream: E-commerce Experience
platform_grouping: null            # Or platform name if applicable
dependencies:
  - Payment Platform Team
interaction_modes:                 # Designed patterns
  Payment Platform Team: x-as-a-service
  Fraud Detection Team: collaboration
position: {x: 500, y: 300}
metadata:
  size: 7
  cognitive_load: medium           # Target load
---

## Team API content follows...
```

**Templates**:
- `templates/tt-design-team-api-template-base.md` - Minimal Team API
- `templates/tt-design-team-api-template-extended.md` - Comprehensive with platform product metrics

**Key difference**: Pre-TT uses `dependencies` (organic), TT Design uses `interaction_modes` (designed).

## Running the Application

### Local Python

1. **Start the FastAPI server**
   ```bash
   .\venv\Scripts\python.exe -m uvicorn main:app --reload
   ```
   
   Or on Linux/Mac:
   ```bash
   python -m uvicorn main:app --reload
   ```

2. **Open your browser**
   - Frontend: http://localhost:8000/static/index.html
   - API Documentation: http://localhost:8000/docs
   - API Base: http://localhost:8000/api/teams

### Docker/Podman

If the container is already running (see setup above), just open:
- Frontend: http://localhost:8000/static/index.html
- API Documentation: http://localhost:8000/docs

## Usage

### Switching Between Views

Use the radio buttons in the header to switch between:
- **Pre-TT** - Shows the current organizational state with three perspectives:
  - **Hierarchy**: Traditional org chart (line managers, departments)
  - **Product Lines**: Vertical product lanes + horizontal shared teams row
  - **Value Streams**: Swimlane layout showing teams grouped by customer journey
- **TT Design** - Shows the target Team Topologies patterns

**Perspective Selector** (Pre-TT only):
- Located below the main view toggle
- Radio buttons switch between Hierarchy / Product Lines / Value Streams
- Same teams, different visual groupings
- Helps identify misalignments between reporting structure, products, and value streams

### Visualizing Teams

- The canvas displays all teams with color-coded boxes based on their type
- **Drag teams** to reposition them (positions are auto-saved)
- **Double-click teams** to view full details including description, dependencies, and metadata
- **Click teams** in the sidebar to select them
- **Zoom** using mouse wheel
- **Connections** between teams show interaction modes with different line styles
- **Auto-align Teams** (Current State view only) - Click the "Auto-align Teams" button to automatically position teams vertically under their line managers in an org-chart layout. Positions are automatically saved to each team's markdown file.
- **Show Communication Lines** checkbox (Pre-TT view) - Toggle to show dependencies and coordination lines between teams. Hidden by default to provide a cleaner org-chart visualization. When enabled, shows organic dependencies that exist today (not designed interaction modes).
- **Show Interaction Modes** checkbox (TT Design view) - Toggle interaction mode lines (collaboration, X-as-a-Service, facilitating) on/off to reduce visual clutter when focusing on team structure. These are designed patterns, not organic dependencies.
- **Refresh** button - Reload all team markdown files and configuration from disk. Useful when editing files externally. Preserves your current zoom/pan position on the canvas.

### Validating Team Files

After manually editing team markdown files, use the validation feature to catch errors before they cause issues:

1. **Click the "Validate Files" button** in the toolbar
2. **Review the validation report** showing:
   - Summary statistics (total files, valid files, warnings, errors)
   - Detailed issues organized by file
  - Severity levels (errors must be fixed; warnings are recommendations)
3. **Fix any errors** by editing the markdown files:
   - YAML syntax errors or duplicate front matter blocks
   - Missing required fields (name, team_type, position)
   - Invalid team_type values (must match team-types.json)
   - Filename mismatches (e.g., file named `team.md` but team name is "Platform Team")
   - Invalid position coordinates
   - Team size outside recommended range (5-9 people)
   - Malformed interaction tables (TT view only)
4. **Re-validate** to confirm all issues are resolved

**Validation checks both views:**
- Pre-TT view: `GET /api/validate?view=current`
- TT Design view: `GET /api/validate?view=tt`

This helps maintain data quality when editing files directly, catching issues before they cause rendering problems or API failures.

### Using Team Templates

The `templates/` directory contains ready-to-use markdown templates to help you create new teams quickly:

**Available templates:**
- `templates/pre-tt-team-template.md` - Starting point for baseline (Pre-TT) teams
- `templates/tt-design-team-api-template-base.md` - Minimal Team API for TT Design teams
- `templates/tt-design-team-api-template-extended.md` - Extended Team API with optional platform product metrics

**How to use templates:**

1. **Choose the right template:**
   - Use **base template** for most teams (minimal, focused)
   - Use **extended template** for complex platform teams or when you need product metrics

2. **Copy template to your data directory:**
   ```bash
  # Bash (Linux/Mac)
  cp templates/tt-design-team-api-template-base.md data/tt-teams/my-new-team.md

  # PowerShell (Windows)
  Copy-Item templates/tt-design-team-api-template-base.md data/tt-teams/my-new-team.md

  # For Pre-TT teams, start from:
  # templates/pre-tt-team-template.md
   ```

3. **Edit the YAML front matter:**
   - Update `name` to your team's actual name
   - Set correct `team_type` (must match your team-types.json)
   - Adjust `position` coordinates (or use Auto-align button later)
   - Fill in `metadata` (size, cognitive load, etc.)
   - Add TT-specific fields (value_stream, platform_grouping) if applicable

4. **Fill in the markdown content:**
   - Follow the section structure in the template
   - Replace placeholder text with your team's actual information
   - Remove sections that don't apply to your team
   - Keep "## Teams we currently interact with" table for automatic dependency parsing

5. **Validate your new file:**
  - Click "Validate Files" to check for errors
   - Fix any filename mismatches or missing required fields

6. **Refresh the application:**
   - Click the "Refresh" button in the toolbar
   - Your new team should appear in the visualization

**Template customization:**
- Create your own company-specific template by copying and modifying the base template
- Add industry-specific sections (HIPAA compliance, SOC2 controls, etc.)
- Share templates across your organization for consistency

See [CONCEPTS.md](CONCEPTS.md) for the team file format overview.

## Team Files

Teams are stored as markdown files with YAML front matter. Team types, colors, and descriptions are defined in prefixed configuration files within each view directory.

### Team Type Configuration

**Files**: `data/current-teams/current-team-types.json` or `data/tt-teams/tt-team-types.json`

```json
{
  "team_types": [
    {
      "id": "feature-team",
      "name": "Feature Team",
      "description": "Small, cross-functional teams that own and deliver complete product features end-to-end.",
      "color": "#3498db"
    },
    {
      "id": "platform-team",
      "name": "Platform Team",
      "description": "Teams that own shared/core components and maintain the common foundation.",
      "color": "#27ae60"
    }
  ]
}
```

### Team Markdown Files

**Current State teams** (`data/current-teams/`) include:
```yaml
---
name: Core Product Team
team_type: feature-team            # Must match an id from current-team-types.json or tt-team-types.json
line_manager: Marcus Thompson      # Reports to (org hierarchy)
dependencies:
  - Database Platform Team
interaction_modes:
  Database Platform Team: collaboration
position:
  x: 100
  y: 100
metadata:
  size: 8
  department: Engineering
---

# Team description in markdown...
```

**Team Topologies teams** (`data/tt-teams/`) include:
```yaml
---
name: Mobile App Team
team_type: stream-aligned          # TT team type
dependencies:
  - Platform Team
interaction_modes:
  Platform Team: x-as-a-service    # TT interaction mode
position:
  x: 100
  y: 100
metadata:
  size: 8
---

# Team description in markdown...
```

## API Endpoints

The API provides **read-only endpoints** for visualization purposes:

- `GET /api/teams?view=current` - List all teams in current state
- `GET /api/teams?view=tt` - List all teams in TT vision
- `GET /api/teams/{name}?view=current` - Get a specific team
- `GET /api/team-types?view=current` - Get team type configuration with colors and descriptions
- `PATCH /api/teams/{name}/position?view=current` - Update team position on canvas (drag-and-drop)

**Note**: Create, update, and delete operations for team data are intentionally not implemented via API. Teams should be managed by editing the markdown files directly in `data/current-teams/` and `data/tt-teams/` folders. The PATCH position endpoint is the only write operation and only updates the x/y coordinates for canvas positioning.

## Customizing for Your Organization

This is a **generic example** suitable for learning and demonstration. To use this for your own organization:

1. **Fork/clone this repository**
2. **Customize team type classifications**: Edit `data/current-teams/current-team-types.json` to match your organization's team categories
   - Define your own team type IDs (e.g., "feature-team", "platform-team", "support-team")
   - Set colors that make sense for your context
   - Write descriptions that reflect your organizational language
3. **Document current state**: Replace team markdown files in `data/current-teams/`
   - Use your actual team names and structures
   - Document reporting lines (line_manager field)
   - Capture real dependencies
4. **Design TT vision**: Customize `data/tt-teams/tt-team-types.json` if needed (default uses standard TT colors)
   - Create target team structures in `data/tt-teams/`
   - Define interaction modes between teams
5. **Iterate**: Use the visualization to communicate and refine the transformation

### Customizing Team Types

Both views support customizable team type definitions via JSON configuration:

**File**: `data/current-teams/current-team-types.json` or `data/tt-teams/tt-team-types.json`

```json
{
  "team_types": [
    {
      "id": "your-team-type-id",
      "name": "Display Name",
      "description": "What this team type means in your context",
      "color": "#hexcolor"
    }
  ]
}
```

- **id**: Used in team markdown files (`team_type: your-team-type-id`)
- **name**: Displayed in the legend
- **description**: Shown as tooltip on hover
- **color**: Hex color for the team boxes on canvas

The tool is designed to help facilitate conversations about:
- Where are our current bottlenecks?
- Which teams have too much cognitive load?
- How can we reduce dependencies?
- What team types do we need?
- How should teams interact?
