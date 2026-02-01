"""Team file validation utilities"""
import json
import re
from pathlib import Path
from typing import Any

import yaml
from pydantic import ValidationError

from backend.schemas import (
    BaselineTeamTypesConfig,
    BusinessStreamsConfig,
    OrganizationHierarchyConfig,
    ProductsConfig,
)
from backend.services import get_data_dir, team_name_to_slug

# Organizational structure types (not actual teams, but valid in baseline view)
# These represent hierarchy containers like departments, leadership, regions, etc.
# These teams should only appear in the organizational hierarchy view,
# NOT in product lines or business streams views.
ORGANIZATION_STRUCTURE_TYPES = ["department", "executive", "leadership", "region", "division"]


def validate_all_team_files(view: str = "tt") -> dict[str, Any]:
    """Validate all team files and return a report of issues

    Args:
        view: The view to validate ('tt' or 'baseline')

    Returns:
        Dictionary containing validation report with:
        - view: The view that was validated
        - total_files: Total number of files checked
        - valid_files: Number of files with no issues
        - files_with_warnings: Number of files with warnings only
        - files_with_errors: Number of files with errors
        - issues: List of file issues
    """
    data_dir = get_data_dir(view)

    # First pass: collect all team names
    all_team_names = set()
    for file_path in data_dir.rglob("*.md"):
        if file_path.name in ['README.md', 'example-undefined-team.md']:
            continue
        try:
            with open(file_path, encoding='utf-8') as f:
                content = f.read()
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    try:
                        data = yaml.safe_load(parts[1])
                        if data and 'name' in data:
                            all_team_names.add(data['name'])
                    except yaml.YAMLError:
                        pass
        except Exception:
            pass

    report = {
        "view": view,
        "total_files": 0,
        "valid_files": 0,
        "files_with_warnings": 0,
        "files_with_errors": 0,
        "issues": []
    }

    # Valid team types for each view
    valid_types = {
        "tt": ["stream-aligned", "platform", "enabling", "complicated-subsystem", "undefined"],
        "baseline": []  # Will load from config
    }

    # Organizational structure types (not actual teams, but valid in baseline view)
    # These represent hierarchy containers like departments, leadership, regions, etc.
    org_structure_types = ORGANIZATION_STRUCTURE_TYPES

    # Valid product lines and business streams (for baseline view)
    valid_product_lines = []
    valid_business_streams = []

    # Load valid team types for baseline view
    if view == "baseline":
        config_file = data_dir / "baseline-team-types.json"
        if config_file.exists():
            with open(config_file, encoding='utf-8') as f:
                config = json.load(f)
                # team_types is now an array like TT config
                valid_types["baseline"] = [t["id"] for t in config.get("team_types", [])]
                # Add organizational structure types as valid (but conceptually separate)
                valid_types["baseline"].extend(org_structure_types)

        # Load valid product lines
        products_file = data_dir / "products.json"
        if products_file.exists():
            with open(products_file, encoding='utf-8') as f:
                products_config = json.load(f)
                valid_product_lines = [p["name"] for p in products_config.get("products", [])]

        # Load valid business streams
        streams_file = data_dir / "business-streams.json"
        if streams_file.exists():
            with open(streams_file, encoding='utf-8') as f:
                streams_config = json.load(f)
                valid_business_streams = [s["name"] for s in streams_config.get("business_streams", [])]

    def normalize_string(s):
        """Normalize string for comparison (lowercase, strip whitespace)"""
        if not s:
            return ""
        return str(s).strip().lower()

    # Check all markdown files
    for file_path in data_dir.rglob("*.md"):
        # Skip config/example files
        if file_path.name in ['README.md', 'example-undefined-team.md']:
            continue

        report["total_files"] += 1
        file_issues = {
            "file": file_path.name,  # Just filename for cleaner UI
            "errors": [],
            "warnings": []
        }

        try:
            with open(file_path, encoding='utf-8') as f:
                content = f.read()

            # Check 1: Must start with YAML front matter
            if not content.startswith('---'):
                file_issues["errors"].append("Missing YAML front matter (must start with '---')")
            else:
                # Check for duplicate YAML blocks
                yaml_blocks = content.count('---\n')
                if yaml_blocks > 2:
                    file_issues["errors"].append(f"Duplicate YAML front matter detected ({yaml_blocks // 2} blocks found)")

                # Try to parse YAML
                parts = content.split('---', 2)
                if len(parts) < 3:
                    file_issues["errors"].append("Malformed YAML front matter (missing closing '---')")
                else:
                    try:
                        data = yaml.safe_load(parts[1])

                        # Check 2: Required fields
                        if not data:
                            file_issues["errors"].append("Empty YAML front matter")
                        else:
                            if 'name' not in data:
                                file_issues["errors"].append("Missing required field: 'name'")
                            if 'team_type' not in data:
                                file_issues["errors"].append("Missing required field: 'team_type'")

                            # Check 3: Valid team type
                            if 'team_type' in data and data['team_type'] not in valid_types[view]:
                                file_issues["errors"].append(
                                    f"Invalid team_type: '{data['team_type']}' (valid: {', '.join(valid_types[view])})"
                                )

                            # Check 4: Filename matches team name
                            if 'name' in data:
                                expected_slug = team_name_to_slug(data['name'])
                                actual_slug = file_path.stem
                                if expected_slug != actual_slug:
                                    file_issues["warnings"].append(
                                        f"Filename mismatch: expected '{expected_slug}.md', got '{actual_slug}.md'"
                                    )

                            # Check 5: Position field (optional but should be valid if present)
                            if 'position' in data:
                                if not isinstance(data['position'], dict):
                                    file_issues["warnings"].append("'position' should be a dict with x and y")
                                elif 'x' not in data['position'] or 'y' not in data['position']:
                                    file_issues["warnings"].append("'position' missing x or y coordinate")

                            # Check 6: Metadata validation (optional)
                            if 'metadata' in data:
                                metadata = data['metadata']
                                if isinstance(metadata, dict):
                                    # Check team size if present
                                    if 'size' in metadata:
                                        size = metadata['size']
                                        if not isinstance(size, int) or size < 1:
                                            file_issues["warnings"].append(f"Invalid team size: {size}")
                                        elif size < 5 or size > 9:
                                            file_issues["warnings"].append(
                                                f"Team size {size} outside recommended range (5-9 people)"
                                            )
                            # Check 6b: Inner grouping constraints (TT view only)
                            if view == "tt":
                                has_value_stream_inner = 'value_stream_inner' in data and data['value_stream_inner']
                                has_platform_grouping_inner = 'platform_grouping_inner' in data and data['platform_grouping_inner']
                                has_value_stream = 'value_stream' in data and data['value_stream']
                                has_platform_grouping = 'platform_grouping' in data and data['platform_grouping']

                                # C1: Inner requires at least one outer (fractal pattern allows any outer)
                                if has_value_stream_inner:
                                    if not has_value_stream and not has_platform_grouping:
                                        file_issues["errors"].append(
                                            "value_stream_inner requires either value_stream or platform_grouping to be set"
                                        )

                                if has_platform_grouping_inner:
                                    if not has_platform_grouping and not has_value_stream:
                                        file_issues["errors"].append(
                                            "platform_grouping_inner requires either platform_grouping or value_stream to be set"
                                        )

                                # C2: Only one inner field supported
                                if has_value_stream_inner and has_platform_grouping_inner:
                                    file_issues["errors"].append(
                                        "Cannot use both value_stream_inner and platform_grouping_inner. "
                                        "Choose one inner grouping type."
                                    )
                            # Check 7: Product line validation (Baseline view only)
                            if view == "baseline" and 'product_line' in data and data['product_line']:
                                product_line = data['product_line']
                                normalized_product = normalize_string(product_line)
                                valid_normalized = [normalize_string(p) for p in valid_product_lines]

                                if normalized_product and normalized_product not in valid_normalized:
                                    file_issues["warnings"].append(
                                        f"Product line '{product_line}' not found in products.json. "
                                        f"Valid options: {', '.join(valid_product_lines)}"
                                    )

                            # Check 7b: Business stream validation (Baseline view only)
                            if view == "baseline" and 'business_stream' in data and data['business_stream']:
                                business_stream = data['business_stream']
                                normalized_stream = normalize_string(business_stream)
                                valid_normalized = [normalize_string(s) for s in valid_business_streams]

                                if normalized_stream and normalized_stream not in valid_normalized:
                                    file_issues["warnings"].append(
                                        f"Business stream '{business_stream}' not found in business-streams.json. "
                                        f"Valid options: {', '.join(valid_business_streams)}"
                                    )

                            # Check 8: Dependencies reference existing teams (Baseline view)
                            if view == "baseline" and 'dependencies' in data:
                                deps = data['dependencies']
                                if isinstance(deps, list):
                                    for dep in deps:
                                        if dep not in all_team_names:
                                            file_issues["warnings"].append(
                                                f"Dependency '{dep}' not found - team does not exist"
                                            )

                            # Check 9: Interaction modes reference existing teams (Baseline view)
                            if view == "baseline" and 'interaction_modes' in data:
                                modes = data['interaction_modes']
                                if isinstance(modes, dict):
                                    for mode, teams in modes.items():
                                        if isinstance(teams, list):
                                            for team in teams:
                                                if team not in all_team_names:
                                                    file_issues["warnings"].append(
                                                        f"Interaction mode '{mode}' references unknown team: '{team}'"
                                                    )

                            # Check 9b: YAML interactions array references existing teams (TT view)
                            if 'interactions' in data:
                                interactions = data['interactions']
                                if isinstance(interactions, list):
                                    for idx, interaction in enumerate(interactions):
                                        if isinstance(interaction, dict):
                                            # Check for correct field names
                                            team_key = interaction.get('team_id') or interaction.get('team')
                                            mode_key = interaction.get('interaction_mode') or interaction.get('mode')

                                            # Validate field names are present
                                            if not team_key:
                                                file_issues["errors"].append(
                                                    f"Interaction #{idx+1}: Missing 'team_id' or 'team' field. "
                                                    f"Use 'team_id' (recommended) or 'team' to specify target team."
                                                )
                                            if not mode_key:
                                                file_issues["errors"].append(
                                                    f"Interaction #{idx+1}: Missing 'interaction_mode' or 'mode' field. "
                                                    f"Use 'interaction_mode' (recommended) or 'mode' to specify interaction type."
                                                )

                                            # Validate team exists
                                            if team_key and team_key not in all_team_names:
                                                file_issues["warnings"].append(
                                                    f"Interaction references unknown team: '{team_key}'"
                                                )

                                            # Validate mode is correct
                                            if mode_key:
                                                valid_modes = ['collaboration', 'x-as-a-service', 'facilitating']
                                                if mode_key not in valid_modes:
                                                    file_issues["errors"].append(
                                                        f"Invalid interaction mode: '{mode_key}' (valid: {', '.join(valid_modes)})"
                                                    )
                                        else:
                                            file_issues["errors"].append(
                                                f"Interaction #{idx+1}: Must be a dict with 'team_id' and 'interaction_mode' fields"
                                            )

                        # Check 7: Interaction table format (TT view only)
                        if view == "tt":
                            markdown_content = parts[2].strip()
                            if "## Teams we currently interact with" in markdown_content:
                                # Extract table section (increased limit to handle longer sections)
                                table_start = markdown_content.find("## Teams we currently interact with")
                                section = markdown_content[table_start:table_start + 3000]

                                # Check if table is present
                                if '|' not in section:
                                    file_issues["warnings"].append(
                                        "Team interaction section found but no table present"
                                    )
                                elif not re.search(r'\|.*Team Name.*\|', section, re.IGNORECASE):
                                    file_issues["warnings"].append(
                                        "Interaction table missing 'Team Name' column header"
                                    )
                                else:
                                    # Check 10: Parse interaction table and validate team references
                                    lines = section.split('\n')
                                    for line in lines:
                                        # Skip header and separator rows
                                        if '|' in line and 'Team Name' not in line and '---' not in line:
                                            # Extract team name from first column
                                            parts_row = [p.strip() for p in line.split('|')]
                                            if len(parts_row) >= 2:
                                                team_name = parts_row[1]
                                                if team_name and team_name not in all_team_names:
                                                    file_issues["warnings"].append(
                                                        f"Interaction table references unknown team: '{team_name}'"
                                                    )

                    except yaml.YAMLError as e:
                        file_issues["errors"].append(f"YAML parsing error: {str(e)}")

        except Exception as e:
            file_issues["errors"].append(f"File reading error: {str(e)}")

        # Add to report if there are issues
        if file_issues["errors"] or file_issues["warnings"]:
            report["issues"].append(file_issues)
            if file_issues["errors"]:
                report["files_with_errors"] += 1
            else:
                report["files_with_warnings"] += 1
        else:
            report["valid_files"] += 1

    return report


