def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test Administrator",
            "email": "testadmin@darukaa.earth",
            "password": "Password123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testadmin@darukaa.earth"
    assert "id" in data
    assert "password_hash" not in data # Passwords must not be exposed

def test_register_duplicate_email(client):
    user_payload = {
        "name": "Test User",
        "email": "duplicate@darukaa.earth",
        "password": "Password123!"
    }
    client.post("/api/v1/auth/register", json=user_payload)
    response = client.post("/api/v1/auth/register", json=user_payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client):
    user_payload = {
        "name": "Test Login User",
        "email": "login@darukaa.earth",
        "password": "Password123!"
    }
    client.post("/api/v1/auth/register", json=user_payload)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@darukaa.earth", "password": "Password123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password(client):
    user_payload = {
        "name": "Test Invalid Pass",
        "email": "invalidpass@darukaa.earth",
        "password": "Password123!"
    }
    client.post("/api/v1/auth/register", json=user_payload)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "invalidpass@darukaa.earth", "password": "WrongPassword!"}
    )
    assert response.status_code == 401

def test_get_me_unauthenticated(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
