import json
import urllib.parse
import urllib.request

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test():
    # 1. Login
    data = urllib.parse.urlencode({"username": "admin@darukaa.earth", "password": "Password123!"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        token = res["access_token"]
        print("Login SUCCESS! Token obtained.")

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Analytics Summary
    req = urllib.request.Request(f"{BASE_URL}/analytics/summary", headers=headers)
    with urllib.request.urlopen(req) as resp:
        summary = json.loads(resp.read().decode())
        print("Analytics summary:", summary)

    # 3. Get Sites
    req = urllib.request.Request(f"{BASE_URL}/sites", headers=headers)
    with urllib.request.urlopen(req) as resp:
        sites = json.loads(resp.read().decode())
        print("Total sites fetched:", len(sites))

    if sites:
        site_id = sites[0]["id"]
        # 4. Get Site Analytics time series
        req = urllib.request.Request(f"{BASE_URL}/sites/{site_id}/analytics", headers=headers)
        with urllib.request.urlopen(req) as resp:
            analytics = json.loads(resp.read().decode())
            print(f"Site {site_id} analytics points count:", len(analytics))

        # 5. Export CSV with query param token
        csv_url = f"{BASE_URL}/sites/{site_id}/export/csv?token={token}"
        req = urllib.request.Request(csv_url)
        with urllib.request.urlopen(req) as resp:
            csv_content = resp.read().decode()
            print("CSV export status: 200 OK, bytes:", len(csv_content))

        # 6. Export GeoJSON with query param token
        geojson_url = f"{BASE_URL}/sites/{site_id}/export/geojson?token={token}"
        req = urllib.request.Request(geojson_url)
        with urllib.request.urlopen(req) as resp:
            geojson_content = resp.read().decode()
            print("GeoJSON export status: 200 OK, bytes:", len(geojson_content))

if __name__ == "__main__":
    test()
