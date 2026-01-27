# Setup and Configuration Guide

## Prerequisites

**Option 1: Local Python**
- Python 3.10 or higher (CI tests on 3.11; newer versions like 3.12-3.13 should work)
- Modern web browser with HTML5 Canvas support
- Works on Windows, macOS, and Linux

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

The repo includes **two example TT designs** (mid-stage and first-step transformations). See **[EXAMPLE_DATA.md](EXAMPLE_DATA.md)** for detailed explanation of each variant and when to use them.

**To switch variants**, set the `TT_TEAMS_VARIANT` environment variable:

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

See [TESTING.md](TESTING.md) for the full testing guide (pytest + Vitest + Playwright), including debugging tips.

Quick start:

```powershell
# From project root
.\scripts\run-all-tests.ps1
```

Windows note: for backend tests, prefer `\.\venv\Scripts\python.exe -m pytest ...` to ensure you run under the venv.

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

### Baseline Data (`data/baseline-teams/`)

**Purpose**: Document your **current organizational reality** BEFORE Team Topologies transformation.

**What to include:**
- Current team structures as they exist today
- Reporting hierarchy (metadata.line_manager)
- Department assignments (metadata.department)
- Product/project allocations (product_line field)
- Business stream mapping (business_stream field, if applicable)
- Actual dependencies that exist
- Current pain points and cognitive load issues

**Configuration files:**
- `baseline-team-types.json` - Your organization's baseline team classifications (e.g., "feature-team", "platform-team", "support-team")

**Team file fields:**
```yaml
---
team_id: backend-services-team
name: Backend Services Team
team_type: feature-team
product_line: DispatchHub          # Product assignment
business_stream: B2B Fleet Management  # Business stream lane (if used)
dependencies:                      # Who we coordinate with
  - Database Platform Team
  - QA & Testing Team
position:
  x: 300
  y: 200
metadata:
  size: 6
  department: Engineering
  line_manager: Sarah Johnson
  cognitive_load: high             # Current reality
---
```

**Template**: Use `templates/baseline-team-template.md` as starting point

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
- `tt-team-types.json` - TT team types (stream-aligned, platform, enabling, complicated-subsystem, undefined)

**Team file fields:**
```yaml
---
team_id: e-commerce-checkout-team
name: E-commerce Checkout Team
team_type: stream-aligned          # TT team type
value_stream: E-commerce Experience
platform_grouping: null            # Optional (usually only for platform teams)
position:
  x: 500
  y: 300
metadata:
  size: 7
  cognitive_load: medium           # Target load
---

## Team API content follows...
```

Interaction modes are usually documented in the markdown section (see the templates). The app also supports providing designed interaction modes in YAML via `interaction_modes:` (or an `interactions:` array).

**Templates**:
- `templates/tt-team-api-template-minimal.md` - Minimal starter (mission + how to work with us + interactions)
- `templates/tt-team-api-template-base.md` - Base Team API
- `templates/tt-team-api-template-extended.md` - Extended template with platform product metrics

**Key difference**: Baseline uses `dependencies` (organic), TT Design uses `interaction_modes` (designed).

## Using Team Templates

The [templates/](../templates/) directory contains ready-to-use markdown templates:

- `templates/baseline-team-template.md` (Baseline)
- `templates/tt-team-api-template-minimal.md` (TT, minimal)
- `templates/tt-team-api-template-base.md` (TT, base)
- `templates/tt-team-api-template-extended.md` (TT, extended)

Recommended workflow:

1. Copy a template into the right `data/` folder
2. Edit YAML front matter (`team_id`, `name`, `team_type`, `position`, and optional grouping fields)
3. Fill in the Markdown sections
4. Validate and refresh

Examples:

```powershell
# Windows PowerShell
Copy-Item templates/baseline-team-template.md data/baseline-teams/my-new-team.md
Copy-Item templates/tt-team-api-template-base.md data/tt-teams/my-new-team.md
```

```bash
# Linux/Mac
cp templates/baseline-team-template.md data/baseline-teams/my-new-team.md
cp templates/tt-team-api-template-base.md data/tt-teams/my-new-team.md
```

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
  - API Base (Baseline): http://localhost:8000/api/baseline/teams
  - API Base (TT Design): http://localhost:8000/api/tt/teams

### Docker/Podman

If the container is already running (see setup above), just open:
- Frontend: http://localhost:8000/static/index.html
- API Documentation: http://localhost:8000/docs

## Usage

See [USAGE.md](USAGE.md) for a UI walkthrough (switching views, dragging/zooming, validation).

## Team Files

Teams are stored as markdown files with YAML front matter. Team types, colors, and descriptions are defined in prefixed configuration files within each view directory.

### Team Type Configuration

**Files**: `data/baseline-teams/baseline-team-types.json` or `data/tt-teams/tt-team-types.json`

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

