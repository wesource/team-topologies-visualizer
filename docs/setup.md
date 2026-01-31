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

## TT Design Data Variants

You can maintain multiple TT design variants in parallel folders and switch between them using the `TT_DESIGN_VARIANT` environment variable.

**Example use cases:**
- Comparing different design proposals (e.g., `tt-design-proposal-a` vs `tt-design-proposal-b`)
- Tracking evolution over time (e.g., `tt-design-2024-q1`, `tt-design-2024-q2`)
- This repo includes two example variants: mid-stage (`tt-teams`, default) and first-step (`tt-teams-initial`) transformations

See **[example_data.md](example_data.md)** for details on the included example variants.

**To switch between TT design variants**, set the `TT_DESIGN_VARIANT` environment variable:

**Local (Linux/Mac):**

```bash
export TT_DESIGN_VARIANT=tt-teams-initial
python -m uvicorn main:app --reload
```

**Local (Windows PowerShell):**

```powershell
$env:TT_DESIGN_VARIANT="tt-teams-initial"
python -m uvicorn main:app --reload
```

**Docker/Podman:**

```bash
docker run -p 8000:8000 -e TT_DESIGN_VARIANT=tt-teams-initial team-topologies-viz
```

If `TT_DESIGN_VARIANT` is not set, the app uses the default folder (`tt-teams`).

## Testing

See [testing.md](testing.md) for the full testing guide (pytest + Vitest + Playwright), including debugging tips.

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

## Handling Dependabot PRs

Dependabot automatically creates PRs to update dependencies. **Never merge PRs with failing CI checks** - test failures indicate breaking changes that need attention.

### Workflow for Dependabot PRs

**✅ Safe to merge:**
- All CI checks pass (green checkmarks)
- Tests pass locally when you test the changes

**⚠️ Requires investigation:**
- Any CI check fails (red X)
- Linting errors
- Test failures

**❌ Never merge:**
- Failing tests
- Breaking changes without understanding impact
- Major version bumps without reviewing changelog

### When Tests Fail in a Dependabot PR

1. **Check the dependency being updated**
   - Look at the PR title (e.g., "Bump vitest from 4.0.16 to 5.0.0")
   - Note if it's a major, minor, or patch version change

2. **Review the changelog**
   - Check the dependency's GitHub releases or CHANGELOG
   - Look for breaking changes, especially for major version bumps

3. **Reproduce locally**
   ```powershell
   # Check out the PR branch
   git fetch origin pull/<PR-NUMBER>/head:dependabot-test
   git checkout dependabot-test
   
   # Install dependencies
   cd frontend
   npm ci
   
   # Run tests
   npm test
   ```

4. **Fix or close:**
   - **Fix**: Update code/tests to match new API, push to PR branch
   - **Close**: If it's a bug in the dependency, close PR and wait for upstream fix

### Dependabot Configuration

See [.github/dependabot.yml](.github/dependabot.yml) for update schedule and grouping rules.

## Data Organization

The `data/` directory has two subdirectories for different visualization purposes:

Each team is stored as a **Markdown file with YAML front matter**:

- **YAML front matter** = lightweight metadata the app needs for filtering, grouping, and layout (keep it minimal).
- **Markdown body** = the main content you write (Team API, context, notes, agreements). This is where most of the meaningful documentation should live.

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

**Organizational Structure Types:**

In addition to team types, the baseline view supports **organizational structure types** for hierarchy visualization:
- `department` - Department containers (e.g., Engineering Dept, Sales Dept)
- `executive` - Leadership/executive layer (e.g., C-suite, VP level)
- `leadership` - Management/leadership roles
- `region` - Regional organizational divisions
- `division` - Corporate divisions

**Design note**: These org structure types are kept separate from `baseline-team-types.json` because they represent organizational **containers** (hierarchy nodes), not actual **working teams**. They're validated in `backend/validation.py` to keep the semantic distinction clear. You can use these types in your baseline team markdown files for hierarchy visualization, but they won't appear in the team types configuration.

#### Baseline team files: required vs optional

##### Required YAML fields (minimum to get started)

- `team_id` (stable identifier; should be unique)
- `name` (display name)
- `team_type` (must match an id from `data/baseline-teams/baseline-team-types.json`)

##### Common optional YAML fields (add as you need them)

