"""Service layer for file operations and data parsing"""
import os
import re
from pathlib import Path

import yaml

from backend.models import TeamData

# Data directories
# TT_TEAMS_VARIANT environment variable allows switching between TT design variants:
# - "tt-teams" (default) - Mid-stage transformation with multiple platforms and value streams
# - "tt-teams-initial" - Simplified first-step transformation (3-6 months)
TT_TEAMS_VARIANT = os.getenv("TT_TEAMS_VARIANT", "tt-teams")
TT_TEAMS_DIR = Path(f"data/{TT_TEAMS_VARIANT}")
BASELINE_TEAMS_DIR = Path("data/baseline-teams")
TT_TEAMS_DIR.mkdir(parents=True, exist_ok=True)
BASELINE_TEAMS_DIR.mkdir(parents=True, exist_ok=True)


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


def get_data_dir(view: str = "tt") -> Path:
    """Get the appropriate data directory based on view"""
    return TT_TEAMS_DIR if view == "tt" else BASELINE_TEAMS_DIR


def _read_and_split_front_matter(file_path: Path) -> tuple[dict, str]:
    """Read file and split YAML front matter from markdown content"""
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


def _validate_and_flatten_metadata(data: dict, file_path: Path) -> dict:
    """Validate team_id and flatten metadata fields to top-level"""
    # Validate team_id format (required field)
    if 'team_id' in data:
        validate_team_id(data['team_id'], file_path)
    else:
        raise ValueError(f"Missing team_id in {file_path.name}. All teams must have a unique team_id.")

    # Flatten metadata fields for convenience
    metadata = data.get('metadata', {}) or {}

    # Simple fields
    for field in ['established', 'cognitive_load', 'size']:
        if field in metadata:
            data[field] = metadata[field]

    # Flow metrics with validation
    if 'flow_metrics' in metadata and isinstance(metadata['flow_metrics'], dict):
        _validate_flow_metrics(metadata['flow_metrics'], file_path)
        data['flow_metrics'] = metadata['flow_metrics']

    # Stream/grouping fields
    for field in ['business_stream', 'value_stream', 'platform_grouping', 'line_manager']:
        if field not in data and field in metadata:
            data[field] = metadata[field]

    return data


def _validate_flow_metrics(flow_metrics: dict, file_path: Path) -> None:
    """Validate flow metrics values"""
    if 'lead_time_days' in flow_metrics:
        if not isinstance(flow_metrics['lead_time_days'], int | float) or flow_metrics['lead_time_days'] < 0:
            raise ValueError(f"Invalid lead_time_days in {file_path.name}: must be non-negative number")

    if 'change_fail_rate' in flow_metrics:
        if not isinstance(flow_metrics['change_fail_rate'], int | float) or not (0 <= flow_metrics['change_fail_rate'] <= 1.0):
            raise ValueError(f"Invalid change_fail_rate in {file_path.name}: must be between 0.0 and 1.0")

    if 'mttr_hours' in flow_metrics:
        if not isinstance(flow_metrics['mttr_hours'], int | float) or flow_metrics['mttr_hours'] < 0:
            raise ValueError(f"Invalid mttr_hours in {file_path.name}: must be non-negative number")

    if 'deployment_frequency' in flow_metrics:
        valid_frequencies = ['daily', 'weekly', 'monthly', 'quarterly']
        if flow_metrics['deployment_frequency'].lower() not in valid_frequencies:
            raise ValueError(f"Invalid deployment_frequency in {file_path.name}: must be one of {valid_frequencies}")


def _extract_team_api_fields(data: dict) -> dict:
    """Extract fields from team_api structure to top-level"""
    metadata = data.get('metadata', {}) or {}

    # Extract purpose from multiple possible locations
    if 'purpose' not in data:
        if 'team_api' in data and isinstance(data['team_api'], dict):
            data['purpose'] = data['team_api'].get('purpose')
        elif 'purpose' in metadata:
            data['purpose'] = metadata['purpose']

    # Flatten Team API fields for easier access
    if 'team_api' in data and isinstance(data['team_api'], dict):
        for key in ['services_provided', 'contact', 'sla', 'consumers', 'working_hours']:
            if key in data['team_api']:
                data[key] = data['team_api'][key]

    return data


