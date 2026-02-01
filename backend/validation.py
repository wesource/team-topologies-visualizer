"""Team file validation utilities.

This module provides validation for team markdown files and JSON config files.
The validation is split into:
- validation_rules.py: Individual validation functions (single responsibility)
- validation.py: Orchestration and config file validation
"""
import json
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
from backend.validation_rules import (
    MARKDOWN_VALIDATORS,
    YAML_VALIDATORS,
    ValidationContext,
    validate_filename_matches_name,
)

# Organizational structure types (not actual teams, but valid in baseline view)
# These represent hierarchy containers like departments, leadership, regions, etc.
# These teams should only appear in the organizational hierarchy view,
# NOT in product lines or business streams views.
ORGANIZATION_STRUCTURE_TYPES = ["department", "executive", "leadership", "region", "division"]

# Files to skip during validation
SKIP_FILES = {'README.md', 'example-undefined-team.md'}


def _collect_all_team_names(data_dir: Path) -> set[str]:
    """First pass: collect all team names for cross-reference validation."""
    all_team_names = set()

    for file_path in data_dir.rglob("*.md"):
        if file_path.name in SKIP_FILES:
            continue
        try:
            with open(file_path, encoding='utf-8') as f:
                content = f.read()
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    data = yaml.safe_load(parts[1])
                    if data and 'name' in data:
                        all_team_names.add(data['name'])
        except (yaml.YAMLError, OSError):
            pass  # Errors will be caught in main validation pass

    return all_team_names


def _load_valid_types(view: str, data_dir: Path) -> list[str]:
    """Load valid team types for the given view."""
    if view == "tt":
        return ["stream-aligned", "platform", "enabling", "complicated-subsystem", "undefined"]

    # Baseline view - load from config
    config_file = data_dir / "baseline-team-types.json"
    valid_types = []

    if config_file.exists():
        with open(config_file, encoding='utf-8') as f:
            config = json.load(f)
            valid_types = [t["id"] for t in config.get("team_types", [])]

    # Add organizational structure types as valid
    valid_types.extend(ORGANIZATION_STRUCTURE_TYPES)
    return valid_types


def _load_valid_product_lines(data_dir: Path) -> list[str]:
    """Load valid product lines from config."""
    products_file = data_dir / "products.json"
    if not products_file.exists():
        return []

    with open(products_file, encoding='utf-8') as f:
        config = json.load(f)
        return [p["name"] for p in config.get("products", [])]


def _load_valid_business_streams(data_dir: Path) -> list[str]:
    """Load valid business streams from config."""
    streams_file = data_dir / "business-streams.json"
    if not streams_file.exists():
        return []

    with open(streams_file, encoding='utf-8') as f:
        config = json.load(f)
        return [s["name"] for s in config.get("business_streams", [])]


def _validate_yaml_structure(content: str) -> tuple[dict | None, str, list[str]]:
    """Validate YAML front matter structure and parse content.

    Returns:
        Tuple of (parsed_data, markdown_content, errors)
    """
    errors = []

    if not content.startswith('---'):
        return None, "", ["Missing YAML front matter (must start with '---')"]

    # Check for duplicate YAML blocks
    yaml_blocks = content.count('---\n')
    if yaml_blocks > 2:
        errors.append(f"Duplicate YAML front matter detected ({yaml_blocks // 2} blocks found)")

    # Split and parse
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None, "", ["Malformed YAML front matter (missing closing '---')"]

    try:
        data = yaml.safe_load(parts[1])
        markdown_content = parts[2].strip()
        
        # Check for empty YAML (parsed as None)
        if data is None:
            errors.append("Empty YAML front matter")
        
        return data, markdown_content, errors
    except yaml.YAMLError as e:
        return None, "", [f"YAML parsing error: {str(e)}"]


def _validate_single_file(
    file_path: Path,
    ctx: ValidationContext,
) -> dict[str, Any]:
    """Validate a single team file using all registered validators.

    Returns:
        Dict with 'file', 'errors', and 'warnings' keys.
    """
    file_issues = {
        "file": file_path.name,
        "errors": [],
        "warnings": []
    }

    try:
        with open(file_path, encoding='utf-8') as f:
            content = f.read()

        # Validate YAML structure
        data, markdown_content, structure_errors = _validate_yaml_structure(content)
        file_issues["errors"].extend(structure_errors)

        if data is None:
            return file_issues

        # Run all YAML validators
        for validator in YAML_VALIDATORS:
            errors, warnings = validator(data, ctx)
            file_issues["errors"].extend(errors)
            file_issues["warnings"].extend(warnings)

        # Run filename validator (needs team_name_to_slug function)
        errors, warnings = validate_filename_matches_name(data, ctx, team_name_to_slug)
        file_issues["errors"].extend(errors)
        file_issues["warnings"].extend(warnings)

        # Run markdown validators
        for validator in MARKDOWN_VALIDATORS:
            errors, warnings = validator(markdown_content, ctx)
            file_issues["errors"].extend(errors)
            file_issues["warnings"].extend(warnings)

    except OSError as e:
        file_issues["errors"].append(f"File reading error: {str(e)}")

    return file_issues


def validate_all_team_files(view: str = "tt") -> dict[str, Any]:
    """Validate all team files and return a report of issues.

    This is the main orchestration function that:
    1. Collects all team names for cross-reference validation
    2. Loads configuration (valid types, product lines, business streams)
    3. Runs all validators on each team file
    4. Aggregates results into a report

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

    # Collect team names for cross-reference validation
    all_team_names = _collect_all_team_names(data_dir)

    # Load configuration
    valid_types = _load_valid_types(view, data_dir)
    valid_product_lines = _load_valid_product_lines(data_dir) if view == "baseline" else []
    valid_business_streams = _load_valid_business_streams(data_dir) if view == "baseline" else []

    # Initialize report
    report = {
        "view": view,
        "total_files": 0,
        "valid_files": 0,
        "files_with_warnings": 0,
        "files_with_errors": 0,
        "issues": []
    }

    # Validate each team file
    for file_path in data_dir.rglob("*.md"):
        if file_path.name in SKIP_FILES:
            continue

        report["total_files"] += 1

        # Create validation context for this file
        ctx = ValidationContext(
            view=view,
            file_name=file_path.name,
            valid_types=valid_types,
            all_team_names=all_team_names,
            valid_product_lines=valid_product_lines,
            valid_business_streams=valid_business_streams,
        )

        # Run all validators
        file_issues = _validate_single_file(file_path, ctx)

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
