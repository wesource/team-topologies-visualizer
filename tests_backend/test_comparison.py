"""Comprehensive tests for comparison.py"""
from datetime import datetime

import pytest

from backend.comparison import compare_snapshots
from backend.models import Snapshot, SnapshotStatistics, SnapshotTeamCondensed


def create_test_team(
    name: str,
    team_type: str = "stream-aligned",
    position: dict | None = None,
    value_stream: str | None = None
) -> SnapshotTeamCondensed:
    """Helper to create a test team for snapshots"""
    return SnapshotTeamCondensed(
        name=name,
        team_type=team_type,
        position=position or {"x": 0, "y": 0},
        value_stream=value_stream,
        dependencies=[],
        interaction_modes={},
        metadata={}
    )


def create_test_snapshot(
    snapshot_id: str,
    name: str,
    teams: list[SnapshotTeamCondensed],
    created_at: datetime | None = None
) -> Snapshot:
    """Helper to create a test snapshot"""
    if created_at is None:
        created_at = datetime(2026, 1, 1, 12, 0, 0)
    
    # Calculate statistics
    team_type_counts = {}
    for team in teams:
        if team.team_type == "stream-aligned":
            team_type_counts["stream_aligned"] = team_type_counts.get("stream_aligned", 0) + 1
        elif team.team_type == "complicated-subsystem":
            team_type_counts["complicated_subsystem"] = team_type_counts.get("complicated_subsystem", 0) + 1
        else:
            team_type_counts[team.team_type] = team_type_counts.get(team.team_type, 0) + 1
    
    value_stream_set = set()
    platform_grouping_set = set()
    for team in teams:
        if team.value_stream:
            value_stream_set.add(team.value_stream)
        if team.platform_grouping:
            platform_grouping_set.add(team.platform_grouping)
    
    statistics = SnapshotStatistics(
        total_teams=len(teams),
        stream_aligned=team_type_counts.get("stream_aligned", 0),
        platform=team_type_counts.get("platform", 0),
        enabling=team_type_counts.get("enabling", 0),
        complicated_subsystem=team_type_counts.get("complicated_subsystem", 0),
        value_streams=len(value_stream_set),
        platform_groupings=len(platform_grouping_set)
    )
    
    return Snapshot(
        snapshot_id=snapshot_id,
        name=name,
        created_at=created_at,
        teams=teams,
        statistics=statistics
    )


