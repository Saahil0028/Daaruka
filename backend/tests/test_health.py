import os
from unittest.mock import patch


def test_health_check_returns_healthy_status(client):
    """Test that GET /api/v1/health returns a healthy status and valid dictionary."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data is not None
    assert data.get("status") == "healthy"
    assert data.get("database") == "connected"
    assert "postgis_info" in data
    assert data.get("service") == "Darukaa.Earth Backend API"


def test_public_config_with_valid_mapbox_token(client):
    """Test that public config returns valid Mapbox pk tokens."""
    valid_token = "pk.eyJ1IjoidGVzdHVzZXIiLCJhIjoiY2xleGFtcGxlMTIzNDU2Nzg5MCJ9.abcdef"
    with patch.dict(os.environ, {"MAPBOX_TOKEN": valid_token}):
        response = client.get("/api/v1/health/config")
        assert response.status_code == 200
        data = response.json()
        assert data.get("mapbox_token") == valid_token


def test_public_config_never_leaks_secret_token(client):
    """Ensure secret keys (like sk. Mapbox admin tokens or arbitrary secrets) are NOT leaked."""
    secret_token = "sk.eyJ1IjoidGVzdHVzZXIiLCJhIjoiY2xleGFtcGxlOTk5OTk5OTk5MCJ9.secretkey123"
    with patch.dict(os.environ, {"MAPBOX_TOKEN": secret_token}):
        response = client.get("/api/v1/health/config")
        assert response.status_code == 200
        data = response.json()
        assert data.get("mapbox_token") == ""
        assert secret_token not in str(data)


def test_public_config_ignores_example_tokens(client):
    """Ensure example placeholder tokens are not returned."""
    example_token = "pk.example.placeholder"
    with patch.dict(os.environ, {"MAPBOX_TOKEN": example_token}):
        response = client.get("/api/v1/health/config")
        assert response.status_code == 200
        data = response.json()
        assert data.get("mapbox_token") == ""
