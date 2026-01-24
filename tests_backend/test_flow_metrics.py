"""Tests for flow metrics parsing and validation"""
import tempfile
from pathlib import Path

import pytest

from backend.services import parse_team_file


def test_parse_flow_metrics_all_fields():
    """Test parsing team file with all flow metrics fields"""
    yaml_content = """---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  size: 7
  flow_metrics:
    lead_time_days: 5
    deployment_frequency: daily
    change_fail_rate: 0.08
    mttr_hours: 1.5
---
# Test Team
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(yaml_content)
        temp_path = Path(f.name)

    try:
        team_data = parse_team_file(temp_path)
        assert team_data.flow_metrics is not None
        assert team_data.flow_metrics.lead_time_days == 5
        assert team_data.flow_metrics.deployment_frequency == 'daily'
        assert team_data.flow_metrics.change_fail_rate == 0.08
        assert team_data.flow_metrics.mttr_hours == 1.5
    finally:
        temp_path.unlink()


def test_parse_flow_metrics_partial_fields():
    """Test parsing team with only some flow metrics"""
    yaml_content = """---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  flow_metrics:
    lead_time_days: 10
    deployment_frequency: weekly
---
# Test Team
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(yaml_content)
        temp_path = Path(f.name)

    try:
        team_data = parse_team_file(temp_path)
        assert team_data.flow_metrics is not None
        assert team_data.flow_metrics.lead_time_days == 10
        assert team_data.flow_metrics.deployment_frequency == 'weekly'
        assert team_data.flow_metrics.change_fail_rate is None
        assert team_data.flow_metrics.mttr_hours is None
    finally:
        temp_path.unlink()


def test_parse_team_without_flow_metrics():
    """Test parsing team without flow metrics (should be None)"""
    yaml_content = """---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  size: 7
---
# Test Team
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(yaml_content)
        temp_path = Path(f.name)

    try:
        team_data = parse_team_file(temp_path)
        assert team_data.flow_metrics is None
    finally:
        temp_path.unlink()


def test_validate_lead_time_negative():
    """Test that negative lead time raises ValueError"""
    yaml_content = """---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  flow_metrics:
    lead_time_days: -5
---
# Test Team
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(yaml_content)
        temp_path = Path(f.name)

    try:
        with pytest.raises(ValueError, match="lead_time_days.*must be non-negative"):
            parse_team_file(temp_path)
    finally:
        temp_path.unlink()


def test_validate_change_fail_rate_out_of_range():
    """Test that change_fail_rate outside 0.0-1.0 raises ValueError"""
    yaml_content = """---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  flow_metrics:
    change_fail_rate: 1.5
---
# Test Team
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(yaml_content)
        temp_path = Path(f.name)

    try:
        with pytest.raises(ValueError, match="change_fail_rate.*must be between 0.0 and 1.0"):
            parse_team_file(temp_path)
    finally:
        temp_path.unlink()


def test_validate_mttr_negative():
    """Test that negative MTTR raises ValueError"""
    yaml_content = """---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  flow_metrics:
    mttr_hours: -2
---
# Test Team
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(yaml_content)
        temp_path = Path(f.name)

    try:
        with pytest.raises(ValueError, match="mttr_hours.*must be non-negative"):
            parse_team_file(temp_path)
    finally:
        temp_path.unlink()


def test_validate_deployment_frequency_invalid():
    """Test that invalid deployment frequency raises ValueError"""
    yaml_content = """---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  flow_metrics:
    deployment_frequency: sometimes
---
# Test Team
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(yaml_content)
        temp_path = Path(f.name)

    try:
        with pytest.raises(ValueError, match="deployment_frequency.*must be one of"):
            parse_team_file(temp_path)
    finally:
        temp_path.unlink()


def test_deployment_frequency_case_insensitive():
    """Test that deployment frequency is case-insensitive"""
    yaml_content = """---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  flow_metrics:
    deployment_frequency: DAILY
---
# Test Team
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(yaml_content)
        temp_path = Path(f.name)

    try:
        team_data = parse_team_file(temp_path)
        assert team_data.flow_metrics.deployment_frequency == 'DAILY'
    finally:
        temp_path.unlink()


def test_flow_metrics_with_zero_values():
    """Test that zero values are valid"""
    yaml_content = """---
team_id: test-team
name: Test Team
team_type: stream-aligned
position:
  x: 100
  y: 200
metadata:
  flow_metrics:
    lead_time_days: 0
    change_fail_rate: 0.0
    mttr_hours: 0
---
# Test Team
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(yaml_content)
        temp_path = Path(f.name)

    try:
        team_data = parse_team_file(temp_path)
        assert team_data.flow_metrics.lead_time_days == 0
        assert team_data.flow_metrics.change_fail_rate == 0.0
        assert team_data.flow_metrics.mttr_hours == 0
    finally:
        temp_path.unlink()
