"""Tests for parsing interaction tables from Team API markdown content"""
from pathlib import Path

import pytest

from backend.services import _parse_interaction_tables


def test_parse_interaction_table_basic():
    """Test parsing a basic interaction table with multiple teams"""
    markdown = """
# Some Team

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Cloud Development Platform Team | X-as-a-Service | Pipelines deploy to their AWS infrastructure | Ongoing |
| Observability Platform Team | Collaboration | Co-design metrics collection | Ongoing |
| DevOps Enablement Team | Facilitating | Learn advanced deployment patterns | 2 weeks |
"""

    dependencies, interaction_modes = _parse_interaction_tables(markdown)

    assert len(dependencies) == 3
    assert "Cloud Development Platform Team" in dependencies
    assert "Observability Platform Team" in dependencies
    assert "DevOps Enablement Team" in dependencies

    assert interaction_modes["Cloud Development Platform Team"] == "x-as-a-service"
    assert interaction_modes["Observability Platform Team"] == "collaboration"
    assert interaction_modes["DevOps Enablement Team"] == "facilitating"


def test_parse_interaction_table_case_insensitive():
    """Test that interaction mode parsing is case-insensitive"""
    markdown = """
## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Team A | X-AS-A-SERVICE | Service | Ongoing |
| Team B | COLLABORATION | Together | Ongoing |
| Team C | Facilitating | Help | Temporary |
"""

    dependencies, interaction_modes = _parse_interaction_tables(markdown)

    assert interaction_modes["Team A"] == "x-as-a-service"
    assert interaction_modes["Team B"] == "collaboration"
    assert interaction_modes["Team C"] == "facilitating"


def test_parse_interaction_table_xaas_variant():
    """Test parsing 'XaaS' as 'x-as-a-service'"""
    markdown = """
## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Platform Team | XaaS | Use their platform | Ongoing |
"""

    dependencies, interaction_modes = _parse_interaction_tables(markdown)

    assert interaction_modes["Platform Team"] == "x-as-a-service"


def test_parse_interaction_table_no_table():
    """Test handling markdown without interaction table"""
    markdown = """
# Some Team

This is a team without an interaction table.

## Some Other Section
Content here.
"""

    dependencies, interaction_modes = _parse_interaction_tables(markdown)

    assert dependencies == []
    assert interaction_modes == {}


def test_parse_interaction_table_empty_table():
    """Test handling empty interaction table"""
    markdown = """
## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|

## Next Section
"""

    dependencies, interaction_modes = _parse_interaction_tables(markdown)

    assert dependencies == []
    assert interaction_modes == {}


def test_parse_interaction_table_with_following_section():
    """Test that parsing stops at next ## section"""
    markdown = """
## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Team A | Collaboration | Work together | Ongoing |

## Teams we expect to interact with soon

| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| Team B | X-as-a-Service | Future | 2 months |
"""

    dependencies, interaction_modes = _parse_interaction_tables(markdown)

    # Should only parse current interactions, not future ones
    assert len(dependencies) == 1
    assert "Team A" in dependencies
    assert "Team B" not in dependencies


def test_parse_real_team_file_ci_cd_platform():
    """Test parsing a real team file to ensure it works end-to-end"""
    from backend.services import parse_team_file

    team_file = Path("data/tt-teams/ci-cd-platform-team.md")
    if not team_file.exists():
        pytest.skip("CI/CD Platform Team file not found")

    team = parse_team_file(team_file)

    # Should have parsed dependencies from the interaction table
    assert len(team.dependencies) > 0
    assert "Cloud Development Platform Team" in team.dependencies

    # Should have interaction modes
    assert len(team.interaction_modes) > 0
    assert team.interaction_modes.get("Cloud Development Platform Team") == "x-as-a-service"


def test_parse_real_team_file_api_gateway():
    """Test parsing API Gateway Platform Team file"""
    from backend.services import parse_team_file

    team_file = Path("data/tt-teams/api-gateway-platform-team.md")
    if not team_file.exists():
        pytest.skip("API Gateway Platform Team file not found")

    team = parse_team_file(team_file)

    # Should have parsed dependencies
    assert len(team.dependencies) > 0
    assert "Security & Compliance Team" in team.dependencies or "Security and Compliance Team" in team.dependencies

    # Should have interaction modes
    assert len(team.interaction_modes) > 0
