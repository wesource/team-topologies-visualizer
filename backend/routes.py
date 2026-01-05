"""API routes for team data management"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
from pathlib import Path
from backend.models import (
    TeamData, PositionUpdate, CreateSnapshotRequest, 
    Snapshot, SnapshotMetadata
)
from backend.services import (
    get_data_dir, find_all_teams, find_team_by_name, find_team_by_name_or_slug,
    write_team_file_to_path, CURRENT_TEAMS_DIR
)
from backend.validation import validate_all_team_files
from backend.snapshot_services import create_snapshot, list_snapshots, load_snapshot

router = APIRouter(prefix="/api", tags=["teams"])


@router.get("/team-types")
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


@router.get("/organization-hierarchy")
async def get_organization_hierarchy():
    """Get the organizational hierarchy for current state view"""
    hierarchy_file = CURRENT_TEAMS_DIR / "organization-hierarchy.json"
    
    if not hierarchy_file.exists():
        raise HTTPException(status_code=404, detail="Organization hierarchy not found")
    
    with open(hierarchy_file, 'r', encoding='utf-8') as f:
        hierarchy = json.load(f)
    
    return hierarchy


@router.get("/teams", response_model=List[TeamData])
async def get_teams(view: str = "tt"):
    """Get all teams for a specific view (tt or current)"""
    return find_all_teams(view)


@router.get("/teams/{team_name}", response_model=TeamData)
async def get_team(team_name: str, view: str = "tt"):
    """Get a specific team by name or URL-safe slug"""
    result = find_team_by_name_or_slug(team_name, view)
    
    if result is None:
        raise HTTPException(status_code=404, detail=f"Team not found: {team_name}")
    
    team, _ = result
    return team


@router.patch("/teams/{team_name}/position")
async def update_team_position(team_name: str, position: PositionUpdate, view: str = "tt"):
    """Update only the position of a team (for drag-and-drop on canvas)"""
    result = find_team_by_name_or_slug(team_name, view)
    
    if result is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team, file_path = result
    
    # Update only the position
    team.position = {"x": position.x, "y": position.y}
    
    # Write back to the same file location
    write_team_file_to_path(team, file_path)
    
    return {"message": "Position updated", "position": team.position}


@router.get("/validate")
async def validate_files(view: str = "tt") -> Dict[str, Any]:
    """Validate all team files for common issues"""
    validation_report = validate_all_team_files(view)
    return validation_report


# Snapshot endpoints
@router.post("/snapshots/create", response_model=Snapshot)
async def create_new_snapshot(request: CreateSnapshotRequest):
    """Create a new snapshot of the current TT design state"""
    try:
        snapshot = create_snapshot(
            name=request.name,
            description=request.description or "",
            author=request.author or ""
        )
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create snapshot: {str(e)}")


@router.get("/snapshots", response_model=List[SnapshotMetadata])
async def get_snapshots():
    """List all available snapshots with metadata"""
    return list_snapshots()


@router.get("/snapshots/{snapshot_id}", response_model=Snapshot)
async def get_snapshot(snapshot_id: str):
    """Load a specific snapshot by ID"""
    snapshot = load_snapshot(snapshot_id)
    
    if snapshot is None:
        raise HTTPException(status_code=404, detail=f"Snapshot not found: {snapshot_id}")
    
    return snapshot

