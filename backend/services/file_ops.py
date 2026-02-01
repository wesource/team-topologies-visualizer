"""File operations and directory management for team data."""
import os
from pathlib import Path

import yaml

from backend.models import TeamData

# Data directories
# TT_DESIGN_VARIANT environment variable allows switching between TT design variants:
# - "tt-teams" (default) - Mid-stage transformation with multiple platforms and value streams
# - "tt-teams-initial" - Simplified first-step transformation (3-6 months)
# - Or use custom folder names for your own design variants (e.g., "tt-design-proposal-a")
TT_DESIGN_VARIANT = os.getenv("TT_DESIGN_VARIANT", "tt-teams")
TT_TEAMS_DIR = Path(f"data/{TT_DESIGN_VARIANT}")
BASELINE_TEAMS_DIR = Path("data/baseline-teams")
TT_TEAMS_DIR.mkdir(parents=True, exist_ok=True)
BASELINE_TEAMS_DIR.mkdir(parents=True, exist_ok=True)


def get_data_dir(view: str = "tt") -> Path:
    """Get the appropriate data directory based on view."""
    return TT_TEAMS_DIR if view == "tt" else BASELINE_TEAMS_DIR


def read_team_file(file_path: Path) -> tuple[dict, str]:
    """Read team file and split YAML front matter from markdown content.

    Returns:
        Tuple of (yaml_data dict, markdown_content string)

    Raises:
        ValueError: If file format is invalid (missing/malformed YAML front matter)
    """
    with open(file_path, encoding='utf-8') as f:
        content = f.read()

    if not content.startswith('---'):
        raise ValueError(f"Missing team_id in {file_path.name}. All teams must have a unique team_id.")

    parts = content.split('---', 2)
    if len(parts) < 3:
        raise ValueError(f"Missing team_id in {file_path.name}. All teams must have a unique team_id.")

    yaml_content = parts[1]
    markdown_content = parts[2].strip()
    data = yaml.safe_load(yaml_content) or {}

    return data, markdown_content


def write_team_file(team: TeamData, data_dir: Path) -> Path:
    """Write team data to a markdown file with YAML front matter."""
    file_name = f"{team.team_id}.md"
    file_path = data_dir / file_name
    return write_team_file_to_path(team, file_path)


