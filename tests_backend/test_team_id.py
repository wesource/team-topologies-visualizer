"""Tests for team_id validation and lookup functionality"""
from pathlib import Path

import pytest

from backend.services import (
    check_duplicate_team_ids,
    find_team_by_id,
    parse_team_file,
    validate_team_id,
)


def test_validate_team_id_valid():
    """Valid team_ids should pass validation"""
    # Simple lowercase
    validate_team_id("simple", Path("test.md"))

    # With dashes
    validate_team_id("api-gateway-team", Path("test.md"))

    # With numbers
    validate_team_id("team-1", Path("test.md"))
    validate_team_id("api-v2-team", Path("test.md"))

    # All lowercase alphanumeric
    validate_team_id("abc123def456", Path("test.md"))


def test_validate_team_id_invalid_empty():
    """Empty team_id should raise ValueError"""
    with pytest.raises(ValueError, match="Missing team_id"):
        validate_team_id("", Path("test.md"))


def test_validate_team_id_invalid_uppercase():
    """Uppercase letters should be rejected"""
    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("API-Gateway-Team", Path("test.md"))

    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("ApiGateway", Path("test.md"))


def test_validate_team_id_invalid_spaces():
    """Spaces should be rejected"""
    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("api gateway team", Path("test.md"))


def test_validate_team_id_invalid_underscores():
    """Underscores should be rejected (only dashes allowed)"""
    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("api_gateway_team", Path("test.md"))


def test_validate_team_id_invalid_special_chars():
    """Special characters should be rejected"""
    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("api/gateway", Path("test.md"))

    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("api.gateway", Path("test.md"))

    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("api@gateway", Path("test.md"))


def test_validate_team_id_invalid_leading_trailing_dashes():
    """Leading or trailing dashes should be rejected"""
    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("-api-gateway", Path("test.md"))

    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("api-gateway-", Path("test.md"))


def test_validate_team_id_invalid_consecutive_dashes():
    """Consecutive dashes should be rejected"""
    with pytest.raises(ValueError, match="slug-safe"):
        validate_team_id("api--gateway", Path("test.md"))


def test_parse_team_file_missing_team_id(tmp_path):
    """Parsing a file without team_id should raise ValueError"""
    team_file = tmp_path / "test-team.md"
    team_file.write_text("""---
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
Team description here.
""")

    with pytest.raises(ValueError, match="Missing team_id"):
        parse_team_file(team_file)


def test_parse_team_file_with_valid_team_id(tmp_path):
    """Parsing a file with valid team_id should succeed"""
    team_file = tmp_path / "test-team.md"
    team_file.write_text("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
Team description here.
""")

    team = parse_team_file(team_file)
    assert team.team_id == "test-team"
    assert team.name == "Test Team"


def test_parse_team_file_with_invalid_team_id(tmp_path):
    """Parsing a file with invalid team_id should raise ValueError"""
    team_file = tmp_path / "test-team.md"
    team_file.write_text("""---
team_id: Test Team With Spaces
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
Team description here.
""")

    with pytest.raises(ValueError, match="slug-safe"):
        parse_team_file(team_file)


def test_check_duplicate_team_ids_no_duplicates():
    """check_duplicate_team_ids should return empty dict when no duplicates"""
    # Test with actual data directory (should have no duplicates after migration)
    duplicates_tt = check_duplicate_team_ids("tt")
    assert duplicates_tt == {}, f"Found duplicate team_ids in TT teams: {duplicates_tt}"

    duplicates_current = check_duplicate_team_ids("current")
    assert duplicates_current == {}, f"Found duplicate team_ids in current teams: {duplicates_current}"


def test_check_duplicate_team_ids_with_duplicates(tmp_path):
    """check_duplicate_team_ids should detect duplicates"""
    # Create temporary data directory structure
    data_dir = tmp_path / "data" / "tt-teams"
    data_dir.mkdir(parents=True)

    # Create two files with the same team_id
    team1 = data_dir / "team1.md"
    team1.write_text("""---
team_id: duplicate-id
name: Team One
team_type: stream-aligned
position:
  x: 100
  y: 100
---
First team.
""")

    team2 = data_dir / "team2.md"
    team2.write_text("""---
team_id: duplicate-id
name: Team Two
team_type: platform
position:
  x: 200
  y: 200
---
Second team.
""")

    # Temporarily change TT_TEAMS_DIR
    import backend.services as services
    original_dir = services.TT_TEAMS_DIR
    try:
        services.TT_TEAMS_DIR = data_dir
        duplicates = check_duplicate_team_ids("tt")

        # Should have one duplicate team_id with two files
        assert "duplicate-id" in duplicates
        assert len(duplicates["duplicate-id"]) == 2
    finally:
        services.TT_TEAMS_DIR = original_dir


def test_find_team_by_id_success():
    """find_team_by_id should find team with matching team_id"""
    # Get the first team from the data directory (works with any TT_TEAMS_VARIANT)
    from backend.services import find_all_teams
    teams = find_all_teams("tt")

    if not teams:
        pytest.skip("No teams found in data directory")

    # Use the first team's ID to test find_team_by_id
    first_team = teams[0]
    result = find_team_by_id(first_team.team_id, "tt")

    assert result is not None
    team, file_path = result
    assert team.team_id == first_team.team_id
    assert team.name == first_team.name


def test_find_team_by_id_not_found():
    """find_team_by_id should return None for non-existent team_id"""
    result = find_team_by_id("nonexistent-team-id", "tt")
    assert result is None


def test_find_team_by_id_case_sensitive():
    """find_team_by_id should be case-sensitive"""
    # team_ids must be lowercase, so uppercase should not match
    result = find_team_by_id("API-GATEWAY-PLATFORM-TEAM", "tt")
    assert result is None
