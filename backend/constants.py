"""Shared constants used across the application.

This module centralizes magic strings and constant values to:
- Avoid duplication across files
- Make values easy to update in one place
- Provide clear documentation of allowed values
"""

# Team Topologies team types
class TeamTypes:
    """Team types from the Team Topologies model."""
    STREAM_ALIGNED = "stream-aligned"
    PLATFORM = "platform"
    ENABLING = "enabling"
    COMPLICATED_SUBSYSTEM = "complicated-subsystem"
    UNDEFINED = "undefined"

    TT_TYPES = [STREAM_ALIGNED, PLATFORM, ENABLING, COMPLICATED_SUBSYSTEM, UNDEFINED]


# Interaction modes
class InteractionModes:
    """Interaction modes between teams (Team Topologies model)."""
    COLLABORATION = "collaboration"
    X_AS_A_SERVICE = "x-as-a-service"
    FACILITATING = "facilitating"

    ALL = [COLLABORATION, X_AS_A_SERVICE, FACILITATING]


# Flow metrics
class FlowMetrics:
    """Valid deployment frequency values for flow metrics."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

    VALID_FREQUENCIES = [DAILY, WEEKLY, MONTHLY, QUARTERLY]


# Markdown section headers
class MarkdownSections:
    """Standard markdown section headers used in team files."""
    INTERACTIONS_HEADER = "## Teams we currently interact with"
    DEPENDENCIES_HEADER = "## Dependencies"
    PURPOSE_HEADER = "## Purpose"

    # Table column headers
    TEAM_NAME_COLUMN = "Team Name"


# Organizational structure types
class OrganizationTypes:
    """Organizational structure types (not actual teams, but hierarchy containers)."""
    DEPARTMENT = "department"
    EXECUTIVE = "executive"
    LEADERSHIP = "leadership"
    REGION = "region"
    DIVISION = "division"

    ALL = [DEPARTMENT, EXECUTIVE, LEADERSHIP, REGION, DIVISION]


# File patterns to skip
SKIP_FILES = {'README.md'}


# Team size recommendations (from Team Topologies)
class TeamSize:
    """Recommended team size range from Team Topologies."""
    MIN_RECOMMENDED = 5
    MAX_RECOMMENDED = 9
    MIN_VALID = 1  # Technical minimum


# YAML field names - interaction arrays
class InteractionFields:
    """Field names in YAML interactions array (supports both conventions)."""
    # Recommended (new convention)
    TEAM_ID = "team_id"
    INTERACTION_MODE = "interaction_mode"

    # Legacy (old convention - for backward compatibility)
    TEAM = "team"
    MODE = "mode"


# Configuration file names
class ConfigFiles:
    """Configuration file names for each view."""
    # Baseline view configs
    BASELINE_TEAM_TYPES = "baseline-team-types.json"
    PRODUCTS = "products.json"
    BUSINESS_STREAMS = "business-streams.json"
    ORGANIZATION_HIERARCHY = "organization-hierarchy.json"

    # TT view configs
    TT_TEAM_TYPES = "tt-team-types.json"
