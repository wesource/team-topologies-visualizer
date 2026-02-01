"""Service layer for file operations and data parsing.

This package is split into focused modules:
- file_ops: File I/O and directory management
- parsing: Markdown/YAML parsing and data enrichment
- utils: Helper functions (slug generation, validation)

For backward compatibility, all public functions are re-exported here.
"""

# Re-export all public functions from sub-modules for backward compatibility
from backend.services.file_ops import (
    BASELINE_TEAMS_DIR,
    TT_DESIGN_VARIANT,
    TT_TEAMS_DIR,
    check_duplicate_team_ids,
    find_all_teams,
    find_team_by_id,
    find_team_by_name,
    find_team_by_name_or_slug,
    get_data_dir,
    write_team_file,
    write_team_file_to_path,
)
from backend.services.parsing import (
    _parse_dependency_bullets,
    _parse_interaction_tables,
    parse_team_file,
)
from backend.services.utils import team_name_to_slug, validate_team_id

__all__ = [
    # Directory constants
    "TT_DESIGN_VARIANT",
    "TT_TEAMS_DIR",
    "BASELINE_TEAMS_DIR",
    # Utils
    "team_name_to_slug",
    "validate_team_id",
    # File operations
    "get_data_dir",
    "write_team_file",
    "write_team_file_to_path",
    "find_all_teams",
    "find_team_by_name",
    "find_team_by_id",
    "find_team_by_name_or_slug",
    "check_duplicate_team_ids",
    # Parsing
    "parse_team_file",
    "_parse_dependency_bullets",
    "_parse_interaction_tables",
]
