import pytest
from backend.services import parse_team_file
from pathlib import Path
import tempfile

# Test parsing of new Team API fields (team_api, purpose, established, cognitive_load, etc.)
def test_parse_team_api_fields():
    content = '''---
name: API Gateway Platform Team
team_type: platform
position:
  x: 100
  y: 200
metadata:
  size: 8
  cognitive_load: high
  established: "2024-01"
team_api:
  purpose: "Provide API gateway and service mesh as internal platform"
  services_provided:
    - "Kong API Gateway (https://api-gateway.internal)"
    - "Istio Service Mesh (mTLS, traffic management)"
  contact:
    slack: "#platform-api-gateway"
    email: "api-gateway@company.com"
    wiki: "https://wiki.company.com/api-gateway"
  sla: "99.9% uptime, <100ms P95 latency, 4-hour incident response"
  consumers:
    - "E-commerce Checkout Team"
    - "Mobile App Team"
  working_hours: "9am-5pm EST, on-call rotation for P1 incidents"
---
# API Gateway Platform Team
This is the description.
'''
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
        f.write(content)
        file_path = Path(f.name)
    team = parse_team_file(file_path)
    assert team.name == "API Gateway Platform Team"
    assert team.team_type == "platform"
    assert team.position['x'] == 100
    assert team.position['y'] == 200
    assert team.metadata['size'] == 8
    assert team.metadata['cognitive_load'] == "high"
    assert team.metadata['established'] == "2024-01"
    assert team.team_api is not None
    assert team.team_api.purpose == "Provide API gateway and service mesh as internal platform"
    assert team.team_api.services_provided == ["Kong API Gateway (https://api-gateway.internal)", "Istio Service Mesh (mTLS, traffic management)"]
    assert team.team_api.contact['slack'] == "#platform-api-gateway"
    assert team.team_api.contact['email'] == "api-gateway@company.com"
    assert team.team_api.contact['wiki'] == "https://wiki.company.com/api-gateway"
    assert team.team_api.sla == "99.9% uptime, <100ms P95 latency, 4-hour incident response"
    assert team.team_api.consumers == ["E-commerce Checkout Team", "Mobile App Team"]
    assert team.team_api.working_hours == "9am-5pm EST, on-call rotation for P1 incidents"
    assert "API Gateway Platform Team" in team.description
    file_path.unlink()

def test_parse_purpose_and_flattened_fields():
    content = '''---
name: Data Platform Team
team_type: platform
purpose: "Provide scalable data platform for analytics and ML"
position:
  x: 150
  y: 250
metadata:
  size: 7
  cognitive_load: medium
  established: "2023-11"
---
# Data Platform Team
Description here.
'''
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
        f.write(content)
        file_path = Path(f.name)
    team = parse_team_file(file_path)
    assert team.purpose == "Provide scalable data platform for analytics and ML"
    assert team.metadata['established'] == "2023-11"
    assert team.metadata['cognitive_load'] == "medium"
    file_path.unlink()
