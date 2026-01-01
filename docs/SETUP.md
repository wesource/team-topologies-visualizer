# Setup and Configuration Guide

## Prerequisites

**Option 1: Local Python**
- Python 3.8 or higher
- Modern web browser with HTML5 Canvas support

**Option 2: Docker/Podman**
- Docker or Podman installed
- Modern web browser with HTML5 Canvas support

## Quick Setup

### Option A: Local Python Setup

1. **Clone or navigate to the project directory**

2. **Create a virtual environment**
   ```bash
   py -m venv venv
   ```

3. **Install dependencies**
   ```bash
   .\venv\Scripts\pip.exe install -r requirements.txt
   ```
   
   Or on Linux/Mac:
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

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
- **Current State** - Shows the traditional organizational structure
- **TT Design** - Shows the target TT patterns

### Visualizing Teams

- The canvas displays all teams with color-coded boxes based on their type
- **Drag teams** to reposition them (positions are auto-saved)
- **Double-click teams** to view full details including description, dependencies, and metadata
- **Click teams** in the sidebar to select them
- **Zoom** using mouse wheel
- **Connections** between teams show interaction modes with different line styles
- **Auto-align Teams** (Current State view only) - Click the "⚡ Auto-align Teams" button to automatically position teams vertically under their line managers in an org-chart layout. Teams are spaced 120px apart and aligned at a consistent X offset from their manager. Positions are automatically saved to each team's markdown file.
- **Show Communication Lines** checkbox - Toggle to show communication/dependency lines between teams in Current State view. Hidden by default to provide a cleaner org-chart visualization.
- **Refresh** button - Reload all team markdown files and configuration from disk. Useful when editing files externally. Preserves your current zoom/pan position on the canvas.

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
