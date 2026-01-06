"""Snapshot comparison logic"""
from typing import Any

from backend.models import Snapshot


def compare_snapshots(before: Snapshot, after: Snapshot) -> dict[str, Any]:
    """
    Compare two snapshots and return differences

    Returns:
        Dictionary with added, removed, moved, and type_changed teams
    """
    before_teams = {team.name: team for team in before.teams}
    after_teams = {team.name: team for team in after.teams}

    before_names = set(before_teams.keys())
    after_names = set(after_teams.keys())

    # Calculate differences
    added = list(after_names - before_names)
    removed = list(before_names - after_names)
    common = before_names & after_names

    # Check for position and type changes in common teams
    moved = []
    type_changed = []

    for name in common:
        before_team = before_teams[name]
        after_team = after_teams[name]

        # Check position change (consider significant if moved >10 pixels)
        before_pos = before_team.position or {"x": 0, "y": 0}
        after_pos = after_team.position or {"x": 0, "y": 0}

        dx = abs(before_pos.get("x", 0) - after_pos.get("x", 0))
        dy = abs(before_pos.get("y", 0) - after_pos.get("y", 0))

        if dx > 10 or dy > 10:
            moved.append({
                "name": name,
                "before": before_pos,
                "after": after_pos
            })

        # Check type change
        if before_team.team_type != after_team.team_type:
            type_changed.append({
                "name": name,
                "before": before_team.team_type,
                "after": after_team.team_type
            })

    return {
        "before_snapshot": {
            "id": before.snapshot_id,
            "name": before.name,
            "created_at": before.created_at.isoformat(),
            "total_teams": before.statistics.total_teams
        },
        "after_snapshot": {
            "id": after.snapshot_id,
            "name": after.name,
            "created_at": after.created_at.isoformat(),
            "total_teams": after.statistics.total_teams
        },
        "changes": {
            "added_teams": sorted(added),
            "removed_teams": sorted(removed),
            "moved_teams": moved,
            "type_changed_teams": type_changed,
            "summary": {
                "added_count": len(added),
                "removed_count": len(removed),
                "moved_count": len(moved),
                "type_changed_count": len(type_changed)
            }
        }
    }
