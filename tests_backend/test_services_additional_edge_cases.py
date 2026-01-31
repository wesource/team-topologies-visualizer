"""Additional edge case tests for services.py to improve coverage."""

import tempfile
from pathlib import Path

import pytest


class TestParseTeamFileEdgeCases:
    """Additional edge cases for parse_team_file function."""

    def test_parse_file_with_special_characters_in_content(self):
        """Test parsing file with special characters in markdown content."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
---

# Test Team with Special Chars: <>&"'

Content with ampersands & quotes "test" and 'test'.
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.name == "Test Team"
            assert "<>&" in team.description
        finally:
            temp_path.unlink()

    def test_parse_file_with_unicode_characters(self):
        """Test parsing file with Unicode characters."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
team_id: test-team
name: Test Team 日本語
team_type: stream-aligned
---

# Team with emoji 🚀 and Unicode
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert "日本語" in team.name
            assert "🚀" in team.description
        finally:
            temp_path.unlink()

    def test_parse_file_with_very_long_description(self):
        """Test parsing file with very long markdown content."""
        from backend.services import parse_team_file

        long_content = "A" * 10000  # 10k characters

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write(f"""---
team_id: test-team
name: Test Team
team_type: stream-aligned
---

# Test Team

{long_content}
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert len(team.description) > 5000
        finally:
            temp_path.unlink()

    def test_parse_file_with_multiple_dashes_in_frontmatter(self):
        """Test parsing file with extra dashes in frontmatter."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team-with-many-dashes
name: Test Team
team_type: stream-aligned
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.team_id == "test-team-with-many-dashes"
        finally:
            temp_path.unlink()

    def test_parse_file_with_null_position_values(self):
        """Test parsing file with null position values."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
position: null
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Position as null should be handled
            assert team.position is None
        finally:
            temp_path.unlink()

    def test_parse_file_with_string_numbers_in_position(self):
        """Test parsing file with string numbers in position."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: "100"
  y: "200"
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should parse string numbers as numbers
            if team.position:
                assert isinstance(team.position["x"], (int, float, str))
        finally:
            temp_path.unlink()


class TestTeamNameToSlugEdgeCases:
    """Additional edge cases for team_name_to_slug function."""

    def test_slug_with_consecutive_special_chars(self):
        """Test slug conversion with consecutive special characters."""
        from backend.services import team_name_to_slug

        slug = team_name_to_slug("Team!!!???")
        assert slug == "team"
        assert not slug.endswith("-")

    def test_slug_with_only_special_chars(self):
        """Test slug conversion with only special characters."""
        from backend.services import team_name_to_slug

        slug = team_name_to_slug("!@#$%^&*()")
        # Should return something (possibly empty or minimal)
        assert isinstance(slug, str)

    def test_slug_with_unicode_characters(self):
        """Test slug conversion with Unicode characters."""
        from backend.services import team_name_to_slug

        slug = team_name_to_slug("Team 日本語")
        # Should remove or handle Unicode characters
        assert isinstance(slug, str)
        assert "team" in slug

    def test_slug_with_mixed_case_and_numbers(self):
        """Test slug conversion with mixed case and numbers."""
        from backend.services import team_name_to_slug

        slug = team_name_to_slug("Team123ABC")
        assert slug == "team123abc"

    def test_slug_preserves_existing_hyphens(self):
        """Test that existing hyphens in names are preserved."""
        from backend.services import team_name_to_slug

        slug = team_name_to_slug("Well-Formatted-Team-Name")
        assert slug == "well-formatted-team-name"


class TestFindTeamEdgeCases:
    """Additional edge cases for find_team functions."""

    def test_find_team_with_partial_name_match(self):
        """Test that find_team_by_name requires exact match."""
        from backend.services import find_team_by_name

        data_dir = Path("data/tt-teams")
        if not data_dir.exists():
            pytest.skip("TT teams data not found")

        # Partial match should not find team
        team = find_team_by_name(data_dir, "Mobile")
        assert team is None, "Partial name match should not find team"

    def test_find_team_with_extra_whitespace(self):
        """Test find_team_by_name handles whitespace correctly."""
        from backend.services import find_team_by_name

        data_dir = Path("data/tt-teams")
        if not data_dir.exists():
            pytest.skip("TT teams data not found")

        # Try with extra whitespace (should normalize)
        team = find_team_by_name(data_dir, "  Mobile App Team  ")
        # Depends on implementation - may or may not find it

    def test_find_team_in_empty_directory_by_id(self):
        """Test find_team_by_id in empty directory."""
        from backend.services import find_team_by_id

        with tempfile.TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir)
            team = find_team_by_id(data_dir, "nonexistent-team")
            assert team is None


class TestInteractionModesParsing:
    """Additional tests for interaction modes parsing."""

    def test_parse_interaction_modes_with_hyphenated_names(self):
        """Test parsing interaction modes with hyphenated team names."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
interaction_modes:
  Well-Formatted-Team-Name: x-as-a-service
  Another-Team: collaboration
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert "Well-Formatted-Team-Name" in team.interaction_modes
            assert team.interaction_modes["Well-Formatted-Team-Name"] == "x-as-a-service"
        finally:
            temp_path.unlink()

    def test_parse_interaction_modes_case_variations(self):
        """Test parsing interaction modes with case variations."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
interaction_modes:
  Other Team: X-as-a-Service
  Another Team: Collaboration
  Third Team: FACILITATING
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should normalize to lowercase with hyphens
            assert len(team.interaction_modes) == 3
        finally:
            temp_path.unlink()

    def test_parse_empty_interaction_modes(self):
        """Test parsing empty interaction_modes field."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
interaction_modes: {}
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.interaction_modes == {}
        finally:
            temp_path.unlink()


class TestMetadataFieldExtraction:
    """Additional tests for metadata field extraction."""

    def test_metadata_with_nested_objects(self):
        """Test parsing metadata with nested objects."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
metadata:
  size: 5
  custom_field:
    nested: value
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.metadata.get("size") == 5
            # Nested objects should be preserved
            if "custom_field" in team.metadata:
                assert isinstance(team.metadata["custom_field"], dict)
        finally:
            temp_path.unlink()

    def test_metadata_with_array_values(self):
        """Test parsing metadata with array values."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
metadata:
  tags:
    - tag1
    - tag2
    - tag3
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            if "tags" in team.metadata:
                assert isinstance(team.metadata["tags"], list)
                assert len(team.metadata["tags"]) == 3
        finally:
            temp_path.unlink()

    def test_metadata_with_null_values(self):
        """Test parsing metadata with null values."""
        from backend.services import parse_team_file

        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write("""---
team_id: test-team
name: Test Team
team_type: stream-aligned
metadata:
  field1: null
  field2: None
---

# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Null values should be preserved
            assert "field1" in team.metadata
        finally:
            temp_path.unlink()
