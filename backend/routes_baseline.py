"""API routes for Baseline (baseline-teams) data management"""
import json
import os
from typing import Any

from fastapi import APIRouter, HTTPException

from backend.models import (
    PositionUpdate,
    TeamData,
)
from backend.services import (
    BASELINE_TEAMS_DIR,
    find_all_teams,
    find_team_by_id,
    write_team_file_to_path,
)
from backend.validation import validate_all_team_files

router = APIRouter(prefix="/api/baseline", tags=["baseline"])


@router.get("/team-types")
async def get_team_types():
    """Get team type definitions with colors and descriptions for Baseline view"""
    config_file = BASELINE_TEAMS_DIR / "baseline-team-types.json"

    if not config_file.exists():
        raise HTTPException(status_code=404, detail="Team types configuration not found")

    with open(config_file, encoding='utf-8') as f:
        config = json.load(f)

    return config


@router.get("/organization-hierarchy")
async def get_organization_hierarchy():
    """Get the organizational hierarchy for Baseline view"""
    hierarchy_file = BASELINE_TEAMS_DIR / "organization-hierarchy.json"

    if not hierarchy_file.exists():
        raise HTTPException(status_code=404, detail="Organization hierarchy not found")

    with open(hierarchy_file, encoding='utf-8') as f:
        hierarchy = json.load(f)

    return hierarchy


@router.get("/product-lines")
async def get_product_lines():
    """Get teams grouped by product lines for Product Lines view (Baseline only)"""
    products_file = BASELINE_TEAMS_DIR / "products.json"

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


@router.get("/business-streams")
async def get_business_streams():
    """Get teams grouped by business streams for Business Streams view (Baseline only)"""
    business_streams_file = BASELINE_TEAMS_DIR / "business-streams.json"

    if not business_streams_file.exists():
        raise HTTPException(status_code=404, detail="Business streams configuration not found")

    with open(business_streams_file, encoding='utf-8') as f:
        business_streams_config = json.load(f)

    # Get all teams from current view
    all_teams = find_all_teams("current")

    # Build nested structure: business_stream -> product -> teams
    business_streams_with_teams = {}
    products_without_business_stream = {}
    ungrouped_teams = []

    for team in all_teams:
        business_stream = team.business_stream
        product_line = team.product_line
        team_dict = team.model_dump()

        if business_stream:
            # Initialize business stream dict if needed
            if business_stream not in business_streams_with_teams:
                business_streams_with_teams[business_stream] = {}

            if product_line:
                # Group by product within business stream
                if product_line not in business_streams_with_teams[business_stream]:
                    business_streams_with_teams[business_stream][product_line] = []
                business_streams_with_teams[business_stream][product_line].append(team_dict)
            else:
                # Teams with business stream but no product
                if "_no_product" not in business_streams_with_teams[business_stream]:
                    business_streams_with_teams[business_stream]["_no_product"] = []
                business_streams_with_teams[business_stream]["_no_product"].append(team_dict)
        elif product_line:
            # Teams with product but no business stream
            if product_line not in products_without_business_stream:
                products_without_business_stream[product_line] = []
            products_without_business_stream[product_line].append(team_dict)
        else:
            # Completely ungrouped teams
            ungrouped_teams.append(team_dict)

    # Build response with business stream metadata
    result = {
        "perspective": "business-streams",
        "business_streams": {},
        "products_without_business_stream": products_without_business_stream,
        "ungrouped_teams": ungrouped_teams,
        "teams": [team.model_dump() for team in all_teams]
    }

    for bs_config in business_streams_config["business_streams"]:
        bs_name = bs_config["name"]

        result["business_streams"][bs_name] = {
            "id": bs_config["id"],
            "name": bs_name,
            "description": bs_config.get("description", ""),
            "color": bs_config["color"],
            "products": business_streams_with_teams.get(bs_name, {})
        }

    return result


@router.get("/teams", response_model=list[TeamData])
async def get_teams():
    """Get all Baseline teams"""
    return find_all_teams("current")


@router.get("/teams/{team_id}", response_model=TeamData)
async def get_current_team(team_id: str):
    """Get a specific current/baseline team by team_id (stable identifier)"""
    result = find_team_by_id(team_id, "current")

    if result is None:
        raise HTTPException(status_code=404, detail=f"Team not found: {team_id}")

    team, _ = result
    return team


@router.patch("/teams/{team_id}/position")
async def update_team_position(team_id: str, position: PositionUpdate):
    """Update only the position of a Baseline team (for drag-and-drop on canvas)"""
    if os.getenv("READ_ONLY_MODE") == "true":
        raise HTTPException(status_code=403, detail="Modifications not allowed in demo mode")

    result = find_team_by_id(team_id, "current")

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
    """Validate all Baseline team files for common issues"""
    validation_report = validate_all_team_files("current")
    return validation_report
