"""API routes for TT-Design (tt-teams) data management"""
import json
import os
from typing import Any

from fastapi import APIRouter, HTTPException

from backend.comparison import compare_snapshots
from backend.models import (
    CreateSnapshotRequest,
    PositionUpdate,
    Snapshot,
    SnapshotMetadata,
    TeamData,
)
from backend.services import (
    TT_TEAMS_DIR,
    find_all_teams,
    find_team_by_id,
    write_team_file_to_path,
)
from backend.snapshot_services import create_snapshot, list_snapshots, load_snapshot
from backend.validation import validate_all_config_files, validate_all_team_files

router = APIRouter(prefix="/api/tt", tags=["tt-design"])


@router.get("/team-types")
async def get_team_types():
    """Get team type definitions with colors and descriptions for TT-Design view"""
    config_file = TT_TEAMS_DIR / "tt-team-types.json"

    if not config_file.exists():
        raise HTTPException(status_code=404, detail="Team types configuration not found")

    with open(config_file, encoding='utf-8') as f:
        config = json.load(f)

    return config


@router.get("/teams", response_model=list[TeamData])
async def get_teams():
    """Get all TT-Design teams"""
    return find_all_teams("tt")


@router.get("/teams/{team_id}", response_model=TeamData)
async def get_team(team_id: str):
    """Get a specific TT-Design team by team_id (stable identifier)"""
    result = find_team_by_id(team_id, "tt")

    if result is None:
        raise HTTPException(status_code=404, detail=f"Team not found: {team_id}")

    team, _ = result
    return team


@router.patch("/teams/{team_id}/position")
async def update_team_position(team_id: str, position: PositionUpdate):
    """Update only the position of a TT-Design team (for drag-and-drop on canvas)"""
    if os.getenv("READ_ONLY_MODE") == "true":
        raise HTTPException(status_code=403, detail="Modifications not allowed in demo mode")

    result = find_team_by_id(team_id, "tt")

    if result is None:
        raise HTTPException(status_code=404, detail="Team not found")

    team, file_path = result

    # Update only the position
    team.position = {"x": position.x, "y": position.y}

    # Write back to the same file location
    write_team_file_to_path(team, file_path)

    return {"message": "Position updated", "position": team.position}


@router.get("/validate")
async def validate_files() -> dict[str, Any]:
    """Validate all TT-Design team files and config files"""
    team_validation = validate_all_team_files("tt")
    config_validation = validate_all_config_files("tt")
    return {
        "teams": team_validation,
        "config_files": config_validation,
        "team_schema": "tt-team-file"
    }


# Snapshot endpoints (TT Design evolution tracking)
@router.post("/snapshots/create", response_model=Snapshot)
async def create_new_snapshot(request: CreateSnapshotRequest):
    """Create a new snapshot of the current TT Design state.

    If team_names is provided, creates a filtered snapshot with only those teams.
    Otherwise, includes all teams.
    """
    if os.getenv("READ_ONLY_MODE") == "true":
        raise HTTPException(status_code=403, detail="Modifications not allowed in demo mode")

    try:
        snapshot = create_snapshot(
            name=request.name,
            description=request.description or "",
            author=request.author or "",
            team_names=request.team_names
        )
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create snapshot: {str(e)}")


@router.get("/snapshots", response_model=list[SnapshotMetadata])
async def get_snapshots():
    """List all available TT Design snapshots with metadata"""
    return list_snapshots()


@router.get("/snapshots/{snapshot_id}", response_model=Snapshot)
async def get_snapshot(snapshot_id: str):
    """Load a specific TT Design snapshot by ID"""
    snapshot = load_snapshot(snapshot_id)

    if snapshot is None:
        raise HTTPException(status_code=404, detail=f"Snapshot not found: {snapshot_id}")

    return snapshot


@router.get("/snapshots/compare/{before_id}/{after_id}")
async def compare_snapshot_versions(before_id: str, after_id: str):
    """
    Compare two TT Design snapshots and return differences

    Args:
        before_id: ID of the earlier snapshot
        after_id: ID of the later snapshot

    Returns:
        Comparison data with added, removed, moved, and type-changed teams
    """
    before = load_snapshot(before_id)
    after = load_snapshot(after_id)

    if before is None:
        raise HTTPException(status_code=404, detail=f"Before snapshot not found: {before_id}")
    if after is None:
        raise HTTPException(status_code=404, detail=f"After snapshot not found: {after_id}")

    return compare_snapshots(before, after)
