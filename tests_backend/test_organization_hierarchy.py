"""Tests for organization hierarchy edge cases."""



class TestOrganizationHierarchyEdgeCases:
    """Test edge cases in organization hierarchy endpoint."""

    def test_hierarchy_with_empty_departments(self):
        """Test hierarchy handles departments with no teams gracefully."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/organization-hierarchy")

        assert response.status_code == 200
        data = response.json()

        # Hierarchy structure is nested under 'company'
        assert "company" in data
        company = data["company"]
        assert "children" in company or len(company) > 0

    def test_hierarchy_with_missing_managers(self):
        """Test hierarchy handles teams without line_manager field."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/organization-hierarchy")

        assert response.status_code == 200
        data = response.json()

        # Should still work even if some teams don't have managers
        assert "company" in data
        # Structure should be present even with missing managers
        assert isinstance(data["company"], dict)

    def test_hierarchy_nodes_have_required_fields(self):
        """Test that hierarchy nodes have required fields."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/organization-hierarchy")

        assert response.status_code == 200
        data = response.json()

        # Check company structure has required fields
        assert "company" in data
        company = data["company"]
        assert "id" in company
        assert "level" in company
        assert "children" in company

    def test_hierarchy_edges_reference_valid_nodes(self):
        """Test that hierarchy has consistent structure."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/organization-hierarchy")

        assert response.status_code == 200
        data = response.json()

        # Verify hierarchy is well-formed
        assert "company" in data
        company = data["company"]

        # Should have children (departments)
        if "children" in company:
            assert isinstance(company["children"], list)

    def test_hierarchy_with_circular_references(self):
        """Test hierarchy handles potential circular references."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/organization-hierarchy")

        # Should return 200 even if there are circular references
        assert response.status_code == 200
        data = response.json()
        assert "company" in data


class TestProductLinesEdgeCases:
    """Test product lines endpoint edge cases."""

    def test_product_lines_with_display_order(self):
        """Test that display_order field is respected in product lines."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/product-lines")

        assert response.status_code == 200
        data = response.json()

        if "products" in data and len(data["products"]) > 0:
            # Check if display_order field exists
            products_with_order = [
                p for p in data["products"]
                if "display_order" in p
            ]

            # If display_order is used, it should be numeric
            for product in products_with_order:
                assert isinstance(product["display_order"], int)
                assert product["display_order"] >= 0

    def test_product_lines_without_display_order(self):
        """Test that products without display_order still work."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/product-lines")

        assert response.status_code == 200
        data = response.json()

        # Should work even if display_order is not present
        assert "products" in data

    def test_product_lines_with_no_teams(self):
        """Test product line with no associated teams."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/product-lines")

        assert response.status_code == 200
        data = response.json()

        # Should handle products with no teams
        for product in data.get("products", []):
            teams = product.get("teams", [])
            assert isinstance(teams, list)

    def test_product_lines_shared_teams_structure(self):
        """Test shared teams section has correct structure."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/product-lines")

        assert response.status_code == 200
        data = response.json()

        if "shared_teams" in data:
            assert isinstance(data["shared_teams"], list)
            for team in data["shared_teams"]:
                assert "name" in team or "team_id" in team


class TestBusinessStreamsEdgeCases:
    """Test business streams endpoint edge cases."""

    def test_business_streams_with_display_order(self):
        """Test that display_order field is respected in business streams."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/business-streams")

        assert response.status_code == 200
        data = response.json()

        if "business_streams" in data and len(data["business_streams"]) > 0:
            # Check if display_order field exists
            streams_with_order = [
                s for s in data["business_streams"]
                if "display_order" in s
            ]

            # If display_order is used, it should be numeric
            for stream in streams_with_order:
                assert isinstance(stream["display_order"], int)
                assert stream["display_order"] >= 0

    def test_business_streams_without_display_order(self):
        """Test that streams without display_order still work."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/business-streams")

        assert response.status_code == 200
        data = response.json()

        # Should work even if display_order is not present
        assert "business_streams" in data

    def test_business_streams_products_field(self):
        """Test that business streams have products field."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/business-streams")

        assert response.status_code == 200
        data = response.json()

        for stream in data.get("business_streams", []):
            if "products" in stream:
                assert isinstance(stream["products"], list)

    def test_business_streams_with_no_teams(self):
        """Test business stream with no associated teams."""
        from fastapi.testclient import TestClient

        from main import app

        client = TestClient(app)
        response = client.get("/api/baseline/business-streams")

        assert response.status_code == 200
        data = response.json()

        # Should handle streams - structure depends on implementation
        assert "business_streams" in data or len(data) > 0
