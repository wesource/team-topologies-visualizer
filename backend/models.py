"""Pydantic models for API request/response validation"""
from datetime import datetime
from typing import Any

from pydantic import BaseModel


# Team API submodel for structured fields (optional, for extended Team API)
class TeamAPI(BaseModel):
    purpose: str | None = None
    services_provided: list[str] | None = None
    contact: dict[str, str] | None = None  # e.g., {"slack": "#team", "email": "team@company.com", "wiki": "..."}
    sla: str | None = None
    consumers: list[str] | None = None
    working_hours: str | None = None

# Flow Metrics submodel for DORA metrics (optional)
class FlowMetrics(BaseModel):
    """Flow metrics based on DORA metrics for measuring team/value stream performance"""
    lead_time_days: float | None = None  # Median time from commit to production
    deployment_frequency: str | None = None  # daily, weekly, monthly, quarterly
    change_fail_rate: float | None = None  # 0.0 to 1.0 (e.g., 0.05 = 5%)
    mttr_hours: float | None = None  # Mean time to recovery

class TeamData(BaseModel):
    """Team data model with YAML front matter fields and Team API extensions"""
    team_id: str  # REQUIRED: unique, slug-safe identifier (e.g., "api-gateway-team")
    name: str  # Display name
    team_type: str | None = "other"  # stream-aligned, enabling, complicated-subsystem, platform, OR for current: dev-team, ops-team, etc
    description: str | None = ""
    dependencies: list[str] | None = []
    dependency_notes: list[str] | None = []  # Free text notes about dependencies (separate from team references)
    interaction_modes: dict[str, str] | None = {}  # {team_id: interaction_mode}
    interactions: list[dict[str, Any]] | None = None  # Alternative format: [{team: team_id, mode, purpose}, ...]
    line_manager: str | None = None  # For current org structure
    product_line: str | None = None  # For Product Lines view (Baseline only)
    business_stream: str | None = None  # For Business Streams view (Baseline only)
    position: dict[str, float] | None = {"x": 0, "y": 0}
    metadata: dict[str, Any] | None = {}  # Can include align_hint_x ('left'/'center'/'right') and align_hint_y ('top'/'bottom') - optional positioning hints for auto-align
    # Team API fields (optional, for TT Design teams)
    team_api: TeamAPI | None = None
    purpose: str | None = None  # One-liner mission statement (for quick access)
    value_stream: str | None = None  # For Value Stream Groupings in TT Design
    platform_grouping: str | None = None
    value_stream_inner: str | None = None  # Nested grouping inside value stream
    platform_grouping_inner: str | None = None  # Nested grouping inside platform grouping
    established: str | None = None  # YYYY-MM
    cognitive_load: str | None = None  # low | medium | high | very-high
    flow_metrics: FlowMetrics | None = None  # DORA metrics for team performance

    # For extended template support (not required for all teams)
    roadmap: str | None = None
    current_work: str | None = None
    software_owned: list[str] | None = None
    versioning: str | None = None
    testing_approach: str | None = None
    practices_principles: str | None = None
    communication_preferences: str | None = None
    glossary: str | None = None
    documentation_links: list[str] | None = None
    platform_product_metrics: str | None = None
    customer_problems: str | None = None
    team_members: list[str] | None = None


class PositionUpdate(BaseModel):
    """Model for updating team position on canvas"""
    x: float
    y: float


# Snapshot models
class SnapshotTeamCondensed(BaseModel):
    """Condensed team data for snapshots - only essential fields"""
    name: str
    team_type: str
    position: dict[str, float]
    value_stream: str | None = None
    platform_grouping: str | None = None
    value_stream_inner: str | None = None
    platform_grouping_inner: str | None = None
    dependencies: list[str] | None = []
    dependency_notes: list[str] | None = []
    interaction_modes: dict[str, str] | None = {}
    metadata: dict[str, Any] | None = {}
    team_api_summary: dict[str, Any] | None = None  # Key Team API fields only


class SnapshotStatistics(BaseModel):
    """Statistics about the snapshot"""
    total_teams: int
    stream_aligned: int = 0
    platform: int = 0
    enabling: int = 0
    complicated_subsystem: int = 0
    value_streams: int = 0
    platform_groupings: int = 0


class SnapshotMetadata(BaseModel):
    """Metadata for a snapshot"""
    snapshot_id: str
    name: str
    description: str | None = ""
    author: str | None = ""
    created_at: datetime
    statistics: SnapshotStatistics


class Snapshot(BaseModel):
    """Complete snapshot with all teams"""
    snapshot_id: str
    name: str
    description: str | None = ""
    author: str | None = ""
    created_at: datetime
    teams: list[SnapshotTeamCondensed]
    statistics: SnapshotStatistics


class CreateSnapshotRequest(BaseModel):
    """Request model for creating a snapshot"""
    name: str
    description: str | None = ""
    author: str | None = ""
    team_names: list[str] | None = None  # Optional: specific teams to include (for filtered snapshots)

