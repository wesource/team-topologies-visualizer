"""Tests for Pre-TT dependency parsing from markdown bullet lists"""

from backend.services import _parse_dependency_bullets


def test_parse_dependency_bullets_basic():
    """Test parsing basic bullet list dependencies"""
    markdown = """
## Dependencies
- Database Team - Schema changes, database performance tuning
- API Framework Team - Shared API infrastructure and standards
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert len(dependencies) == 2
    assert "Database Team" in dependencies
    assert "API Framework Team" in dependencies
    assert len(notes) == 2
    assert any("Database Team: Schema changes" in note for note in notes)


def test_parse_dependency_bullets_bold_format():
    """Test parsing bold **Team Name**: format"""
    markdown = """
## Dependencies
- **Backend Services Team**: All business logic and data access
- **Database Team**: Read replicas, reporting queries
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert len(dependencies) == 2
    assert "Backend Services Team" in dependencies
    assert "Database Team" in dependencies
    assert len(notes) == 2


def test_parse_dependency_bullets_mixed_formats():
    """Test parsing mixed bullet formats in same section"""
    markdown = """
## Dependencies
- Database Team - Description with dash
- **API Team**: Description with colon
- QA Team - Another dash description
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert len(dependencies) == 3
    assert "Database Team" in dependencies
    assert "API Team" in dependencies
    assert "QA Team" in dependencies


def test_parse_dependency_bullets_no_section():
    """Test handling markdown without Dependencies section"""
    markdown = """
# Team Name

Some content without dependencies section.

## Other Section
More content.
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert dependencies == []
    assert notes == []


def test_parse_dependency_bullets_empty_section():
    """Test handling empty Dependencies section"""
    markdown = """
## Dependencies

## Next Section
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert dependencies == []
    assert notes == []


def test_parse_dependency_bullets_with_description():
    """Test that descriptions are not included in team names"""
    markdown = """
## Dependencies
- Backend Services Team - Provides all REST APIs and business logic layer
- Database Platform Team - Schema changes and performance tuning
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert len(dependencies) == 2
    # Should not include descriptions
    assert "Backend Services Team" in dependencies
    assert "Database Platform Team" in dependencies
    # Descriptions should be in notes
    assert len(notes) == 2
    assert any("Provides all REST APIs" in note for note in notes)


def test_parse_dependency_bullets_case_insensitive_header():
    """Test that ## Dependencies header matching is case-insensitive"""
    markdown = """
## dependencies
- Team A - Description
- Team B - Description
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert len(dependencies) == 2
    assert "Team A" in dependencies
    assert "Team B" in dependencies


def test_parse_dependency_bullets_stops_at_next_section():
    """Test that parsing stops at next ## section"""
    markdown = """
## Dependencies
- Valid Team - Should be included

## Next Section
- Not A Team - Should not be included
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert len(dependencies) == 1
    assert "Valid Team" in dependencies
    assert "Not A Team" not in dependencies


def test_parse_dependency_bullets_filters_header_text():
    """Test that header-like text in bullets is filtered out"""
    markdown = """
## Dependencies
**Teams We Depend On**:
- Database Team - Real dependency
- API Framework Team - Another real dependency
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    # Should filter out "Teams We Depend On" but include actual teams
    assert "Database Team" in dependencies
    assert "API Framework Team" in dependencies
    # Should not include the header-like text
    assert len([d for d in dependencies if "teams we" in d.lower()]) == 0


def test_parse_dependency_bullets_trims_whitespace():
    """Test that team names have whitespace trimmed"""
    markdown = """
## Dependencies
-   Database Team   - Description with extra spaces
- **  API Team  **: Description
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert "Database Team" in dependencies
    assert "API Team" in dependencies
    # Should not have trailing/leading spaces
    for dep in dependencies:
        assert dep == dep.strip()


def test_parse_dependency_bullets_real_world_example():
    """Test parsing real Pre-TT team file format"""
    markdown = """
# Backend Services Team

The backend monolith team responsible for core logistics services.

## Responsibilities
- Route calculation and optimization
- Dispatch management

## Dependencies

**Teams We Depend On**:
- Database Team - Schema changes, database performance tuning
- API Framework Team - Shared API infrastructure and standards

## Current Challenges

**Cognitive Load**: very-high
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert len(dependencies) == 2
    assert "Database Team" in dependencies
    assert "API Framework Team" in dependencies


def test_parse_dependency_bullets_handles_colons_in_description():
    """Test parsing when descriptions contain colons"""
    markdown = """
## Dependencies
- Platform Team - Uses services: authentication, logging, metrics
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    assert len(dependencies) == 1
    assert "Platform Team" in dependencies


def test_parse_dependency_notes_only():
    """Test parsing narrative notes without team references"""
    markdown = """
## Dependencies
- Blocks all teams from releasing (must wait for QA approval)
- Depends on all development teams' code for testing
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    # These should be recognized as notes, not team names
    assert len(dependencies) == 0
    assert len(notes) == 2
    assert any("Blocks all teams" in note for note in notes)
    assert any("Depends on all development teams" in note for note in notes)


def test_parse_dependency_mixed_teams_and_notes():
    """Test parsing mix of actual team references and narrative notes"""
    markdown = """
## Dependencies
- Backend Services Team - Core business logic
- Web Frontend Team - UI integration
- Blocks all teams from releasing (must wait for approval)
"""
    dependencies, notes = _parse_dependency_bullets(markdown)

    # Should extract 2 teams and 3 notes total
    assert len(dependencies) == 2
    assert "Backend Services Team" in dependencies
    assert "Web Frontend Team" in dependencies
    assert len(notes) == 3  # 2 team notes + 1 standalone note
    assert any("Blocks all teams" in note for note in notes)
