"""Unit tests for individual validation rules in validation_rules.py.

These tests focus on the validate_product_line and validate_business_stream
functions that check Baseline team references against config files.
"""
import pytest

from backend.validation_rules import (
    ValidationContext,
    validate_business_stream,
    validate_product_line,
)


def create_baseline_context(
    product_lines: list[str] | None = None,
    business_streams: list[str] | None = None,
) -> ValidationContext:
    """Create a ValidationContext for baseline view testing."""
    return ValidationContext(
        view="baseline",
        file_name="test-team.md",
        valid_types=["feature-team", "component-team"],
        all_team_names=set(),
        valid_product_lines=product_lines or [],
        valid_business_streams=business_streams or [],
    )


def create_tt_context() -> ValidationContext:
    """Create a ValidationContext for TT Design view testing."""
    return ValidationContext(
        view="tt",
        file_name="test-team.md",
        valid_types=["stream-aligned", "platform", "enabling", "complicated-subsystem"],
        all_team_names=set(),
        valid_product_lines=[],
        valid_business_streams=[],
    )


class TestValidateProductLine:
    """Tests for validate_product_line function."""

    def test_valid_product_line_exact_match(self):
        """Should pass when product_line matches exactly."""
        ctx = create_baseline_context(product_lines=["Product A", "Product B"])
        data = {"product_line": "Product A"}

        errors, warnings = validate_product_line(data, ctx)

        assert errors == []
        assert warnings == []

    def test_valid_product_line_case_insensitive(self):
        """Should pass when product_line matches with different case."""
        ctx = create_baseline_context(product_lines=["Product Alpha"])
        data = {"product_line": "product alpha"}

        errors, warnings = validate_product_line(data, ctx)

        assert errors == []
        assert warnings == []

    def test_valid_product_line_leading_trailing_whitespace(self):
        """Should pass when product_line has leading/trailing whitespace."""
        ctx = create_baseline_context(product_lines=["Product Beta"])
        data = {"product_line": "  Product Beta  "}  # Extra leading/trailing spaces

        errors, warnings = validate_product_line(data, ctx)

        assert errors == []
        assert warnings == []

    def test_invalid_product_line_warns(self):
        """Should warn when product_line is not in config."""
        ctx = create_baseline_context(product_lines=["Product A", "Product B"])
        data = {"product_line": "Product C"}

        errors, warnings = validate_product_line(data, ctx)

        assert errors == []
        assert len(warnings) == 1
        assert "Product C" in warnings[0]
        assert "not found in products.json" in warnings[0]
        assert "Product A" in warnings[0]
        assert "Product B" in warnings[0]

    def test_missing_product_line_field_no_warning(self):
        """Should not warn when product_line field is missing."""
        ctx = create_baseline_context(product_lines=["Product A"])
        data = {"name": "Test Team"}  # No product_line field

        errors, warnings = validate_product_line(data, ctx)

        assert errors == []
        assert warnings == []

    def test_empty_product_line_no_warning(self):
        """Should not warn when product_line is empty."""
        ctx = create_baseline_context(product_lines=["Product A"])
        data = {"product_line": ""}

        errors, warnings = validate_product_line(data, ctx)

        assert errors == []
        assert warnings == []

    def test_tt_view_skipped(self):
        """Should skip validation for TT Design view."""
        ctx = create_tt_context()
        data = {"product_line": "Nonexistent Product"}

        errors, warnings = validate_product_line(data, ctx)

        assert errors == []
        assert warnings == []

    def test_empty_config_always_warns(self):
        """Should warn when config has no valid products."""
        ctx = create_baseline_context(product_lines=[])
        data = {"product_line": "Any Product"}

        errors, warnings = validate_product_line(data, ctx)

        assert errors == []
        assert len(warnings) == 1
        assert "not found in products.json" in warnings[0]


class TestValidateBusinessStream:
    """Tests for validate_business_stream function."""

    def test_valid_business_stream_exact_match(self):
        """Should pass when business_stream matches exactly."""
        ctx = create_baseline_context(business_streams=["Core Banking", "Payments"])
        data = {"business_stream": "Core Banking"}

        errors, warnings = validate_business_stream(data, ctx)

        assert errors == []
        assert warnings == []

    def test_valid_business_stream_case_insensitive(self):
        """Should pass when business_stream matches with different case."""
        ctx = create_baseline_context(business_streams=["Core Banking"])
        data = {"business_stream": "CORE BANKING"}

        errors, warnings = validate_business_stream(data, ctx)

        assert errors == []
        assert warnings == []

    def test_valid_business_stream_leading_trailing_whitespace(self):
        """Should pass when business_stream has leading/trailing whitespace."""
        ctx = create_baseline_context(business_streams=["Core Banking"])
        data = {"business_stream": "  Core Banking  "}  # Extra leading/trailing spaces

        errors, warnings = validate_business_stream(data, ctx)

        assert errors == []
        assert warnings == []

    def test_invalid_business_stream_warns(self):
        """Should warn when business_stream is not in config."""
        ctx = create_baseline_context(business_streams=["Core Banking", "Payments"])
        data = {"business_stream": "Lending"}

        errors, warnings = validate_business_stream(data, ctx)

        assert errors == []
        assert len(warnings) == 1
        assert "Lending" in warnings[0]
        assert "not found in business-streams.json" in warnings[0]
        assert "Core Banking" in warnings[0]
        assert "Payments" in warnings[0]

    def test_missing_business_stream_field_no_warning(self):
        """Should not warn when business_stream field is missing."""
        ctx = create_baseline_context(business_streams=["Core Banking"])
        data = {"name": "Test Team"}  # No business_stream field

        errors, warnings = validate_business_stream(data, ctx)

        assert errors == []
        assert warnings == []

    def test_empty_business_stream_no_warning(self):
        """Should not warn when business_stream is empty."""
        ctx = create_baseline_context(business_streams=["Core Banking"])
        data = {"business_stream": ""}

        errors, warnings = validate_business_stream(data, ctx)

        assert errors == []
        assert warnings == []

    def test_tt_view_skipped(self):
        """Should skip validation for TT Design view."""
        ctx = create_tt_context()
        data = {"business_stream": "Nonexistent Stream"}

        errors, warnings = validate_business_stream(data, ctx)

        assert errors == []
        assert warnings == []

    def test_empty_config_always_warns(self):
        """Should warn when config has no valid business streams."""
        ctx = create_baseline_context(business_streams=[])
        data = {"business_stream": "Any Stream"}

        errors, warnings = validate_business_stream(data, ctx)

        assert errors == []
        assert len(warnings) == 1
        assert "not found in business-streams.json" in warnings[0]