def validate_config_file(file_path: Path, schema_class) -> dict[str, Any]:
    """Validate a JSON config file against its Pydantic schema.

    Args:
        file_path: Path to the JSON config file
        schema_class: Pydantic model class to validate against

    Returns:
        Dictionary with validation result:
        - valid: Boolean indicating if file is valid
        - errors: List of validation error messages
        - data: Parsed data if valid, None otherwise
    """
    result = {
        "file": file_path.name,
        "valid": False,
        "errors": [],
        "data": None
    }

    try:
        with open(file_path, encoding='utf-8') as f:
            data = json.load(f)

        # Validate against Pydantic schema
        validated_data = schema_class(**data)
        result["valid"] = True
        result["data"] = validated_data.model_dump()

    except json.JSONDecodeError as e:
        result["errors"].append(f"Invalid JSON: {str(e)}")
    except ValidationError as e:
        for error in e.errors():
            field_path = " → ".join(str(x) for x in error["loc"])
            result["errors"].append(f"{field_path}: {error['msg']}")
    except FileNotFoundError:
        result["errors"].append(f"File not found: {file_path}")
    except Exception as e:
        result["errors"].append(f"Unexpected error: {str(e)}")

    return result


def validate_all_config_files(view: str = "baseline") -> dict[str, Any]:
    """Validate all JSON config files for a view.

    Args:
        view: The view to validate ('baseline' or 'tt')

    Returns:
        Dictionary containing validation results for all config files
    """
    data_dir = get_data_dir(view)

    report = {
        "view": view,
        "config_files": {},
        "total_errors": 0
    }

    # Define config files to validate
    config_validations = {}

    if view == "baseline":
        config_validations = {
            "baseline-team-types.json": BaselineTeamTypesConfig,
            "products.json": ProductsConfig,
            "business-streams.json": BusinessStreamsConfig,
            "organization-hierarchy.json": OrganizationHierarchyConfig,
        }
    elif view == "tt":
        config_validations = {
            "tt-team-types.json": BaselineTeamTypesConfig,  # Same schema as baseline
        }

    for filename, schema_class in config_validations.items():
        file_path = data_dir / filename
        validation_result = validate_config_file(file_path, schema_class)
        report["config_files"][filename] = validation_result
        if not validation_result["valid"]:
            report["total_errors"] += len(validation_result["errors"])

    return report
