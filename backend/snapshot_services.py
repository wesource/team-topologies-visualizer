"""Service layer for snapshot operations"""
import json
from datetime import datetime
from pathlib import Path

from backend.models import (
    Snapshot,
    SnapshotMetadata,
    SnapshotStatistics,
    SnapshotTeamCondensed,
    TeamData,
)
from backend.services import find_all_teams

# Snapshots directory
SNAPSHOTS_DIR = Path("data/tt-snapshots")
SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)


def condense_team_for_snapshot(team: TeamData) -> SnapshotTeamCondensed:
    """Convert full TeamData to condensed format for snapshots"""
    # Extract key Team API fields if available
    team_api_summary = None
    if team.team_api:
        team_api_summary = {
            "purpose": team.team_api.purpose,
            "services": team.team_api.services_provided,
            "contact": team.team_api.contact,
        }
    elif team.purpose:  # Fallback to top-level purpose
        team_api_summary = {"purpose": team.purpose}

    return SnapshotTeamCondensed(
        name=team.name,
        team_type=team.team_type or "other",
        position=team.position or {"x": 0, "y": 0},
        value_stream=team.value_stream,
        platform_grouping=team.platform_grouping,
        dependencies=team.dependencies or [],
        interaction_modes=team.interaction_modes or {},
        metadata={
            "size": team.metadata.get("size") if team.metadata else None,
            "cognitive_load": team.cognitive_load or (team.metadata.get("cognitive_load") if team.metadata else None),
            "established": team.established or (team.metadata.get("established") if team.metadata else None),
        },
        team_api_summary=team_api_summary
    )


def calculate_statistics(teams: list[TeamData]) -> SnapshotStatistics:
    """Calculate statistics for a snapshot"""
    stats = {
        "total_teams": len(teams),
        "stream_aligned": 0,
        "platform": 0,
        "enabling": 0,
        "complicated_subsystem": 0,
        "value_streams": set(),
        "platform_groupings": set(),
    }

    for team in teams:
        # Count team types
        if team.team_type == "stream-aligned":
            stats["stream_aligned"] += 1
        elif team.team_type == "platform":
            stats["platform"] += 1
        elif team.team_type == "enabling":
            stats["enabling"] += 1
        elif team.team_type == "complicated-subsystem":
            stats["complicated_subsystem"] += 1

        # Collect unique value streams and platform groupings
        if team.value_stream:
            stats["value_streams"].add(team.value_stream)
        if team.platform_grouping:
            stats["platform_groupings"].add(team.platform_grouping)

    return SnapshotStatistics(
        total_teams=stats["total_teams"],
        stream_aligned=stats["stream_aligned"],
        platform=stats["platform"],
        enabling=stats["enabling"],
        complicated_subsystem=stats["complicated_subsystem"],
        value_streams=len(stats["value_streams"]),
        platform_groupings=len(stats["platform_groupings"])
    )


def generate_snapshot_id(name: str, created_at: datetime) -> str:
    """Generate a unique snapshot ID from name and timestamp"""
    # Convert name to URL-safe format
    safe_name = name.lower()
    safe_name = safe_name.replace(" ", "-")
    safe_name = ''.join(c for c in safe_name if c.isalnum() or c == '-')

    # Add timestamp for uniqueness
    timestamp = created_at.strftime("%Y%m%d-%H%M%S")

    return f"{safe_name}-{timestamp}"


def create_snapshot(name: str, description: str = "", author: str = "", team_names: list[str] | None = None) -> Snapshot:
    """Create a new snapshot of current TT design state

    Args:
        name: Snapshot name
        description: Optional description
        author: Optional author
        team_names: Optional list of team names to include (for filtered snapshots).
                   If None, includes all teams.
    """
    # Load all current teams
    all_teams = find_all_teams(view="tt")

    # Filter teams if specific names provided
    if team_names is not None:
        teams = [team for team in all_teams if team.name in team_names]
    else:
        teams = all_teams

    # Create snapshot metadata
    created_at = datetime.now()
    snapshot_id = generate_snapshot_id(name, created_at)

    # Condense teams
    condensed_teams = [condense_team_for_snapshot(team) for team in teams]

    # Calculate statistics
    statistics = calculate_statistics(teams)

    # Create snapshot object
    snapshot = Snapshot(
        snapshot_id=snapshot_id,
        name=name,
        description=description,
        author=author,
        created_at=created_at,
        teams=condensed_teams,
        statistics=statistics
    )

    # Save to file
    snapshot_file = SNAPSHOTS_DIR / f"{snapshot_id}.json"
    with open(snapshot_file, 'w', encoding='utf-8') as f:
        json.dump(snapshot.model_dump(mode='json'), f, indent=2, default=str)

    return snapshot


def list_snapshots() -> list[SnapshotMetadata]:
    """List all available snapshots with metadata"""
    snapshots = []

    for snapshot_file in SNAPSHOTS_DIR.glob("*.json"):
        try:
            with open(snapshot_file, encoding='utf-8') as f:
                data = json.load(f)

            # Extract metadata only
            metadata = SnapshotMetadata(
                snapshot_id=data["snapshot_id"],
                name=data["name"],
                description=data.get("description", ""),
                author=data.get("author", ""),
                created_at=datetime.fromisoformat(data["created_at"]),
                statistics=SnapshotStatistics(**data["statistics"])
            )
            snapshots.append(metadata)
        except Exception as e:
            print(f"Warning: Could not load snapshot {snapshot_file}: {e}")
            continue

    # Sort by creation date (newest first)
    snapshots.sort(key=lambda s: s.created_at, reverse=True)

    return snapshots


def load_snapshot(snapshot_id: str) -> Snapshot | None:
    """Load a specific snapshot by ID"""
    snapshot_file = SNAPSHOTS_DIR / f"{snapshot_id}.json"

    if not snapshot_file.exists():
        return None

    try:
        with open(snapshot_file, encoding='utf-8') as f:
            data = json.load(f)

        # Parse datetime string
        data["created_at"] = datetime.fromisoformat(data["created_at"])

        return Snapshot(**data)
    except Exception as e:
        print(f"Error loading snapshot {snapshot_id}: {e}")
        return None
