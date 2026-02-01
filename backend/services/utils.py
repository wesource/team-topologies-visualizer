"""Utility functions for team data operations."""
import re
from pathlib import Path


def team_name_to_slug(team_name: str) -> str:
    """Convert team name to URL-safe slug.

    Examples:
        "CI/CD Platform Team" -> "cicd-platform-team"
        "Data & Analytics Team" -> "data-and-analytics-team"
        "API Gateway Team" -> "api-gateway-team"
    """
    slug = team_name
    slug = slug.replace('/', '-')  # CI/CD -> CI-CD
    slug = slug.replace('&', 'and')  # & -> and
    slug = re.sub(r'[^\w\s-]', '', slug)  # Remove other special chars
    slug = re.sub(r'[-\s]+', '-', slug)  # Multiple spaces/dashes -> single dash
    slug = slug.strip('-').lower()  # Lowercase and trim dashes
    return slug


def validate_team_id(team_id: str, file_path: Path) -> None:
    """Validate team_id format (slug-safe: lowercase alphanumeric with dashes).

    Args:
        team_id: The team_id to validate
        file_path: Path to the team file (for error messages)

    Raises:
        ValueError: If team_id format is invalid
    """
    if not team_id:
        raise ValueError(f"Missing team_id in {file_path.name}. All teams must have a unique team_id.")

    # Check if team_id is slug-safe: lowercase letters, numbers, and dashes only
    if not re.match(r'^[a-z0-9]+(-[a-z0-9]+)*$', team_id):
        raise ValueError(
            f"Invalid team_id '{team_id}' in {file_path.name}. "
            f"team_id must be slug-safe: lowercase alphanumeric with dashes only (e.g., 'api-gateway-team')"
        )
