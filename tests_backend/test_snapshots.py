"""Tests for snapshot functionality"""
import json
from datetime import datetime

import pytest

from backend.models import SnapshotMetadata, TeamData
from backend.snapshot_services import (
    SNAPSHOTS_DIR,
    calculate_statistics,
    condense_team_for_snapshot,
    create_snapshot,
    generate_snapshot_id,
    list_snapshots,
    load_snapshot,
)


# Cleanup fixture
@pytest.fixture(autouse=True)
def cleanup_snapshots():
    """Clean up test snapshots before and after each test"""
    yield
    # Clean up after test - catch all test-generated snapshots
    # Patterns: test-*, empty-snapshot-*, invalid-teams-test-*, file-test-snapshot-*, -YYYYMMDD-*.json (empty name)
    patterns = ["test-*.json", "empty-snapshot-*.json", "invalid-teams-*.json",
                "file-test-*.json", "-2*.json"]  # Last pattern catches empty name snapshots like "-20260110-*.json"
    for pattern in patterns:
        for snapshot_file in SNAPSHOTS_DIR.glob(pattern):
            snapshot_file.unlink()


def test_generate_snapshot_id():
    """Test snapshot ID generation"""
    name = "Test Snapshot v1.0"
    created_at = datetime(2026, 1, 15, 10, 30, 0)

    snapshot_id = generate_snapshot_id(name, created_at)

    assert snapshot_id.startswith("test-snapshot-v10-")
    assert "20260115" in snapshot_id
    assert "103000" in snapshot_id


def test_condense_team_for_snapshot():
    """Test team data condensation for snapshots"""
    team = TeamData(
        name="Test Team",
        team_type="stream-aligned",
        position={"x": 100.0, "y": 200.0},
        value_stream="E-commerce",
        dependencies=["Platform Team"],
        interaction_modes={"Platform Team": "x-as-a-service"},
        metadata={"size": 7, "cognitive_load": "medium"},
        purpose="Own checkout experience"
    )

    condensed = condense_team_for_snapshot(team)

    assert condensed.name == "Test Team"
    assert condensed.team_type == "stream-aligned"
    assert condensed.position == {"x": 100.0, "y": 200.0}
    assert condensed.value_stream == "E-commerce"
    assert condensed.dependencies == ["Platform Team"]
    assert condensed.team_api_summary["purpose"] == "Own checkout experience"


def test_calculate_statistics():
    """Test statistics calculation"""
    teams = [
        TeamData(
            name="Team 1",
            team_type="stream-aligned",
            value_stream="VS1",
            position={"x": 0, "y": 0}
        ),
        TeamData(
            name="Team 2",
            team_type="platform",
            platform_grouping="PG1",
            position={"x": 0, "y": 0}
        ),
        TeamData(
            name="Team 3",
            team_type="stream-aligned",
            value_stream="VS1",
            position={"x": 0, "y": 0}
        ),
        TeamData(
            name="Team 4",
            team_type="enabling",
            position={"x": 0, "y": 0}
        ),
    ]

    stats = calculate_statistics(teams)

    assert stats.total_teams == 4
    assert stats.stream_aligned == 2
    assert stats.platform == 1
    assert stats.enabling == 1
    assert stats.complicated_subsystem == 0
    assert stats.value_streams == 1  # VS1 appears twice but counted once
    assert stats.platform_groupings == 1


def test_create_snapshot():
    """Test snapshot creation"""
    snapshot = create_snapshot(
        name="Test Snapshot",
        description="Test description",
        author="Test Author"
    )

    # Verify snapshot object
    assert snapshot.name == "Test Snapshot"
    assert snapshot.description == "Test description"
    assert snapshot.author == "Test Author"
    assert isinstance(snapshot.created_at, datetime)
    assert len(snapshot.teams) > 0  # Should have loaded teams from data/tt-teams
    assert snapshot.statistics.total_teams == len(snapshot.teams)

    # Verify file was created
    snapshot_file = SNAPSHOTS_DIR / f"{snapshot.snapshot_id}.json"
    assert snapshot_file.exists()

    # Verify file content
    with open(snapshot_file, encoding='utf-8') as f:
        data = json.load(f)

    assert data["name"] == "Test Snapshot"
    assert data["description"] == "Test description"
    assert data["author"] == "Test Author"
    assert "created_at" in data
    assert len(data["teams"]) > 0
    assert "statistics" in data


