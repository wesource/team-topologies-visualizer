"""API routes for validation schema information.

Provides endpoints for exposing Pydantic schema definitions to the frontend,
enabling UI-driven display of field constraints, required fields, and validation rules.
"""

from typing import Any

from fastapi import APIRouter, HTTPException

from backend.schemas import SCHEMA_REGISTRY

router = APIRouter(prefix="/api/schemas", tags=["schemas"])


@router.get("")
async def get_all_schemas() -> dict[str, Any]:
    """Get validation schemas for all config file types.

    Returns a dictionary mapping config file types to their JSON schemas,
    including field descriptions, constraints, and examples.
    """
    schemas = {}
    for schema_name, schema_class in SCHEMA_REGISTRY.items():
        json_schema = schema_class.model_json_schema()
        # Use description from json_schema_extra if available, otherwise use class docstring
        description = json_schema.get("description", schema_class.__doc__)
        schemas[schema_name] = {
            "title": json_schema.get("title", schema_class.__name__),
            "description": description,
            "schema": json_schema
        }
    return schemas


@router.get("/{schema_name}")
async def get_schema(schema_name: str) -> dict[str, Any]:
    """Get validation schema for a specific config file type.

    Args:
        schema_name: Type of config file (e.g., 'baseline-team-types', 'products')

    Returns:
        JSON schema with field definitions, constraints, and documentation

    Raises:
        HTTPException: If schema_name is not recognized
    """
    if schema_name not in SCHEMA_REGISTRY:
        available = ", ".join(SCHEMA_REGISTRY.keys())
        raise HTTPException(
            status_code=404,
            detail=f"Schema '{schema_name}' not found. Available schemas: {available}"
        )

    schema_class = SCHEMA_REGISTRY[schema_name]
    return {
        "name": schema_name,
        "title": schema_class.__name__,
        "description": schema_class.__doc__,
        "schema": schema_class.model_json_schema()
    }