class TestCompareSnapshots:
    """Test compare_snapshots function"""

    def test_identical_snapshots(self):
        """Should return no changes when snapshots are identical"""
        teams = [
            create_test_team("Team A", position={"x": 100, "y": 100}),
            create_test_team("Team B", position={"x": 200, "y": 200})
        ]
        
        before = create_test_snapshot("before", "Before", teams)
        after = create_test_snapshot("after", "After", teams)
        
        result = compare_snapshots(before, after)
        
        assert result["changes"]["added_teams"] == []
        assert result["changes"]["removed_teams"] == []
        assert result["changes"]["moved_teams"] == []
        assert result["changes"]["type_changed_teams"] == []
        assert result["changes"]["summary"]["added_count"] == 0
        assert result["changes"]["summary"]["removed_count"] == 0
        assert result["changes"]["summary"]["moved_count"] == 0
        assert result["changes"]["summary"]["type_changed_count"] == 0

    def test_added_teams(self):
        """Should detect newly added teams"""
        before_teams = [
            create_test_team("Team A")
        ]
        
        after_teams = [
            create_test_team("Team A"),
            create_test_team("Team B"),
            create_test_team("Team C")
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        assert sorted(result["changes"]["added_teams"]) == ["Team B", "Team C"]
        assert result["changes"]["summary"]["added_count"] == 2

    def test_removed_teams(self):
        """Should detect removed teams"""
        before_teams = [
            create_test_team("Team A"),
            create_test_team("Team B"),
            create_test_team("Team C")
        ]
        
        after_teams = [
            create_test_team("Team A")
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        assert sorted(result["changes"]["removed_teams"]) == ["Team B", "Team C"]
        assert result["changes"]["summary"]["removed_count"] == 2

    def test_moved_teams_significant_distance(self):
        """Should detect teams that moved more than 10 pixels"""
        before_teams = [
            create_test_team("Team A", position={"x": 100, "y": 100}),
            create_test_team("Team B", position={"x": 200, "y": 200})
        ]
        
        after_teams = [
            create_test_team("Team A", position={"x": 150, "y": 150}),  # Moved 50 pixels
            create_test_team("Team B", position={"x": 200, "y": 215})   # Moved 15 pixels (y only)
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        assert len(result["changes"]["moved_teams"]) == 2
        assert result["changes"]["summary"]["moved_count"] == 2
        
        # Check Team A movement
        team_a_move = next(m for m in result["changes"]["moved_teams"] if m["name"] == "Team A")
        assert team_a_move["before"] == {"x": 100, "y": 100}
        assert team_a_move["after"] == {"x": 150, "y": 150}
        
        # Check Team B movement
        team_b_move = next(m for m in result["changes"]["moved_teams"] if m["name"] == "Team B")
        assert team_b_move["before"] == {"x": 200, "y": 200}
        assert team_b_move["after"] == {"x": 200, "y": 215}

    def test_moved_teams_insignificant_distance(self):
        """Should NOT detect teams that moved less than 10 pixels"""
        before_teams = [
            create_test_team("Team A", position={"x": 100, "y": 100})
        ]
        
        after_teams = [
            create_test_team("Team A", position={"x": 105, "y": 105})  # Moved only 5 pixels
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        assert result["changes"]["moved_teams"] == []
        assert result["changes"]["summary"]["moved_count"] == 0

    def test_moved_teams_exactly_10_pixels(self):
        """Should NOT detect teams that moved exactly 10 pixels (boundary condition)"""
        before_teams = [
            create_test_team("Team A", position={"x": 100, "y": 100})
        ]
        
        after_teams = [
            create_test_team("Team A", position={"x": 110, "y": 100})  # Moved exactly 10 pixels
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        assert result["changes"]["moved_teams"] == []
        assert result["changes"]["summary"]["moved_count"] == 0

    def test_moved_teams_11_pixels(self):
        """Should detect teams that moved 11 pixels (just over threshold)"""
        before_teams = [
            create_test_team("Team A", position={"x": 100, "y": 100})
        ]
        
        after_teams = [
            create_test_team("Team A", position={"x": 111, "y": 100})  # Moved 11 pixels
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        assert len(result["changes"]["moved_teams"]) == 1
        assert result["changes"]["summary"]["moved_count"] == 1

    def test_type_changed_teams(self):
        """Should detect teams that changed type"""
        before_teams = [
            create_test_team("Team A", team_type="stream-aligned"),
            create_test_team("Team B", team_type="enabling"),
            create_test_team("Team C", team_type="platform")
        ]
        
        after_teams = [
            create_test_team("Team A", team_type="platform"),  # Changed type
            create_test_team("Team B", team_type="enabling"),  # No change
            create_test_team("Team C", team_type="complicated-subsystem")  # Changed type
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        assert len(result["changes"]["type_changed_teams"]) == 2
        assert result["changes"]["summary"]["type_changed_count"] == 2
        
        # Check Team A type change
        team_a_change = next(c for c in result["changes"]["type_changed_teams"] if c["name"] == "Team A")
        assert team_a_change["before"] == "stream-aligned"
        assert team_a_change["after"] == "platform"
        
        # Check Team C type change
        team_c_change = next(c for c in result["changes"]["type_changed_teams"] if c["name"] == "Team C")
        assert team_c_change["before"] == "platform"
        assert team_c_change["after"] == "complicated-subsystem"

    def test_multiple_changes_same_team(self):
        """Should detect when a team has both moved and changed type"""
        before_teams = [
            create_test_team("Team A", team_type="stream-aligned", position={"x": 100, "y": 100})
        ]
        
        after_teams = [
            create_test_team("Team A", team_type="platform", position={"x": 200, "y": 200})
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        assert len(result["changes"]["moved_teams"]) == 1
        assert len(result["changes"]["type_changed_teams"]) == 1
        assert result["changes"]["summary"]["moved_count"] == 1
        assert result["changes"]["summary"]["type_changed_count"] == 1

    def test_snapshot_metadata_in_result(self):
        """Should include snapshot metadata in result"""
        before_time = datetime(2025, 12, 1, 10, 0, 0)
        after_time = datetime(2026, 1, 1, 12, 0, 0)
        
        before_teams = [create_test_team("Team A")]
        after_teams = [create_test_team("Team A"), create_test_team("Team B")]
        
        before = create_test_snapshot("snapshot-q4-2025", "Q4 2025", before_teams, before_time)
        after = create_test_snapshot("snapshot-q1-2026", "Q1 2026", after_teams, after_time)
        
        result = compare_snapshots(before, after)
        
        assert result["before_snapshot"]["id"] == "snapshot-q4-2025"
        assert result["before_snapshot"]["name"] == "Q4 2025"
        assert result["before_snapshot"]["created_at"] == "2025-12-01T10:00:00"
        assert result["before_snapshot"]["total_teams"] == 1
        
        assert result["after_snapshot"]["id"] == "snapshot-q1-2026"
        assert result["after_snapshot"]["name"] == "Q1 2026"
        assert result["after_snapshot"]["created_at"] == "2026-01-01T12:00:00"
        assert result["after_snapshot"]["total_teams"] == 2

    def test_teams_with_none_positions(self):
        """Should handle teams with None positions gracefully"""
        before_teams = [
            create_test_team("Team A", position=None)
        ]
        
        after_teams = [
            create_test_team("Team A", position={"x": 100, "y": 100})
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        # Should detect as moved (from 0,0 default to 100,100)
        assert len(result["changes"]["moved_teams"]) == 1
        assert result["changes"]["moved_teams"][0]["before"] == {"x": 0, "y": 0}
        assert result["changes"]["moved_teams"][0]["after"] == {"x": 100, "y": 100}

    def test_teams_with_missing_x_coordinate(self):
        """Should handle teams with missing x coordinate (defaults to 0)"""
        before_teams = [
            create_test_team("Team A", position={"y": 100})
        ]
        
        after_teams = [
            create_test_team("Team A", position={"x": 50, "y": 100})
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        # Should detect as moved (x changed from 0 to 50)
        assert len(result["changes"]["moved_teams"]) == 1

    def test_teams_with_missing_y_coordinate(self):
        """Should handle teams with missing y coordinate (defaults to 0)"""
        before_teams = [
            create_test_team("Team A", position={"x": 100})
        ]
        
        after_teams = [
            create_test_team("Team A", position={"x": 100, "y": 50})
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        # Should detect as moved (y changed from 0 to 50)
        assert len(result["changes"]["moved_teams"]) == 1

    def test_complex_scenario_all_change_types(self):
        """Should handle complex scenario with all types of changes"""
        before_teams = [
            create_test_team("Team A", team_type="stream-aligned", position={"x": 100, "y": 100}),
            create_test_team("Team B", team_type="platform", position={"x": 200, "y": 200}),
            create_test_team("Team C", team_type="enabling", position={"x": 300, "y": 300}),
            create_test_team("Team D", team_type="stream-aligned", position={"x": 400, "y": 400})
        ]
        
        after_teams = [
            create_test_team("Team A", team_type="platform", position={"x": 150, "y": 150}),  # Type changed + moved
            create_test_team("Team B", team_type="platform", position={"x": 200, "y": 200}),  # No change
            # Team C removed
            create_test_team("Team E", team_type="stream-aligned", position={"x": 500, "y": 500}),  # Added
            create_test_team("Team F", team_type="complicated-subsystem", position={"x": 600, "y": 600})  # Added
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        # Check added teams
        assert sorted(result["changes"]["added_teams"]) == ["Team E", "Team F"]
        assert result["changes"]["summary"]["added_count"] == 2
        
        # Check removed teams
        assert sorted(result["changes"]["removed_teams"]) == ["Team C", "Team D"]
        assert result["changes"]["summary"]["removed_count"] == 2
        
        # Check moved teams (Team A moved)
        assert len(result["changes"]["moved_teams"]) == 1
        assert result["changes"]["moved_teams"][0]["name"] == "Team A"
        assert result["changes"]["summary"]["moved_count"] == 1
        
        # Check type changed teams (Team A changed type)
        assert len(result["changes"]["type_changed_teams"]) == 1
        assert result["changes"]["type_changed_teams"][0]["name"] == "Team A"
        assert result["changes"]["type_changed_teams"][0]["before"] == "stream-aligned"
        assert result["changes"]["type_changed_teams"][0]["after"] == "platform"
        assert result["changes"]["summary"]["type_changed_count"] == 1

    def test_empty_snapshots(self):
        """Should handle comparison of empty snapshots"""
        before = create_test_snapshot("before", "Before", [])
        after = create_test_snapshot("after", "After", [])
        
        result = compare_snapshots(before, after)
        
        assert result["changes"]["added_teams"] == []
        assert result["changes"]["removed_teams"] == []
        assert result["changes"]["moved_teams"] == []
        assert result["changes"]["type_changed_teams"] == []
        assert result["changes"]["summary"]["added_count"] == 0
        assert result["changes"]["summary"]["removed_count"] == 0
        assert result["changes"]["summary"]["moved_count"] == 0
        assert result["changes"]["summary"]["type_changed_count"] == 0

    def test_before_empty_after_populated(self):
        """Should handle comparison when before snapshot is empty"""
        before = create_test_snapshot("before", "Before", [])
        after_teams = [
            create_test_team("Team A"),
            create_test_team("Team B")
        ]
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        assert sorted(result["changes"]["added_teams"]) == ["Team A", "Team B"]
        assert result["changes"]["removed_teams"] == []
        assert result["changes"]["summary"]["added_count"] == 2
        assert result["changes"]["summary"]["removed_count"] == 0

    def test_before_populated_after_empty(self):
        """Should handle comparison when after snapshot is empty"""
        before_teams = [
            create_test_team("Team A"),
            create_test_team("Team B")
        ]
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", [])
        
        result = compare_snapshots(before, after)
        
        assert result["changes"]["added_teams"] == []
        assert sorted(result["changes"]["removed_teams"]) == ["Team A", "Team B"]
        assert result["changes"]["summary"]["added_count"] == 0
        assert result["changes"]["summary"]["removed_count"] == 2

    def test_negative_position_coordinates(self):
        """Should handle negative position coordinates correctly"""
        before_teams = [
            create_test_team("Team A", position={"x": -100, "y": -100})
        ]
        
        after_teams = [
            create_test_team("Team A", position={"x": -50, "y": -50})
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        # Should detect as moved (50 pixels in both directions)
        assert len(result["changes"]["moved_teams"]) == 1
        assert result["changes"]["moved_teams"][0]["before"] == {"x": -100, "y": -100}
        assert result["changes"]["moved_teams"][0]["after"] == {"x": -50, "y": -50}

    def test_large_position_coordinates(self):
        """Should handle very large position coordinates"""
        before_teams = [
            create_test_team("Team A", position={"x": 10000, "y": 10000})
        ]
        
        after_teams = [
            create_test_team("Team A", position={"x": 10100, "y": 10100})
        ]
        
        before = create_test_snapshot("before", "Before", before_teams)
        after = create_test_snapshot("after", "After", after_teams)
        
        result = compare_snapshots(before, after)
        
        # Should detect as moved (100 pixels in both directions)
        assert len(result["changes"]["moved_teams"]) == 1