**Baseline teams** (`data/baseline-teams/`) include:
```yaml
---
team_id: core-product-team
name: Core Product Team
team_type: feature-team            # Must match an id from baseline-team-types.json
dependencies:
  - Database Platform Team
product_line: DispatchHub
business_stream: B2B Fleet Management
position:
  x: 100
  y: 100
metadata:
  size: 8
  department: Engineering
  line_manager: Marcus Thompson
---

# Team description in markdown...
```

**Team Topologies teams** (`data/tt-teams/`) include:
```yaml
---
team_id: mobile-app-team
name: Mobile App Team
team_type: stream-aligned          # TT team type
value_stream: Mobile Experience
platform_grouping: null
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

The API is primarily **read-only** for visualization purposes.

Baseline (current state):

- `GET /api/baseline/teams` - List baseline teams
- `GET /api/baseline/teams/{team_id}` - Get a specific baseline team
- `GET /api/baseline/team-types` - Get baseline team type configuration
- `GET /api/baseline/organization-hierarchy` - Org hierarchy data (Hierarchy perspective)
- `GET /api/baseline/product-lines` - Product lines perspective data
- `GET /api/baseline/business-streams` - Business streams perspective data
- `GET /api/baseline/validate` - Validate baseline team + config files
- `PATCH /api/baseline/teams/{team_id}/position` - Update baseline team position on canvas (drag-and-drop)

TT Design (future state):

- `GET /api/tt/teams` - List TT Design teams
- `GET /api/tt/teams/{team_id}` - Get a specific TT Design team
- `GET /api/tt/team-types` - Get TT team type configuration
- `GET /api/tt/validate` - Validate TT team + config files
- `PATCH /api/tt/teams/{team_id}/position` - Update TT team position on canvas (drag-and-drop)

TT snapshots:

- `POST /api/tt/snapshots/create` - Create a TT Design snapshot
- `GET /api/tt/snapshots` - List snapshots
- `GET /api/tt/snapshots/{snapshot_id}` - Load a snapshot
- `GET /api/tt/snapshots/compare/{before_id}/{after_id}` - Compare two snapshots

Schemas and config:

- `GET /api/schemas` - JSON schemas used by validation UI
- `GET /api/schemas/{schema_name}` - JSON schema for a specific type
- `GET /api/config` - App config (e.g., demo mode)

**Note**: Create/update/delete operations for team content are intentionally not implemented via API. Teams should be managed by editing the markdown files directly in `data/baseline-teams/` and `data/tt-teams/` folders. The only write endpoints are canvas position updates (PATCH) and TT snapshot creation (POST), and both are blocked when `READ_ONLY_MODE=true`.

## Customizing for Your Organization

This is a **generic example** suitable for learning and demonstration. To use this for your own organization:

1. **Fork/clone this repository**
2. **Customize team type classifications**: Edit `data/baseline-teams/baseline-team-types.json` to match your organization's team categories
   - Define your own team type IDs (e.g., "feature-team", "platform-team", "support-team")
   - Set colors that make sense for your context
   - Write descriptions that reflect your organizational language
3. **Document baseline**: Replace team markdown files in `data/baseline-teams/`
   - Use your actual team names and structures
  - Document reporting lines (metadata.line_manager)
   - Capture real dependencies
4. **Design TT vision**: Customize `data/tt-teams/tt-team-types.json` if needed (default uses standard TT colors)
   - Create target team structures in `data/tt-teams/`
   - Define interaction modes between teams
5. **Iterate**: Use the visualization to communicate and refine the transformation

### Customizing Team Types

Both views support customizable team type definitions via JSON configuration:

**File**: `data/baseline-teams/baseline-team-types.json` or `data/tt-teams/tt-team-types.json`

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

### Customizing Product and Business Stream Ordering

Control the order products and business streams appear in Baseline views using the optional `display-order` field:

**Products** (`data/baseline-teams/products.json`):
```json
{
  "products": [
    {
      "id": "mobile-apps",
      "name": "Mobile Apps",
      "description": "iOS and Android apps",
      "color": "#e74c3c",
      "display-order": 1
    },
    {
      "id": "backend-platform",
      "name": "Backend Platform",
      "description": "API and services",
      "color": "#3498db",
      "display-order": 2
    }
  ]
}
```

**Business Streams** (`data/baseline-teams/business-streams.json`):
```json
{
  "business_streams": [
    {
      "id": "customer-facing",
      "name": "Customer Facing",
      "description": "Direct customer interactions",
      "products": ["Mobile Apps", "Web Portal"],
      "color": "#3498db",
      "display-order": 1
    }
  ]
}
```

**Rules:**
- `display-order` is an integer ≥ 0 (lower numbers appear first)
- Field is optional - if omitted, items appear in array order
- Backward compatible with existing configurations without display-order

This gives you explicit control over lane ordering instead of relying on filesystem order or alphabetical sorting.
