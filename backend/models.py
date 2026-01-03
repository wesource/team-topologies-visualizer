"""Pydantic models for API request/response validation"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any



# Team API submodel for structured fields (optional, for extended Team API)
class TeamAPI(BaseModel):
    purpose: Optional[str] = None
    services_provided: Optional[List[str]] = None
    contact: Optional[Dict[str, str]] = None  # e.g., {"slack": "#team", "email": "team@company.com", "wiki": "..."}
    sla: Optional[str] = None
    consumers: Optional[List[str]] = None
    working_hours: Optional[str] = None

class TeamData(BaseModel):
    """Team data model with YAML front matter fields and Team API extensions"""
    name: str
    team_type: Optional[str] = "other"  # stream-aligned, enabling, complicated-subsystem, platform, OR for current: dev-team, ops-team, etc
    description: Optional[str] = ""
    dependencies: Optional[List[str]] = []
    interaction_modes: Optional[Dict[str, str]] = {}  # {team_name: interaction_mode}
    line_manager: Optional[str] = None  # For current org structure
    position: Optional[Dict[str, float]] = {"x": 0, "y": 0}
    metadata: Optional[Dict[str, Any]] = {}
    # Team API fields (optional, for TT Design teams)
    team_api: Optional[TeamAPI] = None
    purpose: Optional[str] = None  # One-liner mission statement (for quick access)
    value_stream: Optional[str] = None
    platform_grouping: Optional[str] = None
    established: Optional[str] = None  # YYYY-MM
    cognitive_load: Optional[str] = None  # low | medium | high | very-high

    # For extended template support (not required for all teams)
    roadmap: Optional[str] = None
    current_work: Optional[str] = None
    software_owned: Optional[List[str]] = None
    versioning: Optional[str] = None
    testing_approach: Optional[str] = None
    practices_principles: Optional[str] = None
    communication_preferences: Optional[str] = None
    glossary: Optional[str] = None
    documentation_links: Optional[List[str]] = None
    platform_product_metrics: Optional[str] = None
    customer_problems: Optional[str] = None
    team_members: Optional[List[str]] = None


class PositionUpdate(BaseModel):
    """Model for updating team position on canvas"""
    x: float
    y: float
