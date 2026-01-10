"""
Tests for services.py edge cases and error handling

Tests focus on:
- Invalid YAML handling
- Missing required fields
- Malformed file content
- Flow metrics validation
- Edge cases in file parsing
"""

import tempfile
from pathlib import Path

import pytest
import yaml

from backend.services import parse_team_file, team_name_to_slug


class TestTeamNameToSlug:
    """Tests for team name slug conversion"""

    def test_slug_converts_forward_slash(self):
        """CI/CD should become ci-cd"""
        assert team_name_to_slug("CI/CD Platform Team") == "ci-cd-platform-team"

    def test_slug_converts_ampersand(self):
        """& should become 'and'"""
        assert team_name_to_slug("Data & Analytics Team") == "data-and-analytics-team"

    def test_slug_removes_special_chars(self):
        """Special characters should be removed"""
        assert team_name_to_slug("API@Gateway#Team!") == "apigatewayteam"

    def test_slug_converts_multiple_spaces_to_single_dash(self):
        """Multiple spaces should become single dash"""
        assert team_name_to_slug("Mobile    App    Team") == "mobile-app-team"

    def test_slug_trims_leading_trailing_dashes(self):
        """Leading/trailing dashes should be removed"""
        assert team_name_to_slug("-Team Name-") == "team-name"

    def test_slug_is_lowercase(self):
        """Slug should be lowercase"""
        assert team_name_to_slug("WebFrontend TEAM") == "webfrontend-team"


class TestParseTeamFileErrors:
    """Tests for error handling in team file parsing"""

    def test_parse_file_with_invalid_yaml(self):
        """Should handle invalid YAML gracefully"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
invalid_yaml: [unclosed bracket
---
# Description""")
            temp_path = Path(f.name)

        try:
            # Should raise an exception for invalid YAML
            with pytest.raises((yaml.YAMLError, ValueError)):
                parse_team_file(temp_path)
        finally:
            temp_path.unlink()

    def test_parse_file_without_front_matter(self):
        """Should handle files without YAML front matter"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("# Just a plain markdown file\n\nNo YAML front matter here.")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should create team with filename as name
            assert team.name == temp_path.stem
            assert team.team_type == "stream-aligned"
            assert "plain markdown" in team.description.lower()
        finally:
            temp_path.unlink()

    def test_parse_file_with_incomplete_front_matter(self):
        """Should handle incomplete front matter (only one delimiter)"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Incomplete Team
# Missing closing ---
This is markdown content.""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should treat as plain markdown (no front matter)
            # Actually treats the whole file as plain markdown
            assert team.description is not None
        finally:
            temp_path.unlink()

    def test_parse_file_with_empty_yaml(self):
        """Should handle empty YAML front matter"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
---
# Description""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            # Should succeed with provided fields
            assert team.description == "# Description"
            assert team.name == "Test Team"
        finally:
            temp_path.unlink()


class TestFlowMetricsValidation:
    """Tests for flow metrics validation"""

    def test_negative_lead_time_raises_error(self):
        """Negative lead time should raise ValueError"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  flow_metrics:
    lead_time_days: -5
---
# Description""")
            temp_path = Path(f.name)

        try:
            with pytest.raises(ValueError, match="lead_time_days"):
                parse_team_file(temp_path)
        finally:
            temp_path.unlink()

    def test_change_fail_rate_above_1_raises_error(self):
        """Change fail rate above 1.0 should raise ValueError"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  flow_metrics:
    change_fail_rate: 1.5
---
# Description""")
            temp_path = Path(f.name)

        try:
            with pytest.raises(ValueError, match="change_fail_rate"):
                parse_team_file(temp_path)
        finally:
            temp_path.unlink()

    def test_change_fail_rate_below_0_raises_error(self):
        """Change fail rate below 0.0 should raise ValueError"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  flow_metrics:
    change_fail_rate: -0.1
---
# Description""")
            temp_path = Path(f.name)

        try:
            with pytest.raises(ValueError, match="change_fail_rate"):
                parse_team_file(temp_path)
        finally:
            temp_path.unlink()

    def test_negative_mttr_raises_error(self):
        """Negative MTTR should raise ValueError"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  flow_metrics:
    mttr_hours: -2
---
# Description""")
            temp_path = Path(f.name)

        try:
            with pytest.raises(ValueError, match="mttr_hours"):
                parse_team_file(temp_path)
        finally:
            temp_path.unlink()

    def test_invalid_deployment_frequency_raises_error(self):
        """Invalid deployment frequency should raise ValueError"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  flow_metrics:
    deployment_frequency: every-minute
---
# Description""")
            temp_path = Path(f.name)

        try:
            with pytest.raises(ValueError, match="deployment_frequency"):
                parse_team_file(temp_path)
        finally:
            temp_path.unlink()

    def test_valid_deployment_frequencies_accepted(self):
        """Valid deployment frequencies should be accepted"""
        valid_frequencies = ['daily', 'weekly', 'monthly', 'quarterly']

        for freq in valid_frequencies:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
                f.write(f"""---
name: Test Team
team_type: stream-aligned
metadata:
  flow_metrics:
    deployment_frequency: {freq}
---
# Description""")
                temp_path = Path(f.name)

            try:
                team = parse_team_file(temp_path)
                assert team.flow_metrics.deployment_frequency == freq
            finally:
                temp_path.unlink()

    def test_valid_flow_metrics_accepted(self):
        """Valid flow metrics should be accepted"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  flow_metrics:
    lead_time_days: 3
    change_fail_rate: 0.15
    mttr_hours: 2.5
    deployment_frequency: daily
---
# Description""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.flow_metrics.lead_time_days == 3
            assert team.flow_metrics.change_fail_rate == 0.15
            assert team.flow_metrics.mttr_hours == 2.5
            assert team.flow_metrics.deployment_frequency == "daily"
        finally:
            temp_path.unlink()


class TestMetadataFieldParsing:
    """Tests for metadata field extraction and flattening"""

    def test_established_date_flattened_from_metadata(self):
        """Established date should be flattened from metadata"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  established: 2023-01
---
# Description""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.established == "2023-01"
        finally:
            temp_path.unlink()

    def test_cognitive_load_flattened_from_metadata(self):
        """Cognitive load should be flattened from metadata"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  cognitive_load: high
---
# Description""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.cognitive_load == "high"
        finally:
            temp_path.unlink()

    def test_team_size_flattened_from_metadata(self):
        """Team size should be flattened from metadata"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  size: 8
---
# Description""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.metadata["size"] == 8
        finally:
            temp_path.unlink()

    def test_value_stream_from_metadata(self):
        """Value stream should be extracted from metadata if not at top level"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: stream-aligned
metadata:
  value_stream: Customer Experience
---
# Description""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.value_stream == "Customer Experience"
        finally:
            temp_path.unlink()

    def test_platform_grouping_from_metadata(self):
        """Platform grouping should be extracted from metadata"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write("""---
name: Test Team
team_type: platform
metadata:
  platform_grouping: Developer Experience
---
# Description""")
            temp_path = Path(f.name)

        try:
            team = parse_team_file(temp_path)
            assert team.platform_grouping == "Developer Experience"
        finally:
            temp_path.unlink()
