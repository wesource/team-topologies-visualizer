"""Unit tests for backend modules."""
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services import get_data_dir, parse_team_file


@pytest.fixture
def temp_md_file():
    """Create a temporary markdown file and clean it up after test."""
    temp_file = None
    def _create_temp_file(content):
        nonlocal temp_file
        f = tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False)
        f.write(content)
        f.close()
        temp_file = f.name
        return Path(temp_file)

    yield _create_temp_file

    if temp_file and os.path.exists(temp_file):
        os.unlink(temp_file)


class TestParseTeamFile:
    """Test markdown file parsing with YAML frontmatter."""

    def test_parse_valid_markdown_with_frontmatter(self, temp_md_file):
        """Should parse markdown with YAML frontmatter correctly."""
        content = """---
name: Test Team
team_type: platform-team
dependencies:
  - Team A
  - Team B
---
# Test Team
This is the description.
"""
        file_path = temp_md_file(content)
        result = parse_team_file(file_path)

        assert result.name == 'Test Team'
        assert result.team_type == 'platform-team'
        assert result.dependencies == ['Team A', 'Team B']
        assert '# Test Team' in result.description
        assert 'This is the description.' in result.description

    def test_parse_markdown_without_frontmatter(self, temp_md_file):
        """Should handle markdown without frontmatter."""
        content = """# Test Team
This is just a description without frontmatter.
"""
        file_path = temp_md_file(content)
        result = parse_team_file(file_path)

        assert result.description == content

    def test_parse_position_from_frontmatter(self, temp_md_file):
        """Should parse position coordinates from frontmatter."""
        content = """---
name: Positioned Team
position:
  x: 100
  y: 200
---
Content
"""
        file_path = temp_md_file(content)
        result = parse_team_file(file_path)

        assert result.position['x'] == 100
        assert result.position['y'] == 200

    def test_parse_interaction_modes(self, temp_md_file):
        """Should parse interaction modes from frontmatter."""
        content = """---
name: Connected Team
interaction_modes:
  team-a: collaboration
  team-b: x-as-a-service
---
Content
"""
        file_path = temp_md_file(content)
        result = parse_team_file(file_path)

        assert result.interaction_modes['team-a'] == 'collaboration'
        assert result.interaction_modes['team-b'] == 'x-as-a-service'


class TestGetDataDir:
    """Test data directory selection based on view."""

    def test_get_data_dir_current(self):
        """Should return current-teams directory for 'current' view."""
        data_dir = get_data_dir('current')
        assert data_dir.name == 'current-teams'
        assert 'data' in str(data_dir)

    def test_get_data_dir_tt(self):
        """Should return tt-teams directory for 'tt' view."""
        data_dir = get_data_dir('tt')
        assert data_dir.name == 'tt-teams'
        assert 'data' in str(data_dir)

    def test_get_data_dir_default(self):
        """Should return current-teams directory for invalid view."""
        data_dir = get_data_dir('invalid')
        assert data_dir.name == 'current-teams'

    def test_get_data_dir_none(self):
        """Should return current-teams directory when view is None."""
        data_dir = get_data_dir(None)
        assert data_dir.name == 'current-teams'


class TestTeamDataStructure:
    """Test that team data structures are consistent."""

    def test_team_has_required_fields(self, temp_md_file):
        """Team data should have all required fields."""
        content = """---
name: Complete Team
team_type: platform-team
position:
  x: 100
  y: 200
---
# Description
"""
        file_path = temp_md_file(content)
        result = parse_team_file(file_path)

        assert result.name == 'Complete Team'
        assert result.team_type == 'platform-team'
        assert result.position is not None
        assert result.description == '# Description'

    def test_position_has_numeric_coordinates(self, temp_md_file):
        """Position should have numeric x and y coordinates."""
        content = """---
name: Test Team
position:
  x: 150
  y: 250
---
Content
"""
        file_path = temp_md_file(content)
        result = parse_team_file(file_path)

        assert isinstance(result.position['x'], int | float)
        assert isinstance(result.position['y'], int | float)
        assert result.position['x'] >= 0
        assert result.position['y'] >= 0


class TestFilenameConsistency:
    """Test that filenames match team names in files."""

    def test_tt_teams_filenames_match_team_names(self):
        """All tt-teams filenames should match team names (URL-safe slug format)."""
        from backend.services import TT_TEAMS_DIR, team_name_to_slug

        mismatches = []
        for file_path in TT_TEAMS_DIR.rglob("*.md"):
            # Skip config files and example files
            if file_path.name in ['tt-team-types.json', 'example-undefined-team.md']:
                continue

            try:
                with open(file_path, encoding='utf-8') as f:
                    content = f.read()

                # Extract team name from YAML
                if content.startswith('---'):
                    parts = content.split('---', 2)
                    if len(parts) >= 3:
                        import yaml
                        data = yaml.safe_load(parts[1])
                        if data and 'name' in data:
                            team_name = data['name']
                            expected_filename = team_name_to_slug(team_name)
                            actual_filename = file_path.stem

                            if actual_filename != expected_filename:
                                mismatches.append({
                                    'file': file_path.name,
                                    'team_name': team_name,
                                    'expected': f"{expected_filename}.md"
                                })
            except Exception as e:
                pytest.fail(f"Error parsing {file_path}: {e}")

        if mismatches:
            error_msg = "Filename mismatches found:\n"
            for m in mismatches:
                error_msg += f"  {m['file']} -> Team: '{m['team_name']}' (expected: {m['expected']})\n"
            pytest.fail(error_msg)

    def test_current_teams_filenames_match_team_names(self):
        """All current-teams filenames should match team names (lowercase, spaces->hyphens)."""
        from backend.services import CURRENT_TEAMS_DIR

        mismatches = []
        # Files that are intentionally different (hierarchy/dept files)
        skip_files = {
            'company-leadership.md',  # Leadership structure file
            'organization-hierarchy.json',
            'current-team-types.json',
            'README.md',  # Documentation file
            'example-undefined-team.md'  # Example file for undefined team type
        }
        # Also skip files ending with -dept.md as they're department/hierarchy files

        for file_path in CURRENT_TEAMS_DIR.rglob("*.md"):
            # Skip known hierarchy files
            if file_path.name in skip_files or file_path.name.endswith('-dept.md'):
                continue

            try:
                with open(file_path, encoding='utf-8') as f:
                    content = f.read()

                # Extract team name from YAML
                if content.startswith('---'):
                    parts = content.split('---', 2)
                    if len(parts) >= 3:
                        import yaml
                        data = yaml.safe_load(parts[1])
                        if data and 'name' in data:
                            team_name = data['name']
                            expected_filename = team_name.lower().replace(' ', '-').replace('&', 'and')
                            actual_filename = file_path.stem

                            if actual_filename != expected_filename:
                                mismatches.append({
                                    'file': file_path.name,
                                    'team_name': team_name,
                                    'expected': f"{expected_filename}.md"
                                })
            except Exception as e:
                pytest.fail(f"Error parsing {file_path}: {e}")

        if mismatches:
            error_msg = "Filename mismatches found:\n"
            for m in mismatches:
                error_msg += f"  {m['file']} -> Team: '{m['team_name']}' (expected: {m['expected']})\n"
            pytest.fail(error_msg)
