"""Test URL-safe handling of team names with special characters like slashes."""
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient

from backend.services import parse_team_file, team_name_to_slug
from main import app

client = TestClient(app)


@pytest.fixture
def temp_md_file():
    """Create a temporary markdown file and clean it up after test."""
    temp_file = None
    def _create_temp_file(content):
        nonlocal temp_file
        f = tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8')
        f.write(content)
        f.close()
        temp_file = f.name
        return Path(temp_file)

    yield _create_temp_file

    if temp_file and os.path.exists(temp_file):
        os.unlink(temp_file)


class TestTeamNameUrlSafety:
    """Test URL-safe handling of team names with special characters."""

    def test_team_name_with_slash_can_be_parsed(self, temp_md_file):
        """Team names with '/' should be parseable from markdown."""
        content = """---
team_id: ci-cd-platform-team
name: CI/CD Platform Team
team_type: platform
dependencies: []
interaction_modes: {}
position:
  x: 100
  y: 200
---
# CI/CD Platform Team
Test team with slash in name.
"""
        file_path = temp_md_file(content)

        # Parse the team file
        team_data = parse_team_file(file_path)
        assert team_data.name == "CI/CD Platform Team"
        assert team_data.team_type == "platform"

    def test_team_name_to_slug_conversion(self):
        """Test slug generation for various team names."""
        assert team_name_to_slug("CI/CD Platform Team") == "ci-cd-platform-team"
        assert team_name_to_slug("Data & Analytics Team") == "data-and-analytics-team"
        assert team_name_to_slug("API Gateway Team") == "api-gateway-team"
        assert team_name_to_slug("E-Commerce Checkout Team") == "e-commerce-checkout-team"
        assert team_name_to_slug("Machine Learning  Team") == "machine-learning-team"  # Multiple spaces
        assert team_name_to_slug("Test / Slash / Team") == "test-slash-team"

    def test_api_endpoint_with_slash_in_team_name(self):
        """API should handle team lookup using slug (team_id).

        This test verifies that the API can find teams using their slug/team_id.
        Uses DevOps Enablement Team which exists in both tt-teams variants.
        """
        # The actual team name
        team_name = "DevOps Enablement Team"
        # Convert to URL-safe slug (should match team_id)
        slug = team_name_to_slug(team_name)
        assert slug == "devops-enablement-team"

        # API call using slug should work (200 OK) - using new /api/tt/ prefix
        response = client.get(f"/api/tt/teams/{slug}")

        # Should succeed - backend matches by slug/team_id
        assert response.status_code == 200, \
            f"Expected 200 OK for slug '{slug}', got {response.status_code}"

        # Response should contain the actual team name
        data = response.json()
        assert data["name"] == "DevOps Enablement Team", \
            f"Expected team name 'DevOps Enablement Team', got '{data['name']}'"
