"""API routes for team data management"""
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
    get_data_dir,
    write_team_file_to_path,
)
from backend.snapshot_services import create_snapshot, list_snapshots, load_snapshot
from backend.validation import validate_all_team_files

router = APIRouter(prefix="/api", tags=["teams"])


@router.get("/team-types")
async def get_team_types(view: str = "tt"):
    """Get team type definitions with colors and descriptions for a specific view"""
    data_dir = get_data_dir(view)
    config_filename = "tt-team-types.json" if view == "tt" else "current-team-types.json"
    config_file = data_dir / config_filename

    if not config_file.exists():
        raise HTTPException(status_code=404, detail="Team types configuration not found")

    with open(config_file, encoding='utf-8') as f:
        config = json.load(f)

    return config


@router.get("/organization-hierarchy")
async def get_organization_hierarchy():
    """Get the organizational hierarchy for current state view"""
    hierarchy_file = CURRENT_TEAMS_DIR / "organization-hierarchy.json"

    if not hierarchy_file.exists():
        raise HTTPException(status_code=404, detail="Organization hierarchy not found")

    with open(hierarchy_file, encoding='utf-8') as f:
        hierarchy = json.load(f)

    return hierarchy


@router.get("/pre-tt/product-lines")
async def get_product_lines():
    """Get teams grouped by product lines for Product Lines view"""
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


@router.get("/pre-tt/value-streams")
async def get_value_streams():
    """Get teams grouped by value streams for Value Streams view"""
    value_streams_file = CURRENT_TEAMS_DIR / "value-streams.json"

    if not value_streams_file.exists():
        raise HTTPException(status_code=404, detail="Value streams configuration not found")

    with open(value_streams_file, encoding='utf-8') as f:
        value_streams_config = json.load(f)

    # Get all teams from current view
    all_teams = find_all_teams("current")

    # Group teams first by value_stream, then by product_line
    value_streams_data = {}
    products_without_value_stream = {}
    ungrouped_teams = []

    for team in all_teams:
        value_stream = team.value_stream
        product_line = team.product_line
        team_dict = team.model_dump()

        if value_stream:
            # Team has value_stream assignment
            if value_stream not in value_streams_data:
                value_streams_data[value_stream] = {}
            
            if product_line:
                if product_line not in value_streams_data[value_stream]:
                    value_streams_data[value_stream][product_line] = []
                value_streams_data[value_stream][product_line].append(team_dict)
            else:
                # Team has value_stream but no product_line
                if "_no_product" not in value_streams_data[value_stream]:
                    value_streams_data[value_stream]["_no_product"] = []
                value_streams_data[value_stream]["_no_product"].append(team_dict)
        
        elif product_line:
            # Team has product_line but no value_stream
            if product_line not in products_without_value_stream:
                products_without_value_stream[product_line] = []
            products_without_value_stream[product_line].append(team_dict)
        
        else:
            # Team has neither value_stream nor product_line
            ungrouped_teams.append(team_dict)

    # Build response with value stream metadata and nested product structure
    result = {
        "perspective": "value-streams",
        "value_streams": {},
        "products_without_value_stream": products_without_value_stream,
        "ungrouped_teams": ungrouped_teams,
        "teams": [team.model_dump() for team in all_teams]
    }

    for vs_config in value_streams_config["value_streams"]:
        vs_name = vs_config["name"]
        vs_products = value_streams_data.get(vs_name, {})
        
        result["value_streams"][vs_name] = {
            "id": vs_config["id"],
            "name": vs_name,
            "description": vs_config["description"],
            "color": vs_config["color"],
            "products": vs_products,
            "metadata": {
                "expected_products": vs_config.get("products", []),
                "team_count": sum(len(teams) for teams in vs_products.values())
            }
        }

    return result


@router.get("/teams", response_model=list[TeamData])

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
async def validate_files(view: str = "tt") -> dict[str, Any]:
    """Validate all team files for common issues"""
    validation_report = validate_all_team_files(view)
    return validation_report


# Snapshot endpoints
@router.post("/snapshots/create", response_model=Snapshot)
async def create_new_snapshot(request: CreateSnapshotRequest):
    """Create a new snapshot of the current TT design state.

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
    """List all available snapshots with metadata"""
    return list_snapshots()


@router.get("/snapshots/{snapshot_id}", response_model=Snapshot)
async def get_snapshot(snapshot_id: str):
    """Load a specific snapshot by ID"""
    snapshot = load_snapshot(snapshot_id)

    if snapshot is None:
        raise HTTPException(status_code=404, detail=f"Snapshot not found: {snapshot_id}")

    return snapshot


@router.get("/snapshots/compare/{before_id}/{after_id}")
async def compare_snapshot_versions(before_id: str, after_id: str):
    """
    Compare two snapshots and return differences

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
