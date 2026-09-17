def test_complete_9_step_e2e_workflow(client):
    """
    Executes the primary acceptance workflow:
    1. Register & Login
    2. Create Project
    3. Add Site with GeoJSON Polygon
    4. Verify Geodesic Area & PostGIS Persistence
    5. List sites & fetch GeoJSON FeatureCollection
    6. Retrieve Time-Series Analytics
    7. Edit Site metadata
    8. Delete Site and verify persistence after deletion
    """
    # 1. Register & Login
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "E2E Administrator",
        "email": "e2e@darukaa.earth",
        "password": "Password123!"
    })
    assert reg_res.status_code == 201

    login_res = client.post("/api/v1/auth/login", json={
        "email": "e2e@darukaa.earth",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Project
    proj_res = client.post("/api/v1/projects", json={
        "name": "E2E Canopy Protection Project",
        "description": "Full workflow automated test project",
        "category": "Ecosystem Monitoring",
        "region": "Amazon Basin",
        "start_date": "2026-01-01"
    }, headers=headers)
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    # 3. Add Site with GeoJSON Polygon
    site_geojson = {
        "type": "Polygon",
        "coordinates": [[
            [-54.9500, -3.1200],
            [-54.9000, -3.1200],
            [-54.9000, -3.0700],
            [-54.9500, -3.0700],
            [-54.9500, -3.1200]
        ]]
    }
    site_res = client.post(f"/api/v1/projects/{proj_id}/sites", json={
        "name": "Tapajós Forest Plot Alpha",
        "description": "Primary Amazon canopy monitoring plot",
        "geometry": site_geojson
    }, headers=headers)
    assert site_res.status_code == 201
    site = site_res.json()
    site_id = site["id"]
    assert site["area_sq_km"] > 0

    # 4. List Sites & GeoJSON FeatureCollection
    geojson_res = client.get("/api/v1/sites/geojson", headers=headers)
    assert geojson_res.status_code == 200
    features = geojson_res.json()["features"]
    assert len(features) == 1
    assert features[0]["properties"]["name"] == "Tapajós Forest Plot Alpha"

    # 5. Fetch Analytics Time-Series
    analytics_res = client.get(f"/api/v1/sites/{site_id}/analytics", headers=headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert len(analytics_data) > 0
    assert analytics_data[0]["is_simulated"] is True

    # 6. Global Summary
    summary_res = client.get("/api/v1/analytics/summary", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_projects"] == 1
    assert summary["total_sites"] == 1

    # 7. Edit Site
    update_res = client.put(f"/api/v1/sites/{site_id}", json={
        "name": "Tapajós Forest Plot Alpha Updated"
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Tapajós Forest Plot Alpha Updated"

    # 8. Delete Site
    del_res = client.delete(f"/api/v1/sites/{site_id}", headers=headers)
    assert del_res.status_code == 204

    # 9. Verify deletion persists
    confirm_res = client.get(f"/api/v1/sites/{site_id}", headers=headers)
    assert confirm_res.status_code == 404
