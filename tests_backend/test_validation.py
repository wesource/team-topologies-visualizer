"""Comprehensive tests for validation.py"""
import tempfile
from pathlib import Path

import pytest

from backend.validation import validate_all_team_files


@pytest.fixture
def temp_data_dir():
    """Create a temporary data directory for testing"""
    with tempfile.TemporaryDirectory() as tmpdir:
        temp_path = Path(tmpdir)
        # Create subdirectories
        (temp_path / "current-teams").mkdir(parents=True)
        (temp_path / "tt-teams").mkdir(parents=True)
        yield temp_path


def write_team_file(data_dir: Path, filename: str, content: str, view: str = "tt"):
    """Helper to write a team file"""
    target_dir = data_dir / ("tt-teams" if view == "tt" else "current-teams")
    target_dir.mkdir(parents=True, exist_ok=True)
    file_path = target_dir / filename
    file_path.write_text(content, encoding='utf-8')
    return file_path


def write_config_file(data_dir: Path, view: str, config_content: str):
    """Helper to write team types config"""
    target_dir = data_dir / ("tt-teams" if view == "tt" else "current-teams")
    target_dir.mkdir(parents=True, exist_ok=True)
    config_file = target_dir / ("current-team-types.json" if view == "current" else "tt-team-types.json")
    config_file.write_text(config_content, encoding='utf-8')


class TestValidateAllTeamFiles:
    """Test validate_all_team_files function"""

    def test_empty_directory(self, temp_data_dir, monkeypatch):
        """Should handle empty directory gracefully"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        result = validate_all_team_files("tt")
        
        assert result["view"] == "tt"
        assert result["total_files"] == 0
        assert result["valid_files"] == 0
        assert result["files_with_warnings"] == 0
        assert result["files_with_errors"] == 0
        assert result["issues"] == []

    def test_valid_team_file(self, temp_data_dir, monkeypatch):
        """Should validate a properly formatted team file"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  size: 7
---
# Test Team
Description here.
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["total_files"] == 1
        assert result["valid_files"] == 1
        assert result["files_with_warnings"] == 0
        assert result["files_with_errors"] == 0
        assert result["issues"] == []

    def test_missing_yaml_frontmatter(self, temp_data_dir, monkeypatch):
        """Should detect missing YAML frontmatter"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """# Test Team
No YAML frontmatter here.
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["total_files"] == 1
        assert result["valid_files"] == 0
        assert result["files_with_errors"] == 1
        assert len(result["issues"]) == 1
        assert "Missing YAML front matter" in result["issues"][0]["errors"][0]

    def test_duplicate_yaml_blocks(self, temp_data_dir, monkeypatch):
        """Should detect duplicate YAML blocks"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: stream-aligned
---
Content here
---
name: Another block
---
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_errors"] == 1
        assert any("Duplicate YAML front matter" in error for error in result["issues"][0]["errors"])

    def test_missing_required_field_name(self, temp_data_dir, monkeypatch):
        """Should detect missing 'name' field"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
team_type: stream-aligned
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_errors"] == 1
        assert any("Missing required field: 'name'" in error for error in result["issues"][0]["errors"])

    def test_missing_required_field_team_type(self, temp_data_dir, monkeypatch):
        """Should detect missing 'team_type' field"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_errors"] == 1
        assert any("Missing required field: 'team_type'" in error for error in result["issues"][0]["errors"])

    def test_invalid_team_type_tt_view(self, temp_data_dir, monkeypatch):
        """Should detect invalid team type in TT view"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: invalid-type
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_errors"] == 1
        assert any("Invalid team_type: 'invalid-type'" in error for error in result["issues"][0]["errors"])

    def test_invalid_team_type_current_view(self, temp_data_dir, monkeypatch):
        """Should detect invalid team type in current view"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "current-teams")
        
        # Write config file with valid types
        config = """{
  "team_types": [
    {"id": "feature-team", "name": "Feature Team", "color": "#3498db"}
  ]
}"""
        write_config_file(temp_data_dir, "current", config)
        
        content = """---
