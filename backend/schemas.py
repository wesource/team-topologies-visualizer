"""Pydantic schemas for configuration files and validation.

This module defines the structure and validation rules for all JSON configuration files
used in the Team Topologies Visualizer. These schemas serve dual purposes:
1. Runtime validation of config file data
2. API-exposed schema documentation for the UI to show field constraints
"""


from pydantic import BaseModel, Field

# ============================================================================
# Baseline Team Types Configuration
# ============================================================================

class TeamTypeConfig(BaseModel):
    """Configuration for a single team type in baseline views."""
    id: str = Field(
        ...,
        description="Unique identifier for the team type (e.g., 'feature-team', 'platform-team')",
        min_length=1,
        max_length=50
    )
    name: str = Field(
        ...,
        description="Display name for the team type",
        min_length=1,
        max_length=100
    )
    description: str = Field(
        ...,
        description="Explanation of what this team type represents and its characteristics",
        min_length=1
    )
    color: str = Field(
        ...,
        description="Hex color code for visualizing this team type (e.g., '#3498db')",
        pattern=r'^#[0-9A-Fa-f]{6}$'
    )


class BaselineTeamTypesConfig(BaseModel):
    """Root configuration for baseline team types (baseline-team-types.json)."""
    team_types: list[TeamTypeConfig] = Field(
        ...,
        description="List of team type definitions for baseline organizational views",
        min_length=1
    )

    class Config:
        json_schema_extra = {
            "example": {
                "team_types": [
                    {
                        "id": "feature-team",
                        "name": "Feature Team",
                        "description": "Small, cross-functional teams that own complete features",
                        "color": "#6FA8DC"
                    }
                ]
            }
        }


# ============================================================================
# Products Configuration
# ============================================================================

class ProductConfig(BaseModel):
    """Configuration for a single product in the product lines view."""
    id: str = Field(
        ...,
        description="Unique identifier for the product (kebab-case recommended)",
        min_length=1,
        max_length=50
    )
    name: str = Field(
        ...,
        description="Display name for the product",
        min_length=1,
        max_length=100
    )
    description: str = Field(
        ...,
        description="Brief explanation of what this product does and who it serves",
        min_length=1
    )
    color: str = Field(
        ...,
        description="Hex color code for the product lane in visualizations",
        pattern=r'^#[0-9A-Fa-f]{6}$'
    )


class ProductsConfig(BaseModel):
    """Root configuration for products (products.json)."""
    products: list[ProductConfig] = Field(
        ...,
        description="List of product definitions for product lines view",
        min_length=1
    )

    class Config:
        json_schema_extra = {
            "example": {
                "products": [
                    {
                        "id": "dispatchhub",
                        "name": "DispatchHub",
                        "description": "Fleet dispatch and operations management platform",
                        "color": "#3498db"
                    }
                ]
            }
        }


# ============================================================================
# Business Streams Configuration
# ============================================================================

class BusinessStreamConfig(BaseModel):
    """Configuration for a single business stream."""
    id: str = Field(
        ...,
        description="Unique identifier for the business stream",
        min_length=1,
        max_length=50
    )
    name: str = Field(
        ...,
        description="Display name for the business stream",
        min_length=1,
        max_length=100
    )
    description: str = Field(
        ...,
        description="Explanation of this business stream's purpose and scope",
        min_length=1
    )
    products: list[str] = Field(
        default_factory=list,
        description="List of product names that belong to this business stream"
    )
    color: str = Field(
        ...,
        description="Hex color code for the business stream in visualizations",
        pattern=r'^#[0-9A-Fa-f]{6}$'
    )


class BusinessStreamsConfig(BaseModel):
    """Root configuration for business streams (business-streams.json)."""
    business_streams: list[BusinessStreamConfig] = Field(
        ...,
        description="List of business stream definitions",
        min_length=1
    )

    class Config:
        json_schema_extra = {
            "example": {
                "business_streams": [
                    {
                        "id": "b2b-fleet-management",
                        "name": "B2B Fleet Management",
                        "description": "Enterprise solutions for fleet operators",
                        "products": ["DispatchHub", "RouteOptix"],
                        "color": "#3498db"
                    }
                ]
            }
        }


# ============================================================================
# Organization Hierarchy Configuration
# ============================================================================

class LineManagerConfig(BaseModel):
    """Configuration for a line manager in the organization."""
    id: str = Field(
        ...,
        description="Unique identifier for the line manager",
        min_length=1
    )
    name: str = Field(
        ...,
        description="Name and title of the line manager",
        min_length=1
    )
    type: str = Field(
        default="line-manager",
        description="Type designation (typically 'line-manager')"
    )
    level: int = Field(
        ...,
        description="Hierarchy level (typically 3 for line managers)",
        ge=0
    )
    teams: list[str] = Field(
        default_factory=list,
        description="List of team names reporting to this line manager"
    )


class DepartmentConfig(BaseModel):
    """Configuration for a department in the organization."""
    id: str = Field(
        ...,
        description="Unique identifier for the department",
        min_length=1
    )
    name: str = Field(
        ...,
        description="Display name for the department",
        min_length=1
    )
    type: str = Field(
        default="department",
        description="Type designation (typically 'department')"
    )
    level: int = Field(
        ...,
        description="Hierarchy level (typically 1 for departments)",
        ge=0
    )
    manager: str | None = Field(
        None,
        description="Name and title of the department head"
    )
    line_managers: list[LineManagerConfig] = Field(
        default_factory=list,
        description="List of line managers within this department"
    )


class CompanyConfig(BaseModel):
    """Configuration for company-level hierarchy node."""
    id: str = Field(
        ...,
        description="Unique identifier for the company leadership",
        min_length=1
    )
    name: str = Field(
        ...,
        description="Company/leadership team name",
        min_length=1
    )
    type: str = Field(
        default="leadership",
        description="Type designation (typically 'leadership' for top level)"
    )
    level: int = Field(
        default=0,
        description="Hierarchy level (0 for company/leadership)",
        ge=0
    )
    children: list[DepartmentConfig] = Field(
        default_factory=list,
        description="List of departments reporting to company leadership"
    )


class OrganizationHierarchyConfig(BaseModel):
    """Root configuration for organization hierarchy (organization-hierarchy.json)."""
    company: CompanyConfig = Field(
        ...,
        description="Top-level company/leadership configuration with nested departments"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "company": {
                    "id": "company-leadership",
                    "name": "Company Leadership Team",
                    "type": "leadership",
                    "level": 0,
                    "children": [
                        {
                            "id": "engineering-dept",
                            "name": "Engineering Department",
                            "type": "department",
                            "level": 1,
                            "manager": "VP of Engineering",
                            "line_managers": []
                        }
                    ]
                }
            }
        }


# ============================================================================
# Schema Registry
# ============================================================================

# Map config file types to their Pydantic schemas
SCHEMA_REGISTRY = {
    "baseline-team-types": BaselineTeamTypesConfig,
    "products": ProductsConfig,
    "business-streams": BusinessStreamsConfig,
    "organization-hierarchy": OrganizationHierarchyConfig,
}
