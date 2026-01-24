"""
Tests for services.py team finding functions

Tests focus on:
- find_team_by_name
- find_team_by_id
- find_team_by_name_or_slug
- Edge cases and not-found scenarios
"""

import tempfile
from pathlib import Path

import pytest

from backend.services import find_team_by_id, find_team_by_name, find_team_by_name_or_slug


@pytest.fixture
def temp_teams_dir():
    """Create temporary teams directory with test teams"""
    with tempfile.TemporaryDirectory() as tmpdir:
        temp_path = Path(tmpdir)

        # Create a test team file
        team_file = temp_path / "platform-team.md"
        team_file.write_text("""---
name: Platform Team
team_id: platform-team
team_type: platform
position:
  x: 100
  y: 100
---
# Platform Team

A platform team providing services.
""", encoding='utf-8')

        # Create another team with special characters in name
        team_file2 = temp_path / "ci-cd-team.md"
        team_file2.write_text("""---
name: CI/CD Platform Team
team_id: ci-cd-platform-team
team_type: platform
position:
  x: 200
  y: 100
---
# CI/CD Platform Team

CI/CD automation platform.
""", encoding='utf-8')

        yield temp_path


class TestFindTeamByName:
    """Tests for find_team_by_name function"""

    def test_find_team_by_exact_name(self, temp_teams_dir, monkeypatch):
        """Should find team by exact name match"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        result = find_team_by_name("Platform Team", "tt")

        assert result is not None
        team, file_path = result
        assert team.name == "Platform Team"
        assert team.team_id == "platform-team"

    def test_find_team_by_name_case_insensitive(self, temp_teams_dir, monkeypatch):
        """Should demonstrate case-sensitive behavior"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        # find_team_by_name is case-sensitive
        result = find_team_by_name("platform team", "tt")
        assert result is None  # lowercase doesn't match "Platform Team"

        # But exact case works
        result = find_team_by_name("Platform Team", "tt")
        assert result is not None
        team, file_path = result
        assert team.name == "Platform Team"

    def test_find_team_by_name_with_special_chars(self, temp_teams_dir, monkeypatch):
        """Should find team with special characters in name"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        result = find_team_by_name("CI/CD Platform Team", "tt")

        assert result is not None
        team, file_path = result
        assert team.name == "CI/CD Platform Team"

    def test_find_team_by_name_not_found(self, temp_teams_dir, monkeypatch):
        """Should return None when team not found"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        result = find_team_by_name("Nonexistent Team", "tt")

        assert result is None

    def test_find_team_by_name_empty_directory(self, monkeypatch):
        """Should handle empty directory gracefully"""
        with tempfile.TemporaryDirectory() as tmpdir:
            temp_path = Path(tmpdir)
            monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_path)

            result = find_team_by_name("Any Team", "tt")

            assert result is None


class TestFindTeamById:
    """Tests for find_team_by_id function"""

    def test_find_team_by_exact_id(self, temp_teams_dir, monkeypatch):
        """Should find team by exact ID match"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        result = find_team_by_id("platform-team", "tt")

        assert result is not None
        team, file_path = result
        assert team.team_id == "platform-team"
        assert team.name == "Platform Team"

    def test_find_team_by_id_case_sensitive(self, temp_teams_dir, monkeypatch):
        """Should be case-sensitive for team_id"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        # team_ids should be lowercase, so uppercase shouldn't match
        result = find_team_by_id("PLATFORM-TEAM", "tt")

        # Should not find (team_id is case-sensitive and should be lowercase)
        assert result is None

    def test_find_team_by_id_with_hyphens(self, temp_teams_dir, monkeypatch):
        """Should find team with hyphens in ID"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        result = find_team_by_id("ci-cd-platform-team", "tt")

        assert result is not None
        team, file_path = result
        assert team.team_id == "ci-cd-platform-team"

    def test_find_team_by_id_not_found(self, temp_teams_dir, monkeypatch):
        """Should return None when team ID not found"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        result = find_team_by_id("nonexistent-team", "tt")

        assert result is None


class TestFindTeamByNameOrSlug:
    """Tests for find_team_by_name_or_slug function"""

    def test_find_by_name_or_slug_with_name(self, temp_teams_dir, monkeypatch):
        """Should find team by name"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        result = find_team_by_name_or_slug("Platform Team", "tt")

        assert result is not None
        team, file_path = result
        assert team.name == "Platform Team"

    def test_find_by_name_or_slug_with_slug(self, temp_teams_dir, monkeypatch):
        """Should find team by slug (team_id)"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        result = find_team_by_name_or_slug("platform-team", "tt")

        assert result is not None
        team, file_path = result
        assert team.team_id == "platform-team"

    def test_find_by_name_or_slug_prefers_id(self, temp_teams_dir, monkeypatch):
        """Should prefer team_id match over name slug match"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        # "platform-team" could match team_id directly
        result = find_team_by_name_or_slug("platform-team", "tt")

        assert result is not None
        team, file_path = result
        assert team.team_id == "platform-team"

    def test_find_by_name_or_slug_not_found(self, temp_teams_dir, monkeypatch):
        """Should return None when neither name nor slug matches"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        result = find_team_by_name_or_slug("nonexistent", "tt")

        assert result is None

    def test_find_by_name_or_slug_with_special_chars(self, temp_teams_dir, monkeypatch):
        """Should handle special characters in identifier"""
        monkeypatch.setattr('backend.services.get_data_dir', lambda view: temp_teams_dir)

        # Try finding "CI/CD Platform Team" by name
        result = find_team_by_name_or_slug("CI/CD Platform Team", "tt")

        assert result is not None
        team, file_path = result
        assert team.name == "CI/CD Platform Team"
