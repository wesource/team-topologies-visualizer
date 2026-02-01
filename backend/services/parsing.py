"""Parsing functions for team data from markdown and YAML."""
import re
from pathlib import Path

from backend.constants import FlowMetrics, InteractionModes, MarkdownSections
from backend.models import TeamData
from backend.services.file_ops import read_team_file
from backend.services.utils import validate_team_id


def parse_team_file(file_path: Path) -> TeamData:
    """Parse a markdown file with YAML front matter and extract team data.

    Main orchestration function that:
    1. Reads and parses YAML front matter
    2. Validates and flattens metadata
    3. Enriches with dependencies from markdown
    4. Enriches with interaction modes

    Returns:
        TeamData object with all parsed fields
    """
    # Read file and split YAML from markdown
    data, markdown_content = read_team_file(file_path)

    # Always set description from markdown body
    data['description'] = markdown_content

    # Validate and flatten metadata
    data = _validate_and_flatten_metadata(data, file_path)

    # Extract Team API fields
    data = _extract_team_api_fields(data)

    # Enrich with dependencies from markdown
    data = _enrich_with_dependencies(data, markdown_content)

    # Enrich with interaction modes
    data = _enrich_with_interaction_modes(data, markdown_content)

    return TeamData(**data)


def _validate_and_flatten_metadata(data: dict, file_path: Path) -> dict:
    """Validate team_id and flatten metadata fields to top-level."""
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
    """Validate flow metrics values."""
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
        if flow_metrics['deployment_frequency'].lower() not in FlowMetrics.VALID_FREQUENCIES:
            raise ValueError(
                f"Invalid deployment_frequency in {file_path.name}: "
                f"must be one of {FlowMetrics.VALID_FREQUENCIES}"
            )


def _extract_team_api_fields(data: dict) -> dict:
    """Extract fields from team_api structure to top-level."""
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


def _enrich_with_dependencies(data: dict, markdown_content: str) -> dict:
    """Parse dependencies from markdown and enrich data.

    Handles both YAML dependencies and markdown-based dependencies.
    """
    if 'dependencies' in data and data['dependencies']:
        # Dependencies already in YAML, just parse notes from markdown
        if 'dependency_notes' not in data:
            _, dependency_notes = _parse_dependency_bullets(markdown_content)
            if dependency_notes:
                data['dependency_notes'] = dependency_notes
    else:
        # Parse dependencies from markdown (try interaction tables first)
        dependencies, _ = _parse_interaction_tables(markdown_content)

        if not dependencies:
            # Fallback to bullet list format
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


def _enrich_with_interaction_modes(data: dict, markdown_content: str) -> dict:
    """Parse interaction modes from YAML or markdown."""
    if 'interaction_modes' in data:
        return data  # Already present

    # Check YAML interactions array
    if 'interactions' in data and isinstance(data['interactions'], list):
        interaction_modes = {}
        for interaction in data['interactions']:
            if isinstance(interaction, dict):
                # Support both naming conventions: team/team_id and mode/interaction_mode
                team_key = interaction.get('team_id') or interaction.get('team')
                mode_key = interaction.get('interaction_mode') or interaction.get('mode')
                if team_key and mode_key:
                    interaction_modes[team_key] = mode_key
        if interaction_modes:
            data['interaction_modes'] = interaction_modes
            return data

    # Fallback to markdown table parsing
    _, interaction_modes = _parse_interaction_tables(markdown_content)
    if interaction_modes:
        data['interaction_modes'] = interaction_modes

    return data


def _parse_interaction_tables(markdown_content: str) -> tuple[list[str], dict[str, str]]:
    """Parse interaction table from markdown to extract dependencies and modes.

    Returns:
        Tuple of (dependencies: list of team names, interaction_modes: dict)
    """
    dependencies = []
    interaction_modes = {}

    # Find the interaction section
    match = re.search(
        rf'{re.escape(MarkdownSections.INTERACTIONS_HEADER)}\s*\n(.*?)(?=\n## |$)',
        markdown_content,
        re.DOTALL | re.IGNORECASE
    )

    if not match:
        return dependencies, interaction_modes

    table_content = match.group(1)

    # Parse markdown table rows
    lines = table_content.strip().split('\n')
    for line in lines:
        # Skip header and separator rows
        if line.startswith('|') and not line.startswith('|---') and MarkdownSections.TEAM_NAME_COLUMN not in line:
            cols = [col.strip() for col in line.split('|')[1:-1]]
            if len(cols) >= 2:
                team_name = cols[0].strip()
                interaction_mode = cols[1].strip().lower()

                if team_name and interaction_mode:
                    dependencies.append(team_name)
                    # Normalize interaction mode names
                    if 'x-as-a-service' in interaction_mode or 'xaas' in interaction_mode:
                        interaction_modes[team_name] = InteractionModes.X_AS_A_SERVICE
                    elif 'collaboration' in interaction_mode:
                        interaction_modes[team_name] = InteractionModes.COLLABORATION
                    elif 'facilitat' in interaction_mode:
                        interaction_modes[team_name] = InteractionModes.FACILITATING
                    else:
                        interaction_modes[team_name] = interaction_mode

    return dependencies, interaction_modes


def _parse_dependency_bullets(markdown_content: str) -> tuple[list[str], list[str]]:
    """Parse dependencies from bullet lists under ## Dependencies section.

    Returns:
        Tuple of (dependencies: list of team names, dependency_notes: list)
    """
    dependencies = []
    dependency_notes = []

    # Find the Dependencies section
    match = re.search(
        rf'{re.escape(MarkdownSections.DEPENDENCIES_HEADER)}\s*\n(.*?)(?=\n## |$)',
        markdown_content,
        re.DOTALL | re.IGNORECASE
    )

    if not match:
        return dependencies, dependency_notes

    section_content = match.group(1)

    # Parse bullet points
    lines = section_content.strip().split('\n')
    for line in lines:
        if line.strip().startswith('-'):
            original_line = line.strip()[1:].strip()

            # Check for bold markdown **Team Name**:
            bold_match = re.match(r'\*\*([^*]+)\*\*:\s*(.+)', original_line)
            if bold_match:
                team_name = bold_match.group(1).strip()
                description = bold_match.group(2).strip()
                dependencies.append(team_name)
                dependency_notes.append(f"{team_name}: {description}")
                continue

            # Check for plain format: Team Name - Description
            dash_match = re.match(r'([^-:]+?)\s*[-:]\s*(.+)', original_line)
            if dash_match:
                team_name = dash_match.group(1).strip()
                description = dash_match.group(2).strip()

                # Heuristic: Check if this looks like a team name
                lower_name = team_name.lower()
                is_likely_note = (
                    lower_name.startswith(('blocks', 'depends', 'requires', 'waits',
                                          'all teams', 'teams we', 'internal', 'external')) or
                    not team_name[0].isupper() or
                    len(team_name.split()) > 5
                )

                if is_likely_note:
                    dependency_notes.append(original_line)
                else:
                    dependencies.append(team_name)
                    dependency_notes.append(f"{team_name}: {description}")
            else:
                # No dash/colon separator
                plain_text = original_line.strip()
                if plain_text and (plain_text[0].islower() or
                                  plain_text.lower().startswith(('blocks', 'depends', 'requires', 'waits'))):
                    dependency_notes.append(plain_text)
                elif plain_text:
                    dependencies.append(plain_text)

    return dependencies, dependency_notes
