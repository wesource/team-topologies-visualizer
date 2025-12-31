from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import yaml
import markdown
import json
from pathlib import Path

app = FastAPI(title="Team Topologies API")

# CORS middleware to allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Data directories
TT_TEAMS_DIR = Path("data/tt-teams")
CURRENT_TEAMS_DIR = Path("data/current-teams")
TT_TEAMS_DIR.mkdir(parents=True, exist_ok=True)
CURRENT_TEAMS_DIR.mkdir(parents=True, exist_ok=True)


def get_data_dir(view: str = "tt") -> Path:
    """Get the appropriate data directory based on view"""
    return TT_TEAMS_DIR if view == "tt" else CURRENT_TEAMS_DIR


class TeamData(BaseModel):
    name: str
    team_type: Optional[str] = "other"  # stream-aligned, enabling, complicated-subsystem, platform, OR for current: dev-team, ops-team, etc
    description: Optional[str] = ""
    dependencies: Optional[List[str]] = []
    interaction_modes: Optional[Dict[str, str]] = {}  # {team_name: interaction_mode}
    line_manager: Optional[str] = None  # For current org structure
    position: Optional[Dict[str, float]] = {"x": 0, "y": 0}
    metadata: Optional[Dict[str, Any]] = {}


def parse_team_file(file_path: Path) -> TeamData:
    """Parse a markdown file with YAML front matter"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split YAML front matter and markdown content
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            yaml_content = parts[1]
            markdown_content = parts[2].strip()
            
            # Parse YAML
            data = yaml.safe_load(yaml_content) or {}
            data['description'] = markdown_content
            
            return TeamData(**data)
    
    # If no front matter, treat as plain markdown
    return TeamData(
        name=file_path.stem,
        team_type="stream-aligned",
        description=content
    )


def write_team_file(team: TeamData, data_dir: Path) -> Path:
    """Write team data to markdown file with YAML front matter"""
    file_path = data_dir / f"{team.name.lower().replace(' ', '-')}.md"
    return write_team_file_to_path(team, file_path)


def write_team_file_to_path(team: TeamData, file_path: Path) -> Path:
    """Write team data to a specific file path with YAML front matter"""
    # Prepare YAML front matter
    yaml_data = {
        'name': team.name,
        'team_type': team.team_type,
        'dependencies': team.dependencies or [],
        'interaction_modes': team.interaction_modes or {},
        'position': team.position or {"x": 0, "y": 0},
        'metadata': team.metadata or {}
    }
    
    # Add line_manager if present (for current org structure)
    if team.line_manager:
        yaml_data['line_manager'] = team.line_manager
    
    # Write file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('---\n')
        yaml.dump(yaml_data, f, default_flow_style=False, sort_keys=False)
        f.write('---\n\n')
        f.write(team.description or '')
    
    return file_path


@app.get("/")
async def root():
    """Redirect to static frontend"""
    return {"message": "Team Topologies API", "docs": "/docs", "frontend": "/static/index.html"}


@app.get("/api/team-types")
async def get_team_types(view: str = "tt"):
    """Get team type definitions with colors and descriptions for a specific view"""
    data_dir = get_data_dir(view)
    config_filename = "tt-team-types.json" if view == "tt" else "current-team-types.json"
    config_file = data_dir / config_filename
    
    if not config_file.exists():
        raise HTTPException(status_code=404, detail="Team types configuration not found")
    
    with open(config_file, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    return config


@app.get("/api/organization-hierarchy")
async def get_organization_hierarchy():
    """Get the organizational hierarchy for current state view"""
    hierarchy_file = CURRENT_TEAMS_DIR / "organization-hierarchy.json"
    
    if not hierarchy_file.exists():
        raise HTTPException(status_code=404, detail="Organization hierarchy not found")
    
    with open(hierarchy_file, 'r', encoding='utf-8') as f:
        hierarchy = json.load(f)
    
    return hierarchy


@app.get("/api/teams", response_model=List[TeamData])
async def get_teams(view: str = "tt"):
    """Get all teams for a specific view (tt or current)"""
    data_dir = get_data_dir(view)
    teams = []
    
    if not data_dir.exists():
        return teams
    
    # Files to exclude (hierarchy/department files)
    exclude_files = {
        'company-leadership.md',
        'engineering-dept.md',
        'customer-solutions-dept.md',
        'product-management-dept.md',
        'infrastructure-dept.md',
        'support-dept.md',
        'organization-hierarchy.json',
        'current-team-types.json',
        'tt-team-types.json'
    }
    
    # Recursively find all .md files (supports nested folder structure)
    for file_path in data_dir.rglob("*.md"):
        # Skip hierarchy/department files
        if file_path.name in exclude_files:
            continue
            
        try:
            team = parse_team_file(file_path)
            teams.append(team)
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
    
    return teams


@app.get("/api/teams/{team_name}", response_model=TeamData)
async def get_team(team_name: str, view: str = "tt"):
    """Get a specific team"""
    data_dir = get_data_dir(view)
    file_name = f"{team_name.lower().replace(' ', '-')}.md"
    
    # Search recursively for the team file (supports nested folder structure)
    for file_path in data_dir.rglob(file_name):
        return parse_team_file(file_path)
    
    # If not found, raise 404
    raise HTTPException(status_code=404, detail=f"Team not found: {team_name}")


class PositionUpdate(BaseModel):
    x: float
    y: float


@app.patch("/api/teams/{team_name}/position")
async def update_team_position(team_name: str, position: PositionUpdate, view: str = "tt"):
    """Update only the position of a team (for drag-and-drop on canvas)"""
    data_dir = get_data_dir(view)
    file_name = f"{team_name.lower().replace(' ', '-')}.md"
    
    # Search recursively for the team file
    file_path = None
    for found_path in data_dir.rglob(file_name):
        file_path = found_path
        break
    
    if not file_path:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Read existing team data
    team = parse_team_file(file_path)
    
    # Update only the position
    team.position = {"x": position.x, "y": position.y}
    
    # Write back to the same file location
    write_team_file_to_path(team, file_path)
    
    return {"message": "Position updated", "position": team.position}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
