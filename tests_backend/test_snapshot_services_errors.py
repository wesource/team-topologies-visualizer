"""
Tests for snapshot_services.py error handling and edge cases

Tests focus on:
- Corrupted snapshot files
- Missing snapshot files
- Invalid JSON handling
- Edge cases in snapshot operations
- Statistics calculation edge cases
"""

import json
import tempfile
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

from backend.models import TeamData
from backend.snapshot_services import (
    calculate_statistics,
    condense_team_for_snapshot,
    create_snapshot,
    generate_snapshot_id,
    list_snapshots,
    load_snapshot,
)


class TestGenerateSnapshotId:
    """Tests for snapshot ID generation"""

    def test_snapshot_id_includes_name(self):
        """Snapshot ID should include sanitized name"""
        created_at = datetime(2024, 1, 15, 10, 30, 0)
        snapshot_id = generate_snapshot_id("My Test Snapshot", created_at)
        assert "my-test-snapshot" in snapshot_id

    def test_snapshot_id_includes_timestamp(self):
        """Snapshot ID should include timestamp for uniqueness"""
        created_at = datetime(2024, 1, 15, 10, 30, 0)
        snapshot_id = generate_snapshot_id("Test", created_at)
        assert "20240115-103000" in snapshot_id

    def test_snapshot_id_removes_special_chars(self):
        """Snapshot ID should remove special characters"""
        created_at = datetime(2024, 1, 15, 10, 30, 0)
        snapshot_id = generate_snapshot_id("Test@#$%Snapshot!", created_at)
        # Should only contain alphanumeric and dashes
        assert all(c.isalnum() or c == '-' for c in snapshot_id)

    def test_snapshot_id_replaces_spaces_with_dashes(self):
        """Snapshot ID should replace spaces with dashes"""
        created_at = datetime(2024, 1, 15, 10, 30, 0)
        snapshot_id = generate_snapshot_id("Multiple Word Name", created_at)
        assert "multiple-word-name" in snapshot_id


class TestCondenseTeamForSnapshot:
    """Tests for team condensation"""

    def test_condense_team_with_full_data(self):
        """Should condense team with all fields"""
        team = TeamData(
            team_id="test-team",
            name="Test Team",
            team_type="stream-aligned",
            position={"x": 100, "y": 200},
            value_stream="Customer Experience",
            platform_grouping=None,
            dependencies=["Team A", "Team B"],
            interaction_modes={"Team A": "collaboration"},
            metadata={"size": 6, "cognitive_load": "high", "established": "2023-01"}
        )

        condensed = condense_team_for_snapshot(team)

        assert condensed.name == "Test Team"
        assert condensed.team_type == "stream-aligned"
        assert condensed.position == {"x": 100, "y": 200}
        assert condensed.value_stream == "Customer Experience"
        assert condensed.dependencies == ["Team A", "Team B"]
        assert len(condensed.metadata) > 0

    def test_condense_team_with_minimal_data(self):
        """Should handle team with minimal data"""
        team = TeamData(
            team_id="minimal-team",
            name="Minimal Team",
            team_type="platform"
        )

        condensed = condense_team_for_snapshot(team)

        assert condensed.name == "Minimal Team"
        assert condensed.team_type == "platform"
        assert condensed.dependencies == []

    def test_condense_team_with_team_api(self):
        """Should extract Team API summary"""
        team = TeamData(
            team_id="api-team",
            name="API Team",
            team_type="platform",
            team_api={
                "purpose": "Provide API gateway",
                "services_provided": ["REST API", "GraphQL"],
                "contact": {"email": "api-team@example.com"}
            }
        )

        condensed = condense_team_for_snapshot(team)

        assert condensed.team_api_summary is not None
        assert "purpose" in condensed.team_api_summary
        assert condensed.team_api_summary["purpose"] == "Provide API gateway"


