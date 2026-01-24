"""Tests for TT-Design API routes"""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


class TestTTTeamTypesEndpoint:
    """Tests for /api/tt/team-types endpoint"""

    def test_get_team_types_returns_200(self):
        """Should return 200 OK for team types endpoint"""
        response = client.get("/api/tt/team-types")
        assert response.status_code == 200

    def test_get_team_types_returns_json(self):
        """Should return JSON content"""
        response = client.get("/api/tt/team-types")
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data, dict)

    def test_get_team_types_has_expected_structure(self):
        """Should return team types with expected keys"""
        response = client.get("/api/tt/team-types")
        data = response.json()

        # Should have team_types array
        assert "team_types" in data
        assert isinstance(data["team_types"], list)

        # Each team type should have required fields
        if len(data["team_types"]) > 0:
            team_type = data["team_types"][0]
            assert "id" in team_type
            assert "name" in team_type
            assert "color" in team_type
            assert isinstance(team_type["color"], str)


class TestTTTeamsEndpoint:
    """Tests for /api/tt/teams endpoint"""

    def test_get_teams_returns_200(self):
        """Should return 200 OK for teams list endpoint"""
        response = client.get("/api/tt/teams")
        assert response.status_code == 200

    def test_get_teams_returns_list(self):
        """Should return a list of teams"""
        response = client.get("/api/tt/teams")
        data = response.json()
        assert isinstance(data, list)

    def test_get_teams_have_required_fields(self):
        """Each team should have required fields"""
        response = client.get("/api/tt/teams")
        teams = response.json()

        if len(teams) > 0:
            team = teams[0]
            assert "name" in team
            assert "team_type" in team
            assert "position" in team


class TestTTTeamDetailEndpoint:
    """Tests for /api/tt/teams/{team_name} endpoint"""

    def test_get_team_by_name_returns_200(self):
        """Should return 200 for existing team"""
        # First get a valid team_id
        teams_response = client.get("/api/tt/teams")
        teams = teams_response.json()

        if len(teams) > 0:
            team_id = teams[0]["team_id"]
            response = client.get(f"/api/tt/teams/{team_id}")
            assert response.status_code == 200

    def test_get_nonexistent_team_returns_404(self):
        """Should return 404 for non-existent team"""
        response = client.get("/api/tt/teams/nonexistent-team-xyz")
        assert response.status_code == 404

    def test_get_team_returns_team_object(self):
        """Should return a single team object with all fields"""
        teams_response = client.get("/api/tt/teams")
        teams = teams_response.json()

        if len(teams) > 0:
            team_id = teams[0]["team_id"]
            response = client.get(f"/api/tt/teams/{team_id}")
            team = response.json()

            assert "name" in team
            assert "team_type" in team
            assert "position" in team
            assert team["team_id"] == team_id


class TestTTUpdateTeamPosition:
    """Tests for PATCH /api/tt/teams/{team_name}/position endpoint"""

    def test_update_position_returns_200(self):
        """Should return 200 when updating position"""
        teams_response = client.get("/api/tt/teams")
        teams = teams_response.json()

        if len(teams) > 0:
            team_id = teams[0]["team_id"]
            # Save original position
            original_pos = teams[0]["position"]

            response = client.patch(
                f"/api/tt/teams/{team_id}/position",
                json={"x": 100, "y": 200}
            )
            assert response.status_code == 200

            # Restore original position
            client.patch(
                f"/api/tt/teams/{team_id}/position",
                json=original_pos
            )

    def test_update_position_returns_updated_position(self):
        """Should return the updated position in response"""
        teams_response = client.get("/api/tt/teams")
        teams = teams_response.json()

        if len(teams) > 0:
            team_id = teams[0]["team_id"]
            # Save original position
            original_pos = teams[0]["position"]
            new_x, new_y = 150, 250

            response = client.patch(
                f"/api/tt/teams/{team_id}/position",
                json={"x": new_x, "y": new_y}
            )

            result = response.json()
            assert "position" in result
            assert result["position"]["x"] == new_x
            assert result["position"]["y"] == new_y

            # Restore original position
            client.patch(
                f"/api/tt/teams/{team_id}/position",
                json=original_pos
            )

    def test_update_nonexistent_team_position_returns_404(self):
        """Should return 404 when updating non-existent team"""
        response = client.patch(
            "/api/tt/teams/nonexistent-team-xyz/position",
            json={"x": 100, "y": 200}
        )
        assert response.status_code == 404

    def test_update_position_with_invalid_data_returns_422(self):
        """Should return 422 for invalid position data"""
        teams_response = client.get("/api/tt/teams")
        teams = teams_response.json()

        if len(teams) > 0:
            team_id = teams[0]["team_id"]

            # Missing required fields
            response = client.patch(
                f"/api/tt/teams/{team_id}/position",
                json={"x": 100}  # Missing 'y'
            )
            assert response.status_code == 422


class TestTTValidateEndpoint:
    """Tests for /api/tt/validate endpoint"""

    def test_validate_returns_200(self):
        """Should return 200 for validation endpoint"""
        response = client.get("/api/tt/validate")
        assert response.status_code == 200

    def test_validate_returns_validation_report(self):
        """Should return validation report with expected structure"""
        response = client.get("/api/tt/validate")
        report = response.json()

        # Validation report should have these keys
        assert "total_files" in report
        assert "files_with_errors" in report
        assert "files_with_warnings" in report
        assert "issues" in report
        assert isinstance(report["total_files"], int)
        assert isinstance(report["issues"], list)