def write_team_file_to_path(team: TeamData, file_path: Path) -> Path:
    """Write team data to specific file path.

    Serializes TeamData to markdown format with YAML front matter.
    Preserves position and metadata fields.
    """
    # Prepare YAML data
    yaml_data = {
        "name": team.name,
        "team_id": team.team_id,
        "team_type": team.team_type,
    }

    # Optional fields - only include if present
    if team.position:
        if isinstance(team.position, dict):
            yaml_data["position"] = team.position
        else:
            yaml_data["position"] = {"x": team.position.x, "y": team.position.y}

    # Add all optional fields that are present
    optional_fields = [
        'value_stream', 'platform_grouping', 'product_line', 'business_stream',
        'line_manager', 'value_stream_inner', 'platform_grouping_inner'
    ]
    for field in optional_fields:
        value = getattr(team, field, None)
        if value:
            yaml_data[field] = value

    # Add metadata if present
    metadata = {}
    if getattr(team, 'size', None):
        metadata["size"] = team.size
    if getattr(team, 'established', None):
        metadata["established"] = team.established
    if getattr(team, 'cognitive_load', None):
        metadata["cognitive_load"] = team.cognitive_load
    if getattr(team, 'flow_metrics', None):
        metadata["flow_metrics"] = team.flow_metrics
    if metadata:
        yaml_data["metadata"] = metadata

    # Add dependencies if present
    if team.dependencies:
        yaml_data["dependencies"] = team.dependencies

    # Add interactions array (YAML format)
    if team.interaction_modes:
        interactions = []
        for team_id, mode in team.interaction_modes.items():
            interactions.append({
                "team_id": team_id,
                "interaction_mode": mode
            })
        yaml_data["interactions"] = interactions

    # Write file
    file_path.parent.mkdir(parents=True, exist_ok=True)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('---\n')
        yaml.dump(yaml_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
        f.write('---\n\n')

        # Write description if present
        if team.description:
            f.write(f"{team.description}\n")

    return file_path


def find_all_teams(view: str = "tt") -> list[TeamData]:
    """Find and parse all team files in the data directory.

    Args:
        view: The view to load teams from ('tt' or 'baseline')

    Returns:
        List of TeamData objects, sorted by team_id
    """
    from backend.services.parsing import parse_team_file  # Avoid circular import

    data_dir = get_data_dir(view)
    teams = []

    for file_path in data_dir.rglob("*.md"):
        # Skip README and example files
        if file_path.name in ['README.md', 'example-undefined-team.md']:
            continue

        try:
            team = parse_team_file(file_path)
            teams.append(team)
        except Exception as e:
            # Log error but continue processing other files
            print(f"Error parsing {file_path.name}: {e}")
            continue

    # Sort by team_id for consistent ordering
    return sorted(teams, key=lambda t: t.team_id)


def find_team_by_name(team_name: str, view: str = "tt") -> tuple[TeamData, Path] | None:
    """Find a team by its name.

    Args:
        team_name: The exact team name to search for
        view: The view to search in ('tt' or 'baseline')

    Returns:
        Tuple of (TeamData, file_path) if found, None otherwise
    """
    from backend.services.parsing import parse_team_file  # Avoid circular import

    data_dir = get_data_dir(view)

    for file_path in data_dir.rglob("*.md"):
        if file_path.name in ['README.md', 'example-undefined-team.md']:
            continue

        try:
            team = parse_team_file(file_path)
            if team.name == team_name:
                return team, file_path
        except Exception:
            continue

    return None


def find_team_by_id(team_id: str, view: str = "tt") -> tuple[TeamData, Path] | None:
    """Find a team by its team_id (slug).

    Args:
        team_id: The team_id to search for
        view: The view to search in ('tt' or 'baseline')

    Returns:
        Tuple of (TeamData, file_path) if found, None otherwise
    """
    from backend.services.parsing import parse_team_file  # Avoid circular import
    from backend.services.utils import team_name_to_slug  # Avoid circular import

    data_dir = get_data_dir(view)

    for file_path in data_dir.rglob("*.md"):
        if file_path.name in ['README.md', 'example-undefined-team.md']:
            continue

        try:
            team = parse_team_file(file_path)
            # Match by team_id field or by slug-converted name
            if team.team_id == team_id or team_name_to_slug(team.name) == team_id:
                return team, file_path
        except Exception:
            continue

    return None


def find_team_by_name_or_slug(identifier: str, view: str = "tt") -> tuple[TeamData, Path] | None:
    """Find a team by name or team_id (slug).

    Tries exact name match first, then slug match.

    Args:
        identifier: Team name or team_id to search for
        view: The view to search in ('tt' or 'baseline')

    Returns:
        Tuple of (TeamData, file_path) if found, None otherwise
    """
    # Try exact name first
    result = find_team_by_name(identifier, view)
    if result:
        return result

    # Try as team_id (slug)
    return find_team_by_id(identifier, view)


def check_duplicate_team_ids(view: str = "tt") -> dict[str, list[str]]:
    """Check for duplicate team_ids across all team files.

    Args:
        view: The view to check ('tt' or 'baseline')

    Returns:
        Dictionary mapping team_id to list of file paths that use it.
        Empty dict if no duplicates found.
    """
    data_dir = get_data_dir(view)
    team_id_files: dict[str, list[str]] = {}

    for file_path in data_dir.rglob("*.md"):
        if file_path.name in ['README.md', 'example-undefined-team.md']:
            continue

        try:
            data, _ = read_team_file(file_path)
            team_id = data.get('team_id')

            if team_id:
                if team_id not in team_id_files:
                    team_id_files[team_id] = []
                team_id_files[team_id].append(str(file_path.relative_to(data_dir)))
        except Exception:
            continue

    # Return only duplicates
    return {tid: files for tid, files in team_id_files.items() if len(files) > 1}