def _enrich_dependencies(data: dict, markdown_content: str) -> dict:
    """Parse and enrich dependencies from markdown content"""
    if 'dependencies' in data and data['dependencies']:
        # Dependencies already in YAML, just parse notes from markdown
        if 'dependency_notes' not in data:
            _, dependency_notes = _parse_dependency_bullets(markdown_content)
            if dependency_notes:
                data['dependency_notes'] = dependency_notes
    else:
        # Parse dependencies from markdown
        dependencies, _ = _parse_interaction_tables(markdown_content)

        if not dependencies:
            dependencies, dependency_notes = _parse_dependency_bullets(markdown_content)
            if dependency_notes and 'dependency_notes' not in data:
                data['dependency_notes'] = dependency_notes
        else:
            # Got dependencies from tables, try parsing notes from bullets
            _, dependency_notes = _parse_dependency_bullets(markdown_content)
            if dependency_notes and 'dependency_notes' not in data:
                data['dependency_notes'] = dependency_notes

        if dependencies:
            data['dependencies'] = dependencies

    return data


def _enrich_interaction_modes(data: dict, markdown_content: str) -> dict:
    """Parse and enrich interaction modes from YAML or markdown"""
    if 'interaction_modes' in data:
        return data  # Already present

    # Check YAML interactions array
    if 'interactions' in data and isinstance(data['interactions'], list):
        interaction_modes = {}
        for interaction in data['interactions']:
            if isinstance(interaction, dict) and 'team' in interaction and 'mode' in interaction:
                interaction_modes[interaction['team']] = interaction['mode']
        if interaction_modes:
            data['interaction_modes'] = interaction_modes
            return data

    # Fallback to markdown table parsing (if YAML didn't produce results)
    _, interaction_modes = _parse_interaction_tables(markdown_content)
    if interaction_modes:
        data['interaction_modes'] = interaction_modes

    return data


def parse_team_file(file_path: Path) -> TeamData:
    """Parse a markdown file with YAML front matter and extract Team API interactions from markdown tables"""
    # Read file and split YAML from markdown
    data, markdown_content = _read_and_split_front_matter(file_path)

    # Always set description from markdown body
    data['description'] = markdown_content

    # Validate and flatten metadata
    data = _validate_and_flatten_metadata(data, file_path)

    # Extract Team API fields
    data = _extract_team_api_fields(data)

    # Enrich with dependencies from markdown
    data = _enrich_dependencies(data, markdown_content)

    # Enrich with interaction modes
    data = _enrich_interaction_modes(data, markdown_content)

    return TeamData(**data)


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


def _parse_dependency_bullets(markdown_content: str) -> tuple[list[str], list[str]]:
    """Parse Baseline style dependencies from bullet lists under ## Dependencies section.

    Expected format:
    ## Dependencies
    - Database Team - Schema changes, database performance tuning
    - API Framework Team - Shared API infrastructure and standards
    - All Development Teams - Depends on their code for testing
    - Blocks all teams from releasing (must wait for QA approval)

    Or:
    ## Dependencies
    - **Backend Services Team**: All business logic and data access
    - **Database Team**: Read replicas, reporting queries

    Returns:
        Tuple of (dependencies: list of team names, dependency_notes: list of free text)
    """
    dependencies = []
    dependency_notes = []

    # Find the "Dependencies" section
    dependencies_match = re.search(
        r'## Dependencies\s*\n(.*?)(?=\n## |$)',
        markdown_content,
        re.DOTALL | re.IGNORECASE
    )

    if not dependencies_match:
        return dependencies, dependency_notes

    section_content = dependencies_match.group(1)

    # Parse bullet points
    lines = section_content.strip().split('\n')
    for line in lines:
        if line.strip().startswith('-'):
            original_line = line.strip()[1:].strip()  # Remove '-' and whitespace

            # Check for bold markdown **Team Name**:
            bold_match = re.match(r'\*\*([^*]+)\*\*:\s*(.+)', original_line)
            if bold_match:
                team_name = bold_match.group(1).strip()
                description = bold_match.group(2).strip()
                dependencies.append(team_name)
                # Store the full line as a note for context
                dependency_notes.append(f"{team_name}: {description}")
                continue

            # Check for plain format: Team Name - Description
            dash_match = re.match(r'([^-:]+?)\s*[-:]\s*(.+)', original_line)
            if dash_match:
                team_name = dash_match.group(1).strip()
                description = dash_match.group(2).strip()

                # Check if this looks like a team name or just a note
                # Heuristic: if it starts with common non-team words or doesn't look like a proper noun, treat as note
                lower_name = team_name.lower()
                is_likely_note = (
                    lower_name.startswith(('blocks', 'depends', 'requires', 'waits', 'all teams', 'teams we', 'internal', 'external')) or
                    not team_name[0].isupper() or
                    len(team_name.split()) > 5  # Very long names are probably sentences
                )

                if is_likely_note:
                    # This is a note, not a team reference
                    dependency_notes.append(original_line)
                else:
                    # This looks like a team reference
                    dependencies.append(team_name)
                    dependency_notes.append(f"{team_name}: {description}")
            else:
                # No dash/colon separator - could be just a note or plain team name
                plain_text = original_line.strip()

                # Check if it looks like a note (starts with lowercase, contains multiple words in sentence form)
                if plain_text and (plain_text[0].islower() or
                                   plain_text.lower().startswith(('blocks', 'depends', 'requires', 'waits'))):
                    dependency_notes.append(plain_text)
                elif plain_text:
                    # Assume it's a team name without description
                    dependencies.append(plain_text)

    return dependencies, dependency_notes