- `dependencies` (used for baseline communication/dependency lines)
- `product_line`, `business_stream` (used for Baseline perspectives/lane grouping)
- `position` (optional; you can drag teams in the UI and the app will store coordinates)
- `metadata.*` (extra fields like `department`, `line_manager`, `cognitive_load`, `size`)

##### Minimal baseline example (YAML + Markdown)

YAML front matter (metadata):

```yaml
---
team_id: backend-services-team
name: Backend Services Team
team_type: feature-team
---
```

Markdown body (main content):

```markdown
# Mission

Describe what this team exists to achieve.

# Current dependencies and pain points

Capture reality: who you coordinate with, where the friction is, and what’s driving cognitive load.
```

**Template**: Use `templates/baseline-team-template.md` as starting point

### TT Design Data (`data/tt-teams/`)

**Purpose**: Document your **designed future state** following Team Topologies principles.

**What to include:**
- Proposed team structures with TT team types
- Value stream or platform groupings
- Interaction modes
- Team APIs (services provided, SLAs, communication channels)

**Configuration files:**
- `tt-team-types.json` - TT team types (stream-aligned, platform, enabling, complicated-subsystem, undefined)

#### TT Design team files: required vs optional

##### Required YAML fields (minimum to get started)

- `team_id` (stable identifier; should be unique)
- `name` (display name)
- `team_type` (one of the TT types; must match an id from `data/tt-teams/tt-team-types.json`)

##### Common optional YAML fields (add as you need them)

- `value_stream` (used for value stream groupings)
- `platform_grouping` (usually only for platform teams)
- `value_stream_inner` (nested grouping inside a value stream - for fractal patterns)
- `platform_grouping_inner` (nested grouping inside a platform grouping - for fractal patterns)
- `interaction_modes` / `interactions` (optional; you can also document interactions in Markdown)
- `position` (optional; you can drag teams in the UI and the app will store coordinates)
- `metadata.*` (extra fields like `cognitive_load`, `size`)

**Inner grouping guidance** (for fractal patterns):

When using an `*_inner` field, it’s recommended to only use **one** “outer” grouping on that team:

- If `value_stream_inner` is set, set `value_stream` and leave `platform_grouping` empty.
- If `platform_grouping_inner` is set, set `platform_grouping` and leave `value_stream` empty.

##### Minimal TT design example (YAML + Markdown)

YAML front matter (metadata):

```yaml
---
team_id: e-commerce-checkout-team
name: E-commerce Checkout Team
team_type: stream-aligned
---
```

Markdown body (Team API / working agreements):

```markdown
# Mission

What valuable outcome does this team own?

# How to work with us

How to contact us, lead time expectations, and decision boundaries.

# Interactions

Document intended Team Topologies interactions (Collaboration, X-as-a-Service, Facilitating).
```

Interaction modes are usually documented in the markdown section (see the templates). The app also supports providing designed interaction modes in YAML via `interaction_modes:` (or an `interactions:` array).

<a id="tt-design-templates"></a>
**Templates**:

| Template | When to use | Real example |
|---|---|---|
| [tt-team-api-template-minimal.md](../templates/tt-team-api-template-minimal.md) | Quick start: just a mission, how to contact the team, and a simple interactions table | [Security Compliance Team](../data/tt-teams/security-compliance-team.md) |
| [tt-team-api-template-base.md](../templates/tt-team-api-template-base.md) | Recommended default: a full Team API (ownership, SLAs, comms, interactions) without the extra platform-product sections | [Observability Platform Team](../data/tt-teams/observability-platform-team.md) |
| [tt-team-api-template-extended.md](../templates/tt-team-api-template-extended.md) | Best for platform teams (or mature teams) that want deeper “platform as a product” detail and metrics | [Cloud Development Platform Team](../data/tt-teams/cloud-development-platform-team.md) |

## Using Team Templates

The [templates/](../templates/) directory contains ready-to-use markdown templates:

- `templates/baseline-team-template.md` (Baseline)
- TT Design templates + real examples: see [TT Design templates](#tt-design-templates)

Recommended workflow:

1. Copy a template into the right `data/` folder
2. Name the file to match `team_id` (recommended), e.g. `data/tt-teams/my-team-id.md`
3. Edit YAML front matter (start with just `team_id`, `name`, `team_type`; add the optional fields only when they help)
4. Fill in the Markdown sections (this is the main content)
5. Validate and refresh

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

See [usage.md](usage.md) for a UI walkthrough (switching views, dragging/zooming, validation).

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
