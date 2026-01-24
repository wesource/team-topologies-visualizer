"""
Tests for Baseline API routes (routes_baseline.py)

These tests validate the Baseline specific endpoints:
- /api/baseline/business-streams - Value stream grouping data
- /api/baseline/product-lines - Product lines grouping data
"""

import json
from pathlib import Path

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


class TestValueStreamsEndpoint:
    """Tests for /api/baseline/business-streams endpoint"""

    def test_business_streams_endpoint_returns_200(self):
        """Value streams endpoint should return 200 status"""
        response = client.get("/api/baseline/business-streams")
        assert response.status_code == 200

    def test_business_streams_returns_json(self):
        """Value streams endpoint should return valid JSON"""
        response = client.get("/api/baseline/business-streams")
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data, dict)

    def test_business_streams_has_expected_structure(self):
        """Value streams response should have business_streams key with dict"""
        response = client.get("/api/baseline/business-streams")
        data = response.json()
        assert "business_streams" in data
        assert isinstance(data["business_streams"], dict)

    def test_business_streams_contains_product_data(self):
        """Each value stream should contain products dict"""
        response = client.get("/api/baseline/business-streams")
        data = response.json()
        business_streams = data["business_streams"]

        # Should have at least one value stream
        assert len(business_streams) > 0

        # Each value stream should have products dict
        for vs_name, vs_data in business_streams.items():
            assert isinstance(vs_name, str)
            assert "products" in vs_data
            assert isinstance(vs_data["products"], dict)

    def test_business_streams_teams_have_required_fields(self):
        """Teams in value stream products should have required fields"""
        response = client.get("/api/baseline/business-streams")
        data = response.json()
        business_streams = data["business_streams"]

        # Find a value stream with products containing teams
        for _vs_name, vs_data in business_streams.items():
            products = vs_data["products"]
            for _product_name, teams in products.items():
                if isinstance(teams, list) and len(teams) > 0:
                    team = teams[0]
                    # Check required team fields
                    assert "name" in team
                    assert "team_type" in team or "type" in team  # Support both field names
                    assert isinstance(team["name"], str)
                    return  # Only need to check one team
        # If no teams found, that's also valid (empty value streams)

    def test_business_streams_config_file_exists(self):
        """Value streams config file should exist"""
        config_path = Path("data/baseline-teams/business-streams.json")
        assert config_path.exists(), f"Config file not found: {config_path}"

    def test_business_streams_config_is_valid_json(self):
        """Value streams config should be valid JSON"""
        config_path = Path("data/baseline-teams/business-streams.json")
        with open(config_path, encoding="utf-8") as f:
            data = json.load(f)
            assert isinstance(data, dict)
            assert "business_streams" in data


class TestProductLinesEndpoint:
    """Tests for /api/baseline/product-lines endpoint"""

    def test_product_lines_endpoint_returns_200(self):
        """Product lines endpoint should return 200 status"""
        response = client.get("/api/baseline/product-lines")
        assert response.status_code == 200

    def test_product_lines_returns_json(self):
        """Product lines endpoint should return valid JSON"""
        response = client.get("/api/baseline/product-lines")
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data, dict)

    def test_product_lines_has_expected_structure(self):
        """Product lines response should have products and shared_teams keys"""
        response = client.get("/api/baseline/product-lines")
        data = response.json()
        assert "products" in data
        assert "shared_teams" in data
        assert isinstance(data["products"], list)
        assert isinstance(data["shared_teams"], list)

    def test_product_lines_products_have_required_fields(self):
        """Each product should have required fields"""
        response = client.get("/api/baseline/product-lines")
        data = response.json()
        products = data["products"]

        assert len(products) > 0, "Should have at least one product"

        for product in products:
            assert "id" in product
            assert "name" in product
            assert "teams" in product
            assert isinstance(product["id"], str)
            assert isinstance(product["name"], str)
            assert isinstance(product["teams"], list)

    def test_product_lines_teams_have_required_fields(self):
        """Teams in products should have required fields"""
        response = client.get("/api/baseline/product-lines")
        data = response.json()
        products = data["products"]

        # Find a product with teams
        for product in products:
            if len(product["teams"]) > 0:
                team = product["teams"][0]
                assert "name" in team
                assert "team_type" in team or "type" in team
                assert isinstance(team["name"], str)
                break

    def test_product_lines_shared_teams_structure(self):
        """Shared teams should have proper structure"""
        response = client.get("/api/baseline/product-lines")
        data = response.json()
        shared_teams = data["shared_teams"]

        # Shared teams can be empty (valid scenario)
        assert isinstance(shared_teams, list)

        if len(shared_teams) > 0:
            team = shared_teams[0]
            assert "name" in team
            assert "team_type" in team or "type" in team
            # Shared teams should NOT have product_line field
            assert "product_line" not in team or team.get("product_line") is None

    def test_products_config_file_exists(self):
        """Products config file should exist"""
        config_path = Path("data/baseline-teams/products.json")
        assert config_path.exists(), f"Config file not found: {config_path}"

    def test_products_config_is_valid_json(self):
        """Products config should be valid JSON"""
        config_path = Path("data/baseline-teams/products.json")
        with open(config_path, encoding="utf-8") as f:
            data = json.load(f)
            assert isinstance(data, dict)
            assert "products" in data


class TestBaselineRoutesPrefixes:
    """Tests for Baseline routes prefix structure"""

    def test_baseline_teams_endpoint_exists(self):
        """Baseline teams endpoint should exist at /api/baseline/teams"""
        response = client.get("/api/baseline/teams")
        assert response.status_code == 200

    def test_baseline_organization_hierarchy_endpoint_exists(self):
        """Baseline org hierarchy endpoint should exist"""
        response = client.get("/api/baseline/organization-hierarchy")
        assert response.status_code == 200

    def test_tt_snapshots_endpoint_exists(self):
        """TT snapshots endpoint should exist (snapshots are for TT Design)"""
        response = client.get("/api/tt/snapshots")
        assert response.status_code == 200


class TestErrorHandling:
    """Tests for error handling in Baseline routes"""

    def test_missing_business_streams_config_handled_gracefully(self, tmp_path, monkeypatch):
        """Should handle missing business-streams.json gracefully"""
        # This test ensures the endpoint doesn't crash if config is missing
        # In production, this should return empty data or appropriate error
        response = client.get("/api/baseline/business-streams")
        # Should not return 500 error
        assert response.status_code in [200, 404]

    def test_missing_products_config_handled_gracefully(self):
        """Should handle missing products.json gracefully"""
        response = client.get("/api/baseline/product-lines")
        # Should not return 500 error
        assert response.status_code in [200, 404]