name: Test Team
team_type: invalid-type
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "current")
        
        result = validate_all_team_files("current")
        
        assert result["files_with_errors"] == 1
        assert any("Invalid team_type: 'invalid-type'" in error for error in result["issues"][0]["errors"])

    def test_filename_mismatch(self, temp_data_dir, monkeypatch):
        """Should warn about filename mismatch"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Platform Team
team_type: platform
---
# Description
"""
        write_team_file(temp_data_dir, "wrong-filename.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_warnings"] == 1
        assert any("Filename mismatch" in warning for warning in result["issues"][0]["warnings"])
        assert any("expected 'platform-team.md'" in warning for warning in result["issues"][0]["warnings"])

    def test_invalid_position_not_dict(self, temp_data_dir, monkeypatch):
        """Should warn if position is not a dict"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: stream-aligned
position: "100,200"
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_warnings"] == 1
        assert any("position' should be a dict" in warning for warning in result["issues"][0]["warnings"])

    def test_invalid_position_missing_coordinates(self, temp_data_dir, monkeypatch):
        """Should warn if position is missing x or y"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: stream-aligned
position:
  x: 100
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_warnings"] == 1
        assert any("missing x or y coordinate" in warning for warning in result["issues"][0]["warnings"])

    def test_invalid_team_size(self, temp_data_dir, monkeypatch):
        """Should warn about invalid team size"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: stream-aligned
metadata:
  size: -5
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_warnings"] == 1
        assert any("Invalid team size: -5" in warning for warning in result["issues"][0]["warnings"])

    def test_team_size_outside_recommended_range(self, temp_data_dir, monkeypatch):
        """Should warn if team size is outside 5-9 range"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: stream-aligned
metadata:
  size: 15
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_warnings"] == 1
        assert any("outside recommended range (5-9 people)" in warning for warning in result["issues"][0]["warnings"])

    def test_dependencies_reference_nonexistent_team(self, temp_data_dir, monkeypatch):
        """Should warn if dependencies reference non-existent teams (current view)"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "current-teams")
        
        # Write config
        config = """{
  "team_types": [
    {"id": "feature-team", "name": "Feature Team", "color": "#3498db"}
  ]
}"""
        write_config_file(temp_data_dir, "current", config)
        
        content = """---
name: Test Team
team_type: feature-team
dependencies:
  - Nonexistent Team
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "current")
        
        result = validate_all_team_files("current")
        
        assert result["files_with_warnings"] == 1
        assert any("Dependency 'Nonexistent Team' not found" in warning for warning in result["issues"][0]["warnings"])

    def test_interaction_modes_reference_nonexistent_team(self, temp_data_dir, monkeypatch):
        """Should warn if interaction_modes reference non-existent teams (current view)"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "current-teams")
        
        # Write config
        config = """{
  "team_types": [
    {"id": "feature-team", "name": "Feature Team", "color": "#3498db"}
  ]
}"""
        write_config_file(temp_data_dir, "current", config)
        
        content = """---
name: Test Team
team_type: feature-team
interaction_modes:
  collaboration:
    - Nonexistent Team
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "current")
        
        result = validate_all_team_files("current")
        
        assert result["files_with_warnings"] == 1
        assert any("references unknown team: 'Nonexistent Team'" in warning for warning in result["issues"][0]["warnings"])

    def test_interaction_table_missing_in_tt_view(self, temp_data_dir, monkeypatch):
        """Should warn if interaction table section exists but no table present"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: stream-aligned
---
## Teams we currently interact with
No table here, just text.
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_warnings"] == 1
        assert any("no table present" in warning for warning in result["issues"][0]["warnings"])

    def test_interaction_table_missing_team_name_column(self, temp_data_dir, monkeypatch):
        """Should warn if interaction table is missing Team Name column"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: stream-aligned