def test_list_snapshots():
    """Test listing snapshots"""
    # Create two test snapshots
    create_snapshot(name="Test Snapshot 1")
    create_snapshot(name="Test Snapshot 2")

    # List snapshots
    snapshots = list_snapshots()

    # Should have at least our 2 test snapshots
    test_snapshots = [s for s in snapshots if s.name.startswith("Test Snapshot")]
    assert len(test_snapshots) >= 2

    # Verify metadata
    assert all(isinstance(s, SnapshotMetadata) for s in snapshots)
    assert all(hasattr(s, 'snapshot_id') for s in snapshots)
    assert all(hasattr(s, 'name') for s in snapshots)
    assert all(hasattr(s, 'statistics') for s in snapshots)

    # Snapshots should be sorted by date (newest first)
    if len(snapshots) > 1:
        for i in range(len(snapshots) - 1):
            assert snapshots[i].created_at >= snapshots[i + 1].created_at


def test_load_snapshot():
    """Test loading a specific snapshot"""
    # Create a snapshot
    original = create_snapshot(
        name="Test Load Snapshot",
        description="Test load",
        author="Test"
    )

    # Load it back
    loaded = load_snapshot(original.snapshot_id)

    assert loaded is not None
    assert loaded.snapshot_id == original.snapshot_id
    assert loaded.name == original.name
    assert loaded.description == original.description
    assert loaded.author == original.author
    assert len(loaded.teams) == len(original.teams)
    assert loaded.statistics.total_teams == original.statistics.total_teams


def test_load_nonexistent_snapshot():
    """Test loading a snapshot that doesn't exist"""
    result = load_snapshot("nonexistent-snapshot-id")
    assert result is None


def test_snapshot_immutability():
    """Test that snapshots are immutable (read-only)"""
    # Create a snapshot
    snapshot = create_snapshot(name="Test Immutable Snapshot")
    snapshot_file = SNAPSHOTS_DIR / f"{snapshot.snapshot_id}.json"

    # Get file modified time
    original_mtime = snapshot_file.stat().st_mtime

    # Load the snapshot
    load_snapshot(snapshot.snapshot_id)

    # Verify file wasn't modified by loading
    new_mtime = snapshot_file.stat().st_mtime
    assert new_mtime == original_mtime


def test_snapshot_team_count_accuracy():
    """Test that snapshot captures correct number of teams"""
    from backend.services import find_all_teams

    # Get current live team count
    live_teams = find_all_teams(view="tt")

    # Create snapshot
    snapshot = create_snapshot(name="Test Team Count")

    # Verify counts match
    assert len(snapshot.teams) == len(live_teams)
    assert snapshot.statistics.total_teams == len(live_teams)


def test_snapshot_with_filtered_teams():
    """Test that snapshot can capture only specific teams (filtered view)"""
    from backend.services import find_all_teams

    # Get all teams
    all_teams = find_all_teams(view="tt")

    # Filter to first 3 teams
    filtered_team_names = [team.name for team in all_teams[:3]]

    # Create filtered snapshot
    snapshot = create_snapshot(
        name="Test Filtered Snapshot",
        team_names=filtered_team_names
    )

    # Verify only filtered teams are included
    assert len(snapshot.teams) == 3
    assert snapshot.statistics.total_teams == 3

    # Verify correct teams are captured
    snapshot_team_names = {team.name for team in snapshot.teams}
    assert snapshot_team_names == set(filtered_team_names)

    # Verify it's less than total teams
    assert len(snapshot.teams) < len(all_teams)
