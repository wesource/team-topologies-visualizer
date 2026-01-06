"""API routes for Pre-TT (current-teams) data management"""
import json
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
    CURRENT_TEAMS_DIR,
    find_all_teams,
    find_team_by_name_or_slug,
    write_team_file_to_path,
)
from backend.snapshot_services import create_snapshot, list_snapshots, load_snapshot
from backend.validation import validate_all_team_files

router = APIRouter(prefix="/api/pre-tt", tags=["pre-tt"])


@router.get("/team-types")
async def get_team_types():
    """Get team type definitions with colors and descriptions for Pre-TT view"""
    config_file = CURRENT_TEAMS_DIR / "current-team-types.json"

    if not config_file.exists():
        raise HTTPException(status_code=404, detail="Team types configuration not found")

    with open(config_file, encoding='utf-8') as f:
        config = json.load(f)

    return config


@router.get("/organization-hierarchy")
async def get_organization_hierarchy():
    """Get the organizational hierarchy for Pre-TT current state view"""
    hierarchy_file = CURRENT_TEAMS_DIR / "organization-hierarchy.json"

    if not hierarchy_file.exists():
        raise HTTPException(status_code=404, detail="Organization hierarchy not found")

    with open(hierarchy_file, encoding='utf-8') as f:
        hierarchy = json.load(f)

    return hierarchy


@router.get("/product-lines")
async def get_product_lines():
    """Get teams grouped by product lines for Product Lines view (Pre-TT only)"""
    products_file = CURRENT_TEAMS_DIR / "products.json"
    
    if not products_file.exists():
        raise HTTPException(status_code=404, detail="Products configuration not found")
    
    with open(products_file, encoding='utf-8') as f:
        products_config = json.load(f)
    
    # Get all teams from current view
    all_teams = find_all_teams("current")
    
    # Group teams by product_line
    products_with_teams = {}
    shared_teams = []
    
    for team in all_teams:
        product_line = team.product_line
        
        if product_line:
            if product_line not in products_with_teams:
                products_with_teams[product_line] = []
            products_with_teams[product_line].append(team.model_dump())
        else:
            # Teams without product_line go to shared section
            shared_teams.append(team.model_dump())
    
    # Build response with product metadata
    result = {
        "products": [],
        "shared_teams": shared_teams
    }
    
    for product_config in products_config["products"]:
        product_name = product_config["name"]
        result["products"].append({
            "id": product_config["id"],
            "name": product_name,
            "description": product_config["description"],
            "color": product_config["color"],
            "teams": products_with_teams.get(product_name, [])
        })
    
    return result


@router.get("/teams", response_model=list[TeamData])
async def get_teams():
    """Get all Pre-TT teams"""
    return find_all_teams("current")


@router.get("/teams/{team_name}", response_model=TeamData)
async def get_team(team_name: str):
    """Get a specific Pre-TT team by name or URL-safe slug"""
    result = find_team_by_name_or_slug(team_name, "current")

    if result is None:
        raise HTTPException(status_code=404, detail=f"Team not found: {team_name}")

    team, _ = result
    return team


@router.patch("/teams/{team_name}/position")
async def update_team_position(team_name: str, position: PositionUpdate):
    """Update only the position of a Pre-TT team (for drag-and-drop on canvas)"""
    result = find_team_by_name_or_slug(team_name, "current")

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
    """Validate all Pre-TT team files for common issues"""
    validation_report = validate_all_team_files("current")
    return validation_report


# Snapshot endpoints (Pre-TT evolution tracking)
@router.post("/snapshots/create", response_model=Snapshot)
async def create_new_snapshot(request: CreateSnapshotRequest):
    """Create a new snapshot of the current Pre-TT state.

    If team_names is provided, creates a filtered snapshot with only those teams.
    Otherwise, includes all teams.
    """
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
    """List all available Pre-TT snapshots with metadata"""
    return list_snapshots()


@router.get("/snapshots/{snapshot_id}", response_model=Snapshot)
async def get_snapshot(snapshot_id: str):
    """Load a specific Pre-TT snapshot by ID"""
    snapshot = load_snapshot(snapshot_id)

    if snapshot is None:
        raise HTTPException(status_code=404, detail=f"Snapshot not found: {snapshot_id}")

    return snapshot


@router.get("/snapshots/compare/{before_id}/{after_id}")
async def compare_snapshot_versions(before_id: str, after_id: str):
    """
    Compare two Pre-TT snapshots and return differences

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
