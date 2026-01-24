"""
Tests for services.py parsing functions (_parse_interaction_tables, _parse_dependency_bullets)

Tests focus on:
- Markdown table parsing with various formats
- Bullet list parsing for dependencies
- Edge cases and malformed input
"""

import tempfile
from pathlib import Path

from backend.services import parse_team_file


class TestParseInteractionTables:
    """Tests for interaction table parsing from markdown"""

    def test_parse_interaction_table_with_standard_format(self):
        """Should parse standard interaction table format"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
# Test Team

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose |
|-----------|------------------|---------|
| Platform Team A | X-as-a-Service | Consumes CI/CD platform |
| Squad B | Collaboration | Joint feature development |
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert 'Platform Team A' in team.dependencies
            assert 'Squad B' in team.dependencies
            # Interaction modes are normalized to lowercase
            assert team.interaction_modes['Platform Team A'] == 'x-as-a-service'
            assert team.interaction_modes['Squad B'] == 'collaboration'
        finally:
            temp_path.unlink()

    def test_parse_interaction_table_with_facilitating_mode(self):
        """Should parse Facilitating interaction mode correctly"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: enabling
position:
  x: 100
  y: 100
---
# Test Team

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose |
|-----------|------------------|---------|
| Mobile Team | Facilitating | Help adopt React Native |
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert 'Mobile Team' in team.dependencies
            # Interaction modes are normalized to lowercase
            assert team.interaction_modes['Mobile Team'] == 'facilitating'
        finally:
            temp_path.unlink()

    def test_parse_interaction_table_with_extra_columns(self):
        """Should handle tables with extra columns (Duration, etc.)"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
# Test Team

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Backend Team | Collaboration | API integration | 3 months |
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert 'Backend Team' in team.dependencies
            # Interaction modes are normalized to lowercase
            assert team.interaction_modes['Backend Team'] == 'collaboration'
        finally:
            temp_path.unlink()

    def test_parse_interaction_table_missing_headers(self):
        """Should handle table without proper headers gracefully"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
# Test Team

## Teams we currently interact with

| Platform Team A | X-as-a-Service | Consumes platform |
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should not crash, but may not parse correctly
            assert team.name == "Test Team"
        finally:
            temp_path.unlink()


class TestParseDependencyBullets:
    """Tests for dependency bullet list parsing"""

    def test_parse_dependency_bullets_with_dash_separator(self):
        """Should parse dependencies with dash separator"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
# Test Team

## Dependencies

- Database Team - Schema changes, database performance tuning
- API Framework Team - Shared API infrastructure and standards
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert 'Database Team' in team.dependencies
            assert 'API Framework Team' in team.dependencies
            assert 'Database Team: Schema changes, database performance tuning' in team.dependency_notes
        finally:
            temp_path.unlink()

    def test_parse_dependency_bullets_with_bold_format(self):
        """Should parse dependencies with bold markdown format"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
# Test Team

## Dependencies

- **Backend Services Team**: All business logic and data access
- **Database Team**: Read replicas, reporting queries
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert 'Backend Services Team' in team.dependencies
            assert 'Database Team' in team.dependencies
        finally:
            temp_path.unlink()

    def test_parse_dependency_bullets_with_notes_only(self):
        """Should handle note-only bullets (not team references)"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
# Test Team

## Dependencies

- Database Team - Main data storage
- Blocks all teams from releasing (must wait for QA approval)
- depends on infrastructure team for deployments
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should parse Database Team but treat "Blocks all teams..." as note
            assert 'Database Team' in team.dependencies
            assert len(team.dependency_notes) > 0
        finally:
            temp_path.unlink()

    def test_parse_dependency_bullets_empty_section(self):
        """Should handle empty Dependencies section"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
# Test Team

## Dependencies

(No dependencies)
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should not have dependencies, but should not crash
            assert team.name == "Test Team"
        finally:
            temp_path.unlink()

    def test_parse_dependency_bullets_no_section(self):
        """Should handle missing Dependencies section"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
---
# Test Team

No dependencies section here.
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should handle gracefully
            assert team.name == "Test Team"
            assert team.dependencies == [] or team.dependencies is None
        finally:
            temp_path.unlink()


class TestYAMLInteractionsArray:
    """Tests for YAML interactions array parsing"""

    def test_parse_yaml_interactions_array(self):
        """Should parse interactions from YAML array"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
interactions:
  - team: Platform Team
    mode: x-as-a-service
    purpose: Consumes deployment platform
  - team: Mobile Team
    mode: collaboration
    purpose: Joint mobile features
---
# Test Team
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.interaction_modes is not None
            assert 'Platform Team' in team.interaction_modes
            assert 'Mobile Team' in team.interaction_modes
            assert team.interaction_modes['Platform Team'] == 'x-as-a-service'
            assert team.interaction_modes['Mobile Team'] == 'collaboration'
        finally:
            temp_path.unlink()

    def test_yaml_interactions_preferred_over_markdown(self):
        """Should prefer YAML interactions over markdown table"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_id: test-team
team_type: stream-aligned
position:
  x: 100
  y: 100
interactions:
  - team: YAML Team
    mode: collaboration
    purpose: From YAML
---
# Test Team

## Team Interaction Model

| Team Name | Interaction Mode | Purpose |
|-----------|------------------|---------|
| Markdown Team | X-as-a-Service | From Markdown |
""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should use YAML interactions
            assert 'YAML Team' in team.interaction_modes
            assert team.interaction_modes['YAML Team'] == 'collaboration'
        finally:
            temp_path.unlink()
