def test_multi_tenant_authorization_isolation(client):
    # Register User A
    client.post("/api/v1/auth/register", json={
        "name": "User A", "email": "usera@darukaa.earth", "password": "Password123!"
    })
    token_a = client.post("/api/v1/auth/login", json={
        "email": "usera@darukaa.earth", "password": "Password123!"
    }).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register User B
    client.post("/api/v1/auth/register", json={
        "name": "User B", "email": "userb@darukaa.earth", "password": "Password123!"
    })

    token_b = client.post("/api/v1/auth/login", json={
        "email": "userb@darukaa.earth", "password": "Password123!"
    }).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A creates a project
    proj_a = client.post("/api/v1/projects", json={
        "name": "User A Private Reserve",
        "category": "Biodiversity Conservation",
        "region": "Costa Rica",
        "start_date": "2026-01-01"
    }, headers=headers_a).json()

    # User B attempts to access User A's project -> 404 / Unauthorized
    res_b_access = client.get(f"/api/v1/projects/{proj_a['id']}", headers=headers_b)
    assert res_b_access.status_code == 404

    # User B attempts to delete User A's project -> 404 / Unauthorized
    res_b_delete = client.delete(f"/api/v1/projects/{proj_a['id']}", headers=headers_b)
    assert res_b_delete.status_code == 404

    # Confirm project still exists for User A
    res_a_confirm = client.get(f"/api/v1/projects/{proj_a['id']}", headers=headers_a)
    assert res_a_confirm.status_code == 200
