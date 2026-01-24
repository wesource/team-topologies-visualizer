"""Tests for READ_ONLY_MODE environment variable functionality"""
import os
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


@pytest.fixture
def enable_read_only_mode():
    """Fixture to temporarily enable READ_ONLY_MODE"""
    with patch.dict(os.environ, {"READ_ONLY_MODE": "true"}):
        yield


@pytest.fixture
def disable_read_only_mode():
    """Fixture to ensure READ_ONLY_MODE is disabled"""
    with patch.dict(os.environ, {"READ_ONLY_MODE": "false"}):
        yield


def test_baseline_position_blocked_in_read_only_mode(enable_read_only_mode):
    """Test that Baseline position updates are blocked in read-only mode"""
    response = client.patch(
        "/api/baseline/teams/test-team/position",
        json={"x": 100, "y": 200}
    )
    assert response.status_code == 403
    assert "demo mode" in response.json()["detail"].lower()


def test_tt_position_blocked_in_read_only_mode(enable_read_only_mode):
    """Test that TT position updates are blocked in read-only mode"""
    response = client.patch(
        "/api/tt/teams/test-team/position",
        json={"x": 100, "y": 200}
    )
    assert response.status_code == 403
    assert "demo mode" in response.json()["detail"].lower()


def test_snapshot_creation_blocked_in_read_only_mode(enable_read_only_mode):
    """Test that snapshot creation is blocked in read-only mode"""
    response = client.post(
        "/api/tt/snapshots/create",
        json={"name": "Test Snapshot", "description": "Test"}
    )
    assert response.status_code == 403
    assert "demo mode" in response.json()["detail"].lower()


def test_position_allowed_in_normal_mode(disable_read_only_mode):
    """Test that position updates work when read-only mode is disabled"""
    # This will fail with 404 (team doesn't exist) but NOT 403 (forbidden)
    response = client.patch(
        "/api/tt/teams/nonexistent-team/position",
        json={"x": 100, "y": 200}
    )
    # Should be 404 (not found), not 403 (forbidden)
    assert response.status_code == 404


def test_config_endpoint_reports_read_only_status():
    """Test that /api/config endpoint correctly reports read-only mode status"""
    # Test with read-only enabled
    with patch.dict(os.environ, {"READ_ONLY_MODE": "true"}):
        response = client.get("/api/config")
        assert response.status_code == 200
        assert response.json()["readOnlyMode"] is True

    # Test with read-only disabled
    with patch.dict(os.environ, {"READ_ONLY_MODE": "false"}):
        response = client.get("/api/config")
        assert response.status_code == 200
        assert response.json()["readOnlyMode"] is False