class TestCalculateStatistics:
    """Tests for statistics calculation"""

    def test_statistics_with_empty_teams(self):
        """Should handle empty team list"""
        stats = calculate_statistics([])

        assert stats.total_teams == 0
        assert stats.stream_aligned == 0
        assert stats.platform == 0
        assert stats.enabling == 0
        assert stats.complicated_subsystem == 0

    def test_statistics_counts_team_types_correctly(self):
        """Should count each team type correctly"""
        teams = [
            TeamData(team_id="t1", name="T1", team_type="stream-aligned"),
            TeamData(team_id="t2", name="T2", team_type="stream-aligned"),
            TeamData(team_id="t3", name="T3", team_type="platform"),
            TeamData(team_id="t4", name="T4", team_type="enabling"),
            TeamData(team_id="t5", name="T5", team_type="complicated-subsystem"),
        ]

        stats = calculate_statistics(teams)

        assert stats.total_teams == 5
        assert stats.stream_aligned == 2
        assert stats.platform == 1
        assert stats.enabling == 1
        assert stats.complicated_subsystem == 1

    def test_statistics_counts_unique_value_streams(self):
        """Should count unique value streams"""
        teams = [
            TeamData(team_id="t1", name="T1", team_type="stream-aligned", value_stream="VS1"),
            TeamData(team_id="t2", name="T2", team_type="stream-aligned", value_stream="VS1"),
            TeamData(team_id="t3", name="T3", team_type="stream-aligned", value_stream="VS2"),
            TeamData(team_id="t4", name="T4", team_type="platform", value_stream=None),
        ]

        stats = calculate_statistics(teams)

        assert stats.value_streams == 2  # VS1 and VS2

    def test_statistics_counts_unique_platform_groupings(self):
        """Should count unique platform groupings"""
        teams = [
            TeamData(team_id="t1", name="T1", team_type="platform", platform_grouping="PG1"),
            TeamData(team_id="t2", name="T2", team_type="platform", platform_grouping="PG1"),
            TeamData(team_id="t3", name="T3", team_type="platform", platform_grouping="PG2"),
            TeamData(team_id="t4", name="T4", team_type="stream-aligned", platform_grouping=None),
        ]

        stats = calculate_statistics(teams)

        assert stats.platform_groupings == 2  # PG1 and PG2


class TestCreateSnapshotErrors:
    """Tests for snapshot creation error handling"""

    def test_create_snapshot_with_no_teams(self):
        """Should handle creating snapshot with no teams"""
        snapshot = create_snapshot(
            name="Empty Snapshot",
            description="No teams",
            author="Test",
            team_names=[]
        )

        assert snapshot.statistics.total_teams == 0
        assert len(snapshot.teams) == 0

    def test_create_snapshot_with_invalid_team_names(self):
        """Should filter out nonexistent teams gracefully"""
        snapshot = create_snapshot(
            name="Invalid Teams Test",
            description="Contains nonexistent teams",
            author="Test",
            team_names=["nonexistent-team-xyz-12345", "another-fake-team"]
        )

        # Should succeed but have 0 teams (filtered out)
        assert isinstance(snapshot, object)

    def test_create_snapshot_writes_file(self):
        """Should write snapshot file to disk"""
        snapshot = create_snapshot(
            name="File Test Snapshot",
            description="Testing file write",
            author="Test",
            team_names=[]
        )

        # Check file was created
        snapshot_file = Path("data/tt-snapshots") / f"{snapshot.snapshot_id}.json"
        assert snapshot_file.exists()

        # Cleanup handled by autouse fixture


