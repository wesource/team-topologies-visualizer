"""Tests for schema endpoints and validation."""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_get_all_schemas():
    """Test getting all schemas."""
    response = client.get("/api/schemas")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)
    assert len(data) > 0

    # Check expected schemas are present
    assert "baseline-team-types" in data
    assert "products" in data
    assert "business-streams" in data
    assert "organization-hierarchy" in data

    # Check schema structure
    for _schema_name, schema_data in data.items():
        assert "title" in schema_data
        assert "schema" in schema_data
        assert "properties" in schema_data["schema"]


def test_get_specific_schema():
    """Test getting a specific schema."""
    response = client.get("/api/schemas/baseline-team-types")
    assert response.status_code == 200

    data = response.json()
    assert data["title"] == "BaselineTeamTypesConfig"
    assert "schema" in data
    assert "properties" in data["schema"]

    # Check for expected fields
    schema = data["schema"]
    assert "team_types" in schema["properties"]
    assert "required" in schema
    assert "team_types" in schema["required"]


def test_get_nonexistent_schema():
    """Test getting a schema that doesn't exist."""
    response = client.get("/api/schemas/nonexistent-schema")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_schema_field_descriptions():
    """Test that schemas include field descriptions from Pydantic."""
    response = client.get("/api/schemas/baseline-team-types")
    assert response.status_code == 200

    data = response.json()
    schema = data["schema"]

    # Check that $defs contains TeamTypeConfig
    assert "$defs" in schema
    assert "TeamTypeConfig" in schema["$defs"]

    # Check field descriptions exist in the $defs
    team_type_def = schema["$defs"]["TeamTypeConfig"]
    assert "properties" in team_type_def
    assert "id" in team_type_def["properties"]
    assert "name" in team_type_def["properties"]
    assert "description" in team_type_def["properties"]
    assert "color" in team_type_def["properties"]


def test_schema_validation_constraints():
    """Test that schemas include validation constraints."""
    response = client.get("/api/schemas/baseline-team-types")
    assert response.status_code == 200

    data = response.json()
    schema = data["schema"]

    # Get TeamTypeConfig from $defs
    team_type_def = schema["$defs"]["TeamTypeConfig"]
    team_type_props = team_type_def["properties"]

    # Check for validation constraints
    assert "minLength" in team_type_props["id"]
    assert team_type_props["id"]["minLength"] == 1
    assert "maxLength" in team_type_props["id"]
    assert team_type_props["id"]["maxLength"] == 50

    # Check color pattern constraint
    assert "pattern" in team_type_props["color"]
    assert "#" in team_type_props["color"]["pattern"]


def test_baseline_validation_with_config_files():
    """Test that baseline validation includes config file validation."""
    response = client.get("/api/baseline/validate")
    assert response.status_code == 200

    data = response.json()

    # Check response structure
    assert "teams" in data
    assert "config_files" in data

    # Check teams validation structure
    teams = data["teams"]
    assert "total_files" in teams
    assert "valid_files" in teams

    # Check config_files validation structure
    config = data["config_files"]
    assert "config_files" in config
    assert isinstance(config["config_files"], dict)

    # Each config file should have validation results
    for _file_name, file_data in config["config_files"].items():
        assert "valid" in file_data
        assert "errors" in file_data
        assert isinstance(file_data["errors"], list)
