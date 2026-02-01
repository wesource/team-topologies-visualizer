"""Individual validation rules for team files.

Each validator function follows the same contract:
- Takes the parsed data dict and context
- Returns a tuple of (errors: list[str], warnings: list[str])

This design allows:
1. Easy testing of individual rules
2. Easy addition of new rules
3. Clear single-responsibility functions
"""
import re
from dataclasses import dataclass
from typing import Any

from backend.constants import (
    InteractionFields,
    InteractionModes,
    MarkdownSections,
    TeamSize,
)


@dataclass
class ValidationContext:
    """Context passed to all validators with shared data."""
    view: str  # "tt" or "baseline"
    file_name: str
    valid_types: list[str]
    all_team_names: set[str]
    valid_product_lines: list[str]
    valid_business_streams: list[str]


def validate_required_fields(data: dict, _ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Check that required fields (name, team_type) are present."""
    errors = []

    if not data:
        errors.append("Empty YAML front matter")
        return errors, []

    if 'name' not in data:
        errors.append("Missing required field: 'name'")
    if 'team_type' not in data:
        errors.append("Missing required field: 'team_type'")

    return errors, []


def validate_team_type(data: dict, ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Check that team_type is one of the allowed values."""
    errors = []

    if ctx.valid_types and 'team_type' in data and data['team_type'] not in ctx.valid_types:
        errors.append(
            f"Invalid team_type: '{data['team_type']}' (valid: {', '.join(ctx.valid_types)})"
        )

    return errors, []


def validate_filename_matches_name(
    data: dict, ctx: ValidationContext, expected_slug_fn
) -> tuple[list[str], list[str]]:
    """Check that filename matches the team name slug."""
    warnings = []

    if 'name' in data:
        expected_slug = expected_slug_fn(data['name'])
        # Extract stem from filename (remove .md extension)
        actual_slug = ctx.file_name.rsplit('.', 1)[0] if '.' in ctx.file_name else ctx.file_name

        if expected_slug != actual_slug:
            warnings.append(
                f"Filename mismatch: expected '{expected_slug}.md', got '{ctx.file_name}'"
            )

    return [], warnings


def validate_position(data: dict, _ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Validate position field format if present."""
    warnings = []

    if 'position' in data:
        if not isinstance(data['position'], dict):
            warnings.append("'position' should be a dict with x and y")
        elif 'x' not in data['position'] or 'y' not in data['position']:
            warnings.append("'position' missing x or y coordinate")

    return [], warnings


def validate_metadata_size(data: dict, _ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Validate team size in metadata if present."""
    errors = []
    warnings = []

    if 'metadata' not in data:
        return [], []

    metadata = data['metadata']
    if not isinstance(metadata, dict):
        return [], []

    if 'size' in metadata:
        size = metadata['size']
        if not isinstance(size, int) or size < TeamSize.MIN_VALID:
            warnings.append(f"Invalid team size: {size}")
        elif size < TeamSize.MIN_RECOMMENDED or size > TeamSize.MAX_RECOMMENDED:
            warnings.append(
                f"Team size {size} outside recommended range "
                f"({TeamSize.MIN_RECOMMENDED}-{TeamSize.MAX_RECOMMENDED} people)"
            )

    return errors, warnings


def validate_inner_groupings(data: dict, ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Validate inner grouping constraints (TT view only)."""
    if ctx.view != "tt":
        return [], []

    errors = []
    has_value_stream_inner = bool(data.get('value_stream_inner'))
    has_platform_grouping_inner = bool(data.get('platform_grouping_inner'))
    has_value_stream = bool(data.get('value_stream'))
    has_platform_grouping = bool(data.get('platform_grouping'))

    # C1: Inner requires at least one outer (fractal pattern allows any outer)
    if has_value_stream_inner:
        if not has_value_stream and not has_platform_grouping:
            errors.append(
                "value_stream_inner requires either value_stream or platform_grouping to be set"
            )

    if has_platform_grouping_inner:
        if not has_platform_grouping and not has_value_stream:
            errors.append(
                "platform_grouping_inner requires either platform_grouping or value_stream to be set"
            )

    # C2: Only one inner field supported
    if has_value_stream_inner and has_platform_grouping_inner:
        errors.append(
            "Cannot use both value_stream_inner and platform_grouping_inner. "
            "Choose one inner grouping type."
        )

    return errors, []


def validate_product_line(data: dict, ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Validate product_line references (Baseline view only)."""
    if ctx.view != "baseline" or 'product_line' not in data or not data['product_line']:
        return [], []

    warnings = []
    product_line = data['product_line']
    normalized_product = _normalize_string(product_line)
    valid_normalized = [_normalize_string(p) for p in ctx.valid_product_lines]

    if normalized_product and normalized_product not in valid_normalized:
        warnings.append(
            f"Product line '{product_line}' not found in products.json. "
            f"Valid options: {', '.join(ctx.valid_product_lines)}"
        )

    return [], warnings


def validate_business_stream(data: dict, ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Validate business_stream references (Baseline view only)."""
    if ctx.view != "baseline" or 'business_stream' not in data or not data['business_stream']:
        return [], []

    warnings = []
    business_stream = data['business_stream']
    normalized_stream = _normalize_string(business_stream)
    valid_normalized = [_normalize_string(s) for s in ctx.valid_business_streams]

    if normalized_stream and normalized_stream not in valid_normalized:
        warnings.append(
            f"Business stream '{business_stream}' not found in business-streams.json. "
            f"Valid options: {', '.join(ctx.valid_business_streams)}"
        )

    return [], warnings


def validate_dependencies(data: dict, ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Validate that dependencies reference existing teams (Baseline view)."""
    if ctx.view != "baseline" or 'dependencies' not in data:
        return [], []

    warnings = []
    deps = data['dependencies']

    if isinstance(deps, list):
        for dep in deps:
            if dep not in ctx.all_team_names:
                warnings.append(f"Dependency '{dep}' not found - team does not exist")

    return [], warnings


def validate_interaction_modes(data: dict, ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Validate interaction_modes reference existing teams (Baseline view)."""
    if ctx.view != "baseline" or 'interaction_modes' not in data:
        return [], []

    warnings = []
    modes = data['interaction_modes']

    if isinstance(modes, dict):
        for mode, teams in modes.items():
            if isinstance(teams, list):
                for team in teams:
                    if team not in ctx.all_team_names:
                        warnings.append(
                            f"Interaction mode '{mode}' references unknown team: '{team}'"
                        )

    return [], warnings


def validate_interactions_array(data: dict, ctx: ValidationContext) -> tuple[list[str], list[str]]:
    """Validate YAML interactions array format and team references."""
    if 'interactions' not in data:
        return [], []

    errors = []
    warnings = []
    interactions = data['interactions']

    if not isinstance(interactions, list):
        return [], []

    for idx, interaction in enumerate(interactions):
        if not isinstance(interaction, dict):
            errors.append(
                f"Interaction #{idx+1}: Must be a dict with '{InteractionFields.TEAM_ID}' "
                f"and '{InteractionFields.INTERACTION_MODE}' fields"
            )
            continue

        # Check for correct field names
        team_key = interaction.get(InteractionFields.TEAM_ID) or interaction.get(InteractionFields.TEAM)
        mode_key = interaction.get(InteractionFields.INTERACTION_MODE) or interaction.get(InteractionFields.MODE)

        # Validate field names are present
        if not team_key:
            errors.append(
                f"Interaction #{idx+1}: Missing '{InteractionFields.TEAM_ID}' or '{InteractionFields.TEAM}' field. "
                f"Use '{InteractionFields.TEAM_ID}' (recommended) or '{InteractionFields.TEAM}' to specify target team."
            )
        if not mode_key:
            errors.append(
                f"Interaction #{idx+1}: Missing '{InteractionFields.INTERACTION_MODE}' or '{InteractionFields.MODE}' field. "
                f"Use '{InteractionFields.INTERACTION_MODE}' (recommended) or '{InteractionFields.MODE}' to specify interaction type."
            )

        # Validate team exists
        if team_key and team_key not in ctx.all_team_names:
            warnings.append(f"Interaction references unknown team: '{team_key}'")

        # Validate mode is correct
        if mode_key and mode_key not in InteractionModes.ALL:
            errors.append(
                f"Invalid interaction mode: '{mode_key}' (valid: {', '.join(InteractionModes.ALL)})"
            )

    return errors, warnings


def validate_interaction_table(
    markdown_content: str, ctx: ValidationContext
) -> tuple[list[str], list[str]]:
    """Validate interaction table format in markdown (TT view only)."""
    if ctx.view != "tt":
        return [], []

    if MarkdownSections.INTERACTIONS_HEADER not in markdown_content:
        return [], []

    warnings = []

    # Extract table section
    table_start = markdown_content.find(MarkdownSections.INTERACTIONS_HEADER)
    section = markdown_content[table_start:table_start + 3000]

    # Check if table is present
    if '|' not in section:
        warnings.append("Team interaction section found but no table present")
        return [], warnings

    if not re.search(rf'\|.*{MarkdownSections.TEAM_NAME_COLUMN}.*\|', section, re.IGNORECASE):
        warnings.append(f"Interaction table missing '{MarkdownSections.TEAM_NAME_COLUMN}' column header")
        return [], warnings

    # Parse table and validate team references
    lines = section.split('\n')
    for line in lines:
        # Skip header and separator rows
        if '|' in line and MarkdownSections.TEAM_NAME_COLUMN not in line and '---' not in line:
            parts_row = [p.strip() for p in line.split('|')]
            if len(parts_row) >= 2:
                team_name = parts_row[1]
                if team_name and team_name not in ctx.all_team_names:
                    warnings.append(
                        f"Interaction table references unknown team: '{team_name}'"
                    )

    return [], warnings


def _normalize_string(s: Any) -> str:
    """Normalize string for comparison (lowercase, strip whitespace)."""
    if not s:
        return ""
    return str(s).strip().lower()


# Registry of all validators to run on YAML data
YAML_VALIDATORS = [
    validate_required_fields,
    validate_team_type,
    validate_position,
    validate_metadata_size,
    validate_inner_groupings,
    validate_product_line,
    validate_business_stream,
    validate_dependencies,
    validate_interaction_modes,
    validate_interactions_array,
]

# Validators that need the filename for context (run separately)
FILENAME_VALIDATORS = [
    validate_filename_matches_name,
]

# Validators for markdown content
MARKDOWN_VALIDATORS = [
    validate_interaction_table,
]