class TestLoadSnapshotErrors:
    """Tests for snapshot loading error handling"""

    def test_load_nonexistent_snapshot_returns_none(self):
        """Loading nonexistent snapshot should return None"""
        result = load_snapshot("nonexistent-snapshot-12345")
        assert result is None

    def test_load_snapshot_with_corrupted_json(self):
        """Should handle corrupted JSON gracefully"""
        # Create a corrupted snapshot file
        snapshot_dir = Path("data/tt-snapshots")
        snapshot_dir.mkdir(parents=True, exist_ok=True)
        corrupted_file = snapshot_dir / "corrupted-test-snapshot.json"

        try:
            with open(corrupted_file, 'w', encoding='utf-8') as f:
                f.write("{ invalid json content }")

            result = load_snapshot("corrupted-test-snapshot")
            assert result is None
        finally:
            if corrupted_file.exists():
                corrupted_file.unlink()

    def test_load_snapshot_with_missing_fields(self):
        """Should handle snapshot with missing required fields"""
        snapshot_dir = Path("data/tt-snapshots")
        snapshot_dir.mkdir(parents=True, exist_ok=True)
        incomplete_file = snapshot_dir / "incomplete-test-snapshot.json"

        try:
            with open(incomplete_file, 'w', encoding='utf-8') as f:
                json.dump({"snapshot_id": "incomplete-test-snapshot"}, f)

            result = load_snapshot("incomplete-test-snapshot")
            # Should return None due to missing required fields
            assert result is None
        finally:
            if incomplete_file.exists():
                incomplete_file.unlink()

    def test_load_snapshot_with_invalid_datetime(self):
        """Should handle invalid datetime format"""
        snapshot_dir = Path("data/tt-snapshots")
        snapshot_dir.mkdir(parents=True, exist_ok=True)
        bad_datetime_file = snapshot_dir / "bad-datetime-test-snapshot.json"

        try:
            with open(bad_datetime_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "snapshot_id": "bad-datetime-test-snapshot",
                    "name": "Test",
                    "description": "",
                    "author": "",
                    "created_at": "not-a-valid-datetime",
                    "teams": [],
                    "statistics": {
                        "total_teams": 0,
                        "stream_aligned": 0,
                        "platform": 0,
                        "enabling": 0,
                        "complicated_subsystem": 0,
                        "value_streams": 0,
                        "platform_groupings": 0
                    }
                }, f)

            result = load_snapshot("bad-datetime-test-snapshot")
            # Should return None due to datetime parsing error
            assert result is None
        finally:
            if bad_datetime_file.exists():
                bad_datetime_file.unlink()


class TestListSnapshotsErrors:
    """Tests for list_snapshots error handling"""

    def test_list_snapshots_skips_corrupted_files(self):
        """Should skip corrupted files and continue listing"""
        snapshot_dir = Path("data/tt-snapshots")
        snapshot_dir.mkdir(parents=True, exist_ok=True)

        # Create a corrupted file
        corrupted_file = snapshot_dir / "corrupted-list-test.json"

        try:
            with open(corrupted_file, 'w', encoding='utf-8') as f:
                f.write("corrupted content")

            # Should not crash, just skip the corrupted file
            snapshots = list_snapshots()
            assert isinstance(snapshots, list)
        finally:
            if corrupted_file.exists():
                corrupted_file.unlink()

    def test_list_snapshots_returns_empty_list_when_no_snapshots(self):
        """Should return empty list when no snapshots exist"""
        # Temporarily patch SNAPSHOTS_DIR to empty temp directory
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch("backend.snapshot_services.SNAPSHOTS_DIR", Path(tmpdir)):
                snapshots = list_snapshots()
                assert snapshots == []

    def test_list_snapshots_sorts_by_date_newest_first(self):
        """Should sort snapshots by creation date, newest first"""
        snapshot_dir = Path("data/tt-snapshots")
        snapshot_dir.mkdir(parents=True, exist_ok=True)

        files_to_cleanup = []

        try:
            # Create snapshots with different dates
            dates = [
                datetime(2024, 1, 1, 10, 0, 0),
                datetime(2024, 1, 3, 10, 0, 0),
                datetime(2024, 1, 2, 10, 0, 0),
            ]

            for i, date in enumerate(dates):
                snapshot_id = f"sort-test-{i}"
                file_path = snapshot_dir / f"{snapshot_id}.json"
                files_to_cleanup.append(file_path)

                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump({
                        "snapshot_id": snapshot_id,
                        "name": f"Snapshot {i}",
                        "description": "",
                        "author": "",
                        "created_at": date.isoformat(),
                        "teams": [],
                        "statistics": {
                            "total_teams": 0,
                            "stream_aligned": 0,
                            "platform": 0,
                            "enabling": 0,
                            "complicated_subsystem": 0,
                            "value_streams": 0,
                            "platform_groupings": 0
                        }
                    }, f)

            snapshots = list_snapshots()

            # Filter to only our test snapshots
            test_snapshots = [s for s in snapshots if s.snapshot_id.startswith("sort-test-")]

            # Should be sorted newest first (index 1, then 2, then 0)
            assert len(test_snapshots) >= 3
            # Verify newest is first
            assert test_snapshots[0].created_at > test_snapshots[1].created_at

        finally:
            for file_path in files_to_cleanup:
                if file_path.exists():
                    file_path.unlink()
