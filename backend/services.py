"""Service layer for file operations and data parsing"""
import re
from pathlib import Path

import yaml

from backend.models import TeamData

# Data directories
TT_TEAMS_DIR = Path("data/tt-teams")
CURRENT_TEAMS_DIR = Path("data/current-teams")
TT_TEAMS_DIR.mkdir(parents=True, exist_ok=True)
CURRENT_TEAMS_DIR.mkdir(parents=True, exist_ok=True)


def team_name_to_slug(team_name: str) -> str:
    """Convert team name to URL-safe slug.

    Examples:
        "CI/CD Platform Team" -> "cicd-platform-team"
        "Data & Analytics Team" -> "data-and-analytics-team"
        "API Gateway Team" -> "api-gateway-team"
    """
    # Replace special characters with separators or words
    slug = team_name
    slug = slug.replace('/', '-')  # CI/CD -> CI-CD
    slug = slug.replace('&', 'and')  # & -> and
    slug = re.sub(r'[^\w\s-]', '', slug)  # Remove other special chars
    slug = re.sub(r'[-\s]+', '-', slug)  # Multiple spaces/dashes -> single dash
    slug = slug.strip('-').lower()  # Lowercase and trim dashes
    return slug


def get_data_dir(view: str = "tt") -> Path:
    """Get the appropriate data directory based on view"""
    return TT_TEAMS_DIR if view == "tt" else CURRENT_TEAMS_DIR


def parse_team_file(file_path: Path) -> TeamData:
    """Parse a markdown file with YAML front matter and extract Team API interactions from markdown tables"""
    with open(file_path, encoding='utf-8') as f:
        content = f.read()

    # Split YAML front matter and markdown content
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            yaml_content = parts[1]
            markdown_content = parts[2].strip()
            # Parse YAML
            data = yaml.safe_load(yaml_content) or {}
            # Always set description from markdown body
            data['description'] = markdown_content

            # Flatten metadata fields for convenience
            metadata = data.get('metadata', {}) or {}
            if 'established' in metadata:
                data['established'] = metadata['established']
            if 'cognitive_load' in metadata:
                data['cognitive_load'] = metadata['cognitive_load']
            if 'size' in metadata:
                data['size'] = metadata['size']

            # Support top-level purpose for quick access
            if 'purpose' not in data:
                # Try to extract from team_api or metadata
                if 'team_api' in data and isinstance(data['team_api'], dict):
                    data['purpose'] = data['team_api'].get('purpose')
                elif 'purpose' in metadata:
                    data['purpose'] = metadata['purpose']

            # Support value_stream/platform_grouping at top-level or in metadata
            if 'value_stream' not in data and 'value_stream' in metadata:
                data['value_stream'] = metadata['value_stream']
            if 'platform_grouping' not in data and 'platform_grouping' in metadata:
                data['platform_grouping'] = metadata['platform_grouping']

            # Support new Team API fields at top-level or in team_api
            if 'team_api' in data and isinstance(data['team_api'], dict):
                # Optionally flatten some fields for easier access
                for key in ['services_provided', 'contact', 'sla', 'consumers', 'working_hours']:
                    if key in data['team_api']:
                        data[key] = data['team_api'][key]

            # Parse interaction tables from markdown content (for visualization connections)
            dependencies, interaction_modes = _parse_interaction_tables(markdown_content)
            if dependencies:
                data['dependencies'] = dependencies
            if interaction_modes:
                data['interaction_modes'] = interaction_modes

            return TeamData(**data)

    # If no front matter, treat as plain markdown
    return TeamData(
        name=file_path.stem,
        team_type="stream-aligned",
        description=content
    )


def _parse_interaction_tables(markdown_content: str) -> tuple[list[str], dict[str, str]]:
    """Parse interaction tables from markdown content to extract dependencies and interaction modes.

    Looks for tables under "## Teams we currently interact with" section.
    Expected format:
    | Team Name | Interaction Mode | Purpose | Duration |
    |-----------|------------------|---------|----------|
    | Some Team | X-as-a-Service  | ...     | ...      |

    Returns:
        Tuple of (dependencies: list of team names, interaction_modes: dict mapping team name to mode)
    """
    dependencies = []
    interaction_modes = {}

    # Find the "Teams we currently interact with" section
    current_interactions_match = re.search(
        r'## Teams we currently interact with\s*\n(.*?)(?=\n## |$)',
        markdown_content,
        re.DOTALL | re.IGNORECASE
    )

    if not current_interactions_match:
        return dependencies, interaction_modes

    table_content = current_interactions_match.group(1)

    # Parse markdown table rows (skip header and separator)
    lines = table_content.strip().split('\n')
    for line in lines:
        # Skip header row and separator row
        if line.startswith('|') and not line.startswith('|---') and 'Team Name' not in line:
            # Parse table columns
            cols = [col.strip() for col in line.split('|')[1:-1]]  # Remove empty first/last elements
            if len(cols) >= 2:
                team_name = cols[0].strip()
                interaction_mode = cols[1].strip().lower()

                if team_name and interaction_mode:
                    dependencies.append(team_name)
                    # Normalize interaction mode names
                    if 'x-as-a-service' in interaction_mode or 'xaas' in interaction_mode:
                        interaction_modes[team_name] = 'x-as-a-service'
                    elif 'collaboration' in interaction_mode:
                        interaction_modes[team_name] = 'collaboration'
                    elif 'facilitat' in interaction_mode:
                        interaction_modes[team_name] = 'facilitating'
                    else:
                        interaction_modes[team_name] = interaction_mode

    return dependencies, interaction_modes