---
## Teams we currently interact with
| Team | Interaction Mode |
|------|------------------|
| Platform Team | X-as-a-Service |
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_warnings"] == 1
        assert any("missing 'Team Name' column header" in warning for warning in result["issues"][0]["warnings"])

    def test_interaction_table_references_nonexistent_team(self, temp_data_dir, monkeypatch):
        """Should warn if interaction table references non-existent teams"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: stream-aligned
---
## Teams we currently interact with
| Team Name | Interaction Mode |
|-----------|------------------|
| Nonexistent Team | Collaboration |
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_warnings"] == 1
        assert any("references unknown team: 'Nonexistent Team'" in warning for warning in result["issues"][0]["warnings"])

    def test_yaml_parsing_error(self, temp_data_dir, monkeypatch):
        """Should handle YAML parsing errors gracefully"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
name: Test Team
team_type: [unclosed list
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_errors"] == 1
        assert any("YAML parsing error" in error for error in result["issues"][0]["errors"])

    def test_file_reading_error(self, temp_data_dir, monkeypatch):
        """Should handle file reading errors gracefully"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        # Create a file and then make it unreadable by deleting it
        file_path = write_team_file(temp_data_dir, "test-team.md", "---\nname: Test\n---", "tt")
        
        # Mock open to raise an exception
        original_open = open
        def mock_open(*args, **kwargs):
            if str(file_path) in str(args[0]):
                raise IOError("Permission denied")
            return original_open(*args, **kwargs)
        
        monkeypatch.setattr('builtins.open', mock_open)
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_errors"] == 1
        assert any("File reading error" in error for error in result["issues"][0]["errors"])

    def test_multiple_teams_with_mixed_issues(self, temp_data_dir, monkeypatch):
        """Should handle multiple teams with different validation issues"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        # Valid team
        valid_content = """---
name: Valid Team
team_type: stream-aligned
---
# Valid Team
"""
        write_team_file(temp_data_dir, "valid-team.md", valid_content, "tt")
        
        # Team with error
        error_content = """---
name: Error Team
team_type: invalid-type
---
# Error Team
"""
        write_team_file(temp_data_dir, "error-team.md", error_content, "tt")
        
        # Team with warning
        warning_content = """---
name: Warning Team
team_type: platform
metadata:
  size: 20
---
# Warning Team
"""
        write_team_file(temp_data_dir, "warning-team.md", warning_content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["total_files"] == 3
        assert result["valid_files"] == 1
        assert result["files_with_errors"] == 1
        assert result["files_with_warnings"] == 1
        assert len(result["issues"]) == 2  # Only error and warning teams

    def test_skips_readme_and_example_files(self, temp_data_dir, monkeypatch):
        """Should skip README.md and example-undefined-team.md"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        # Create README.md
        readme_content = "# README\nThis should be skipped."
        write_team_file(temp_data_dir, "README.md", readme_content, "tt")
        
        # Create example-undefined-team.md
        example_content = """---
name: Example Team
team_type: undefined
---
# Example
"""
        write_team_file(temp_data_dir, "example-undefined-team.md", example_content, "tt")
        
        # Create valid team
        valid_content = """---
name: Valid Team
team_type: stream-aligned
---
# Valid Team
"""
        write_team_file(temp_data_dir, "valid-team.md", valid_content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["total_files"] == 1  # Only counts valid-team.md
        assert result["valid_files"] == 1

    def test_empty_yaml_frontmatter(self, temp_data_dir, monkeypatch):
        """Should detect empty YAML frontmatter"""
        monkeypatch.setattr('backend.validation.get_data_dir', lambda view: temp_data_dir / "tt-teams")
        
        content = """---
---
# Description
"""
        write_team_file(temp_data_dir, "test-team.md", content, "tt")
        
        result = validate_all_team_files("tt")
        
        assert result["files_with_errors"] == 1
        assert any("Empty YAML front matter" in error for error in result["issues"][0]["errors"])
