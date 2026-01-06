"""Team file validation utilities"""
import json
import re
from typing import Any

import yaml

from backend.services import get_data_dir, team_name_to_slug


def validate_all_team_files(view: str = "tt") -> dict[str, Any]:
    """Validate all team files and return a report of issues

    Args:
        view: The view to validate ('tt' or 'current')

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
        "current": []  # Will load from config
    }

    # Load valid team types for current view
    if view == "current":
        config_file = data_dir / "current-team-types.json"
        if config_file.exists():
            with open(config_file, encoding='utf-8') as f:
                config = json.load(f)
                # team_types is now an array like TT config
                valid_types["current"] = [t["id"] for t in config.get("team_types", [])]

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

                        # Check 7: Interaction table format (TT view only)
                        if view == "tt":
                            markdown_content = parts[2].strip()
                            if "## Teams we currently interact with" in markdown_content:
                                # Extract table section
                                table_start = markdown_content.find("## Teams we currently interact with")
                                section = markdown_content[table_start:table_start + 1000]

                                # Check if table is present
                                if '|' not in section:
                                    file_issues["warnings"].append(
                                        "Team interaction section found but no table present"
                                    )
                                elif not re.search(r'\|.*Team Name.*\|', section, re.IGNORECASE):
                                    file_issues["warnings"].append(
                                        "Interaction table missing 'Team Name' column header"
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
