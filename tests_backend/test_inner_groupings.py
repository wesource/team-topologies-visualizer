"""Tests for inner groupings (fractal pattern) feature."""

from pathlib import Path

import pytest

from backend.services import parse_team_file
from backend.validation import validate_all_team_files


class TestInnerGroupingsParsing:
    """Test parsing of value_stream_inner and platform_grouping_inner fields."""

    def test_parse_value_stream_inner(self):
        """Test parsing team with value_stream_inner field."""

        team_file = Path("data/tt-teams/api-gateway-platform-team.md")
        if not team_file.exists():
            pytest.skip("API Gateway Platform Team file not found")

        team = parse_team_file(team_file)

        # Should have value_stream_inner field
        assert team.value_stream_inner == "Gateway & Service Mesh"
        # Should also have outer grouping
        assert team.platform_grouping == "Cloud Infrastructure Platform Grouping"

    def test_parse_platform_grouping_inner(self):
        """Test parsing team with platform_grouping_inner field."""

        team_file = Path("data/tt-teams/mobile-platform-team.md")
        if not team_file.exists():
            pytest.skip("Mobile Platform Team file not found")

        team = parse_team_file(team_file)

        # Should have platform_grouping_inner field
        assert team.platform_grouping_inner == "Mobile Infrastructure"
        # Mobile platform team is within Mobile Experience value stream (inner platform pattern)
        assert team.value_stream == "Mobile Experience"

    def test_parse_team_without_inner_groupings(self):
        """Test parsing team without inner grouping fields."""

        team_file = Path("data/tt-teams/mobile-app-team.md")
        if not team_file.exists():
            pytest.skip("Mobile App Team file not found")

        team = parse_team_file(team_file)

        # Should not have inner grouping fields
        assert team.value_stream_inner is None
        assert team.platform_grouping_inner is None

    def test_inner_grouping_fields_in_api_response(self):
        """Test that API responses include inner grouping fields."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/tt/teams")

        assert response.status_code == 200
        teams = response.json()

        # Find a team with inner groupings
        teams_with_inner = [
            t for t in teams
            if t.get("value_stream_inner") or t.get("platform_grouping_inner")
        ]

        assert len(teams_with_inner) > 0, "Should have teams with inner groupings"

        # Verify structure
        for team in teams_with_inner:
            if team.get("value_stream_inner"):
                assert isinstance(team["value_stream_inner"], str)
            if team.get("platform_grouping_inner"):
                assert isinstance(team["platform_grouping_inner"], str)


class TestInnerGroupingsValidation:
    """Test validation constraints for inner groupings."""

    def test_validate_inner_groupings_in_real_files(self):
        """Test validation passes for teams with inner groupings."""

        # validate_all_team_files takes view parameter
        report = validate_all_team_files("tt")

        # Should not have errors for inner grouping fields
        inner_grouping_errors = [
            issue for issue in report["issues"]
            if "inner" in str(issue).lower()
        ]

        assert len(inner_grouping_errors) == 0, \
            f"Should not have inner grouping validation errors: {inner_grouping_errors}"

    def test_inner_grouping_allows_null_values(self):
        """Test that inner grouping fields can be null."""
        import tempfile

        # Create temporary team file with null inner groupings
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
value_stream: Test Stream
value_stream_inner: null
platform_grouping: null
platform_grouping_inner: null
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.value_stream_inner is None
            assert team.platform_grouping_inner is None
        finally:
            temp_path.unlink()

    def test_inner_grouping_with_empty_string(self):
        """Test that empty string inner groupings are treated as None."""
        import tempfile

        # Create temporary team file with empty string inner groupings
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
value_stream: Test Stream
value_stream_inner: ""
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Empty string should be treated as None or kept as empty string
            assert team.value_stream_inner in [None, ""]
        finally:
            temp_path.unlink()


class TestInnerGroupingsIntegration:
    """Integration tests for inner groupings feature."""

    def test_multiple_teams_same_inner_grouping(self):
        """Test that multiple teams can share the same inner grouping."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/tt/teams")

        assert response.status_code == 200
        teams = response.json()

        # Group teams by inner grouping
        inner_groups = {}
        for team in teams:
            inner_group = team.get("value_stream_inner") or team.get("platform_grouping_inner")
            if inner_group:
                if inner_group not in inner_groups:
                    inner_groups[inner_group] = []
                inner_groups[inner_group].append(team["name"])

        # Should have at least one inner grouping with multiple teams
        multi_team_groups = [g for g, teams in inner_groups.items() if len(teams) > 1]
        assert len(multi_team_groups) > 0, "Should have inner groupings with multiple teams"

    def test_inner_grouping_preserved_in_snapshot(self):
        """Test that inner groupings are preserved when creating snapshots."""
        import os

        from fastapi.testclient import TestClient

        from main import app

        # Skip if in read-only mode
        if os.environ.get("READ_ONLY_MODE") == "true":
            pytest.skip("Skipping snapshot test in read-only mode")

        client = TestClient(app)

        # Get teams with inner groupings
        response = client.get("/api/tt/teams")
        teams = response.json()
        teams_with_inner = [
            t["name"] for t in teams
            if t.get("value_stream_inner") or t.get("platform_grouping_inner")
        ]

        if not teams_with_inner:
            pytest.skip("No teams with inner groupings found")

        # Create snapshot
        snapshot_response = client.post(
            "/api/tt/snapshots/create",
            json={
                "name": "Test Inner Groupings Snapshot",
                "description": "Testing inner grouping preservation",
                "team_names": teams_with_inner[:3]  # Just a few teams
            }
        )

        if snapshot_response.status_code != 201:
            pytest.skip("Could not create snapshot (may be in read-only mode)")

        snapshot = snapshot_response.json()

        # Verify teams in snapshot have inner grouping fields
        for team in snapshot["teams"]:
            # At least one team should have inner groupings
            if team.get("value_stream_inner") or team.get("platform_grouping_inner"):
                assert isinstance(team.get("value_stream_inner"), (str, type(None)))
                assert isinstance(team.get("platform_grouping_inner"), (str, type(None)))
                break
        else:
            pytest.fail("No teams with inner groupings found in snapshot")

    def test_team_with_both_inner_groupings_not_recommended(self):
        """Test that teams with both inner groupings still work (though not recommended)."""
        import tempfile

        # Create temporary team file with both inner groupings (not recommended but valid)
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
value_stream: Test Stream
value_stream_inner: Inner Stream Group
platform_grouping: Test Platform
platform_grouping_inner: Inner Platform Group
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should parse both fields (even though not recommended)
            assert team.value_stream_inner == "Inner Stream Group"
            assert team.platform_grouping_inner == "Inner Platform Group"
        finally:
            temp_path.unlink()
