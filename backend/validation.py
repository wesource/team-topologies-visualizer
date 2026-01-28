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
    org_structure_types = ["department", "executive", "leadership", "region", "division"]

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
                                    for interaction in interactions:
                                        if isinstance(interaction, dict):
                                            if 'team' in interaction:
                                                team_name = interaction['team']
                                                if team_name not in all_team_names:
                                                    file_issues["warnings"].append(
                                                        f"Interaction references unknown team: '{team_name}'"
                                                    )
                                            if 'mode' in interaction:
                                                valid_modes = ['collaboration', 'x-as-a-service', 'facilitating']
                                                if interaction['mode'] not in valid_modes:
                                                    file_issues["errors"].append(
                                                        f"Invalid interaction mode: '{interaction['mode']}' (valid: {', '.join(valid_modes)})"
                                                    )
                                        else:
                                            file_issues["errors"].append(
                                                "Interactions array must contain dict objects with 'team' and 'mode' keys"
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