def write_team_file(team: TeamData, data_dir: Path) -> Path:
    """Write team data to markdown file with YAML front matter"""
    file_path = data_dir / f"{team_name_to_slug(team.name)}.md"
    return write_team_file_to_path(team, file_path)


def write_team_file_to_path(team: TeamData, file_path: Path) -> Path:
    """Write team data to a specific file path with YAML front matter"""
    # Prepare YAML front matter
    yaml_data = {
        'team_id': team.team_id,  # REQUIRED: unique identifier
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
    if team.product_line:
        yaml_data['product_line'] = team.product_line
    if team.business_stream:
        yaml_data['business_stream'] = team.business_stream
    if team.value_stream:
        yaml_data['value_stream'] = team.value_stream
    if team.platform_grouping:
        yaml_data['platform_grouping'] = team.platform_grouping

    # CRITICAL: Preserve interactions array if present
    if team.interactions:
        yaml_data['interactions'] = team.interactions

    if team.established:
        if 'metadata' not in yaml_data:
            yaml_data['metadata'] = {}
        yaml_data['metadata']['established'] = team.established
    if team.cognitive_load:
        if 'metadata' not in yaml_data:
            yaml_data['metadata'] = {}
        yaml_data['metadata']['cognitive_load'] = team.cognitive_load
    if team.line_manager:
        if 'metadata' not in yaml_data:
            yaml_data['metadata'] = {}
        yaml_data['metadata']['line_manager'] = team.line_manager

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


def check_duplicate_team_ids(view: str = "tt") -> dict[str, list[str]]:
    """Check for duplicate team_ids across all teams.

    Args:
        view: "tt" or "current"

    Returns:
        Dictionary mapping team_id to list of files that use it.
        Empty dict if no duplicates found.
    """
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

    team_id_to_files = {}  # Maps team_id -> list of files using it

    for file_path in data_dir.rglob("*.md"):
        if file_path.name in exclude_files:
            continue
        if any(part.startswith('.') for part in file_path.parts):
            continue

        try:
            team = parse_team_file(file_path)
            if team.team_id:
                if team.team_id not in team_id_to_files:
                    team_id_to_files[team.team_id] = []
                team_id_to_files[team.team_id].append(str(file_path))
        except Exception as e:
            print(f"Error parsing {file_path} during duplicate check: {e}")

    # Filter to only duplicates (team_ids used by more than one file)
    duplicates = {tid: files for tid, files in team_id_to_files.items() if len(files) > 1}
    return duplicates


def find_team_by_name(team_name: str, view: str = "tt") -> tuple[TeamData, Path] | None:
    """Find a team by name and return the team data and file path

    Searches by actual team name in file content, not by filename.
    This handles cases where filename doesn't match team name.

    DEPRECATED: Prefer find_team_by_id() for stable references.
    This function is kept for backward compatibility with name-based lookups.
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


def find_team_by_id(team_id: str, view: str = "tt") -> tuple[TeamData, Path] | None:
    """Find a team by team_id (stable identifier).

    This is the PREFERRED method for team lookups.
    team_id is a stable, slug-safe identifier that doesn't change when team names change.

    Args:
        team_id: Unique team identifier (e.g., "api-gateway-team")
        view: "tt" or "current"

    Returns:
        Tuple of (TeamData, file_path) or None if not found
    """
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

    for file_path in data_dir.rglob("*.md"):
        if file_path.name in exclude_files:
            continue

        try:
            team = parse_team_file(file_path)
            if team.team_id == team_id:
                return team, file_path
        except Exception as e:
            print(f"Error parsing {file_path} while searching for team_id {team_id}: {e}")

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
