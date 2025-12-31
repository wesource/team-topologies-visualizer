"""Unit tests for main.py backend functions."""
import pytest
import tempfile
import json
from pathlib import Path
import sys
import os

# Add parent directory to path to import main
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import parse_team_file, get_data_dir, TeamData


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
        
        assert isinstance(result.position['x'], (int, float))
        assert isinstance(result.position['y'], (int, float))
        assert result.position['x'] >= 0
        assert result.position['y'] >= 0
