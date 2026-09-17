def test_create_site_valid_polygon(client):
    # Register & Login
    client.post("/api/v1/auth/register", json={
        "name": "Geospatial Admin", "email": "geo@darukaa.earth", "password": "Password123!"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": "geo@darukaa.earth", "password": "Password123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Project
    proj = client.post("/api/v1/projects", json={
        "name": "Western Ghats Site Test",
        "category": "Reforestation",
        "region": "India",
        "start_date": "2026-01-01"
    }, headers=headers).json()

    # Valid Polygon GeoJSON
    valid_geojson = {
        "type": "Polygon",
        "coordinates": [[
            [76.1200, 11.6000],
            [76.1500, 11.6000],
            [76.1500, 11.6300],
            [76.1200, 11.6300],
            [76.1200, 11.6000]
        ]]
    }

    # Create Site
    site_res = client.post(f"/api/v1/projects/{proj['id']}/sites", json={
        "name": "Nilgiris Plot 1",
        "description": "Test rainforest canopy sector",
        "geometry": valid_geojson
    }, headers=headers)

    assert site_res.status_code == 201
    site_data = site_res.json()
    assert site_data["name"] == "Nilgiris Plot 1"
    assert site_data["area_sq_km"] > 0
    assert site_data["area_ha"] > 0
    assert site_data["geometry"]["type"] == "Polygon"

def test_create_site_invalid_self_intersecting_polygon(client):
    # Register & Login
    client.post("/api/v1/auth/register", json={
        "name": "Invalid Geo Admin", "email": "invalidgeo@darukaa.earth", "password": "Password123!"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": "invalidgeo@darukaa.earth", "password": "Password123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    proj = client.post("/api/v1/projects", json={
        "name": "Invalid Geo Test Proj",
        "category": "Other",
        "region": "Test",
        "start_date": "2026-01-01"
    }, headers=headers).json()

    # Self-intersecting bowtie polygon (invalid)
    invalid_bowtie_geojson = {
        "type": "Polygon",
        "coordinates": [[
            [0, 0],
            [1, 1],
            [0, 1],
            [1, 0],
            [0, 0]
        ]]
    }

    site_res = client.post(f"/api/v1/projects/{proj['id']}/sites", json={
        "name": "Bowtie Invalid Site",
        "geometry": invalid_bowtie_geojson
    }, headers=headers)

    assert site_res.status_code == 400
    assert "Invalid geometry" in site_res.json()["detail"]