def write_team_file(team: TeamData, data_dir: Path) -> Path:
    """Write team data to markdown file with YAML front matter"""
    file_path = data_dir / f"{team.name.lower().replace(' ', '-')}.md"
    return write_team_file_to_path(team, file_path)


def write_team_file_to_path(team: TeamData, file_path: Path) -> Path:
    """Write team data to a specific file path with YAML front matter"""
    # Prepare YAML front matter
    yaml_data = {
        'name': team.name,
        'team_type': team.team_type,
        'position': team.position or {"x": 0, "y": 0},
        'metadata': team.metadata or {}
    }
    # Add new Team API fields if present
    if team.team_api:
        yaml_data['team_api'] = team.team_api.dict(exclude_none=True)
    if team.purpose:
        yaml_data['purpose'] = team.purpose
    if team.value_stream:
        yaml_data['value_stream'] = team.value_stream
    if team.platform_grouping:
        yaml_data['platform_grouping'] = team.platform_grouping
    if team.established:
        if 'metadata' not in yaml_data:
            yaml_data['metadata'] = {}
        yaml_data['metadata']['established'] = team.established
    if team.cognitive_load:
        if 'metadata' not in yaml_data:
            yaml_data['metadata'] = {}
        yaml_data['metadata']['cognitive_load'] = team.cognitive_load
    if team.line_manager:
        yaml_data['line_manager'] = team.line_manager

    # Write file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('---\n')
        yaml.dump(yaml_data, f, default_flow_style=False, sort_keys=False)
        f.write('---\n\n')
        f.write(team.description or '')

    return file_path


def find_all_teams(view: str = "tt") -> list[TeamData]:
    """Find and parse all team files for a specific view"""
    data_dir = get_data_dir(view)
    teams = []

    if not data_dir.exists():
        return teams

    # Files to exclude (hierarchy/department files)
    exclude_files = {
        'company-leadership.md',
        'engineering-dept.md',
        'customer-solutions-dept.md',
        'product-management-dept.md',
        'infrastructure-dept.md',
        'support-dept.md',
        'organization-hierarchy.json',
        'current-team-types.json',
        'tt-team-types.json'
    }

    # Recursively find all .md files (supports nested folder structure)
    for file_path in data_dir.rglob("*.md"):
        # Skip hierarchy/department files
        if file_path.name in exclude_files:
            continue
        # Skip hidden directories like .pytest_cache
        if any(part.startswith('.') for part in file_path.parts):
            continue

        try:
            team = parse_team_file(file_path)
            teams.append(team)
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")

    return teams


def find_team_by_name(team_name: str, view: str = "tt") -> tuple[TeamData, Path] | None:
    """Find a team by name and return the team data and file path

    Searches by actual team name in file content, not by filename.
    This handles cases where filename doesn't match team name.
    """
    data_dir = get_data_dir(view)

    # Files to exclude (hierarchy/department files)
    exclude_files = {
        'company-leadership.md',
        'engineering-dept.md',
        'customer-solutions-dept.md',
        'product-management-dept.md',
        'infrastructure-dept.md',
        'support-dept.md',
        'organization-hierarchy.json',
        'current-team-types.json',
        'tt-team-types.json'
    }

    # Search through all .md files and match by team name in content
    for file_path in data_dir.rglob("*.md"):
        # Skip excluded files
        if file_path.name in exclude_files:
            continue

        try:
            team = parse_team_file(file_path)
            if team.name == team_name:
                return team, file_path
        except Exception as e:
            print(f"Error parsing {file_path} while searching for {team_name}: {e}")

    return None


def find_team_by_name_or_slug(identifier: str, view: str = "tt") -> tuple[TeamData, Path] | None:
    """Find a team by exact name OR by URL-safe slug.

    This allows API endpoints to work with both:
    - Exact team names: "CI/CD Platform Team"
    - URL-safe slugs: "cicd-platform-team"

    Args:
        identifier: Team name or slug
        view: "tt" or "current"

    Returns:
        Tuple of (TeamData, file_path) or None if not found
    """
    # First, try exact name match (handles direct team name lookups)
    result = find_team_by_name(identifier, view)
    if result:
        return result

    # If not found, try matching by slug (handles URL-encoded names with special chars)
    data_dir = get_data_dir(view)
    exclude_files = {
        'company-leadership.md',
        'engineering-dept.md',
        'customer-solutions-dept.md',
        'product-management-dept.md',
        'infrastructure-dept.md',
        'support-dept.md',
        'organization-hierarchy.json',
        'current-team-types.json',
        'tt-team-types.json'
    }

    identifier_slug = team_name_to_slug(identifier)

    for file_path in data_dir.rglob("*.md"):
        if file_path.name in exclude_files:
            continue

        try:
            team = parse_team_file(file_path)
            team_slug = team_name_to_slug(team.name)
            if team_slug == identifier_slug:
                return team, file_path
        except Exception as e:
            print(f"Error parsing {file_path} while searching for slug {identifier}: {e}")

    return None
