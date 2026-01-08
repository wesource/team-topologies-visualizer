"""API routes for TT-Design (tt-teams) data management"""
import json
import os
from typing import Any

from fastapi import APIRouter, HTTPException

from backend.models import PositionUpdate, TeamData
from backend.services import (
    TT_TEAMS_DIR,
    find_all_teams,
    find_team_by_name_or_slug,
    write_team_file_to_path,
)
from backend.validation import validate_all_team_files

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


@router.get("/teams/{team_name}", response_model=TeamData)
async def get_team(team_name: str):
    """Get a specific TT-Design team by name or URL-safe slug"""
    result = find_team_by_name_or_slug(team_name, "tt")

    if result is None:
        raise HTTPException(status_code=404, detail=f"Team not found: {team_name}")

    team, _ = result
    return team


@router.patch("/teams/{team_name}/position")
async def update_team_position(team_name: str, position: PositionUpdate):
    """Update only the position of a TT-Design team (for drag-and-drop on canvas)"""
    if os.getenv("READ_ONLY_MODE") == "true":
        raise HTTPException(status_code=403, detail="Modifications not allowed in demo mode")

    result = find_team_by_name_or_slug(team_name, "tt")

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
    """Validate all TT-Design team files for common issues"""
    validation_report = validate_all_team_files("tt")
    return validation_report
