"""Pydantic models for API request/response validation"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class TeamData(BaseModel):
    """Team data model with YAML front matter fields"""
    name: str
    team_type: Optional[str] = "other"  # stream-aligned, enabling, complicated-subsystem, platform, OR for current: dev-team, ops-team, etc
    description: Optional[str] = ""
    dependencies: Optional[List[str]] = []
    interaction_modes: Optional[Dict[str, str]] = {}  # {team_name: interaction_mode}
    line_manager: Optional[str] = None  # For current org structure
    position: Optional[Dict[str, float]] = {"x": 0, "y": 0}
    metadata: Optional[Dict[str, Any]] = {}


class PositionUpdate(BaseModel):
    """Model for updating team position on canvas"""
    x: float
    y: float