class TestIntegrationWithValidateAllTeamFiles:
    """Integration tests verifying warnings appear in full validation."""

    @pytest.fixture
    def temp_baseline_dir(self, tmp_path):
        """Create temp baseline directory with config files."""
        baseline_dir = tmp_path / "baseline-teams"
        baseline_dir.mkdir()
        return baseline_dir

    def _write_team_types_config(self, baseline_dir):
        """Write baseline-team-types.json config."""
        import json
        config = {"team_types": [{"id": "feature-team", "name": "Feature Team", "color": "#3498db"}]}
        (baseline_dir / "baseline-team-types.json").write_text(json.dumps(config))

    def _write_products_config(self, baseline_dir, products: list[str]):
        """Write products.json config."""
        import json
        config = {"products": [{"name": p, "color": "#fff"} for p in products]}
        (baseline_dir / "products.json").write_text(json.dumps(config))

    def _write_streams_config(self, baseline_dir, streams: list[str]):
        """Write business-streams.json config."""
        import json
        config = {"business_streams": [{"name": s, "color": "#fff"} for s in streams]}
        (baseline_dir / "business-streams.json").write_text(json.dumps(config))

    def _write_team_file(self, baseline_dir, name, product_line=None, business_stream=None):
        """Write a team markdown file."""
        yaml_parts = [f"name: {name}", "team_type: feature-team"]
        if product_line:
            yaml_parts.append(f"product_line: {product_line}")
        if business_stream:
            yaml_parts.append(f"business_stream: {business_stream}")

        content = f"---\n{chr(10).join(yaml_parts)}\n---\n# {name}\n"
        filename = name.lower().replace(" ", "-") + ".md"
        (baseline_dir / filename).write_text(content)

    def test_full_validation_catches_invalid_product_line(
        self, temp_baseline_dir, monkeypatch
    ):
        """Full validation should report product_line mismatch warning."""
        from backend.validation import validate_all_team_files

        monkeypatch.setattr(
            'backend.validation.get_data_dir',
            lambda _view: temp_baseline_dir
        )

        self._write_team_types_config(temp_baseline_dir)
        self._write_products_config(temp_baseline_dir, ["Product A", "Product B"])
        self._write_streams_config(temp_baseline_dir, ["Stream X"])
        self._write_team_file(
            temp_baseline_dir,
            "Test Team",
            product_line="Nonexistent Product"
        )

        result = validate_all_team_files("baseline")

        assert result["files_with_warnings"] == 1
        warnings = result["issues"][0]["warnings"]
        assert any("Nonexistent Product" in w and "products.json" in w for w in warnings)

    def test_full_validation_catches_invalid_business_stream(
        self, temp_baseline_dir, monkeypatch
    ):
        """Full validation should report business_stream mismatch warning."""
        from backend.validation import validate_all_team_files

        monkeypatch.setattr(
            'backend.validation.get_data_dir',
            lambda _view: temp_baseline_dir
        )

        self._write_team_types_config(temp_baseline_dir)
        self._write_products_config(temp_baseline_dir, ["Product A"])
        self._write_streams_config(temp_baseline_dir, ["Stream X", "Stream Y"])
        self._write_team_file(
            temp_baseline_dir,
            "Test Team",
            business_stream="Nonexistent Stream"
        )

        result = validate_all_team_files("baseline")

        assert result["files_with_warnings"] == 1
        warnings = result["issues"][0]["warnings"]
        assert any("Nonexistent Stream" in w and "business-streams.json" in w for w in warnings)

    def test_full_validation_valid_references_no_warnings(
        self, temp_baseline_dir, monkeypatch
    ):
        """Full validation should not warn when references are valid."""
        from backend.validation import validate_all_team_files

        monkeypatch.setattr(
            'backend.validation.get_data_dir',
            lambda _view: temp_baseline_dir
        )

        self._write_team_types_config(temp_baseline_dir)
        self._write_products_config(temp_baseline_dir, ["Product A"])
        self._write_streams_config(temp_baseline_dir, ["Stream X"])
        self._write_team_file(
            temp_baseline_dir,
            "Test Team",
            product_line="Product A",
            business_stream="Stream X"
        )

        result = validate_all_team_files("baseline")

        assert result["files_with_warnings"] == 0
        assert result["files_with_errors"] == 0
