#!/usr/bin/env python3
import os
import sys
import json
import time
from urllib import request, parse


BASE_URL = os.environ.get("BACKEND_URL", "http://localhost:3000/api")
USERNAME = os.environ.get("SEED_USERNAME", "admin@example.com")
PASSWORD = os.environ.get("SEED_PASSWORD", "admin1234")


def _req(method: str, path: str, token: str | None = None, body: dict | None = None):
    url = f"{BASE_URL.rstrip('/')}/{path.lstrip('/')}"
    data = None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    req = request.Request(url, data=data, method=method, headers=headers)
    try:
        with request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else None
    except Exception as e:
        print(f"HTTP error {method} {url}: {e}")
        raise


def login(username: str, password: str) -> str:
    payload = {"username": username, "password": password}
    res = _req("POST", "/auth/login", body=payload)
    token = res.get("token")
    if not token:
        raise RuntimeError("No token returned from /auth/login")
    return token


def ensure_item_types(token: str):
    # Public GET
    existing = _req("GET", "/item-types", token=None)
    names = {it["name"] for it in existing}
    created = []
    def create(dto):
        res = _req("POST", "/item-types", token=token, body=dto)
        created.append(res)

    sample = [
        {"name": "Small Box", "unitWeightKg": 1, "unitVolumeM3": 0.02, "lengthM": 0.4, "widthM": 0.3, "heightM": 0.2},
        {"name": "Medium Box", "unitWeightKg": 2, "unitVolumeM3": 0.05, "lengthM": 0.6, "widthM": 0.4, "heightM": 0.25},
        {"name": "Large Box", "unitWeightKg": 5, "unitVolumeM3": 0.1, "lengthM": 0.8, "widthM": 0.6, "heightM": 0.25},
    ]
    # Only admin can POST; skip creation if names exist
    for dto in sample:
        if dto["name"] not in names:
            try:
                create(dto)
            except Exception:
                # Non-admin or already exists — ignore
                pass
    # Refresh
    all_types = _req("GET", "/item-types", token=None)
    return {it["name"]: it for it in all_types}


def create_containers(token: str):
    res = _req("GET", "/containers", token=token)
    by_name = {c["name"]: c for c in res}
    want = [
        {"name": "Container A", "maxWeightKg": 200, "maxVolumeM3": 2.5},
        {"name": "Container B", "maxWeightKg": 120, "maxVolumeM3": 1.2},
    ]
    out = {}
    for w in want:
        if w["name"] in by_name:
            out[w["name"]] = by_name[w["name"]]
        else:
            out[w["name"]] = _req("POST", "/containers", token=token, body=w)
    return out


def create_items(token: str, containers: dict, item_types_by_name: dict):
    def id_of(name: str) -> str:
        return item_types_by_name[name]["id"]

    payloads = [
        (containers["Container A"]["id"], {"itemTypeId": id_of("Small Box"), "quantity": 10, "note": "Small items"}),
        (containers["Container A"]["id"], {"itemTypeId": id_of("Medium Box"), "quantity": 5}),
        (containers["Container B"]["id"], {"itemTypeId": id_of("Large Box"), "quantity": 3}),
    ]
    created = []
    for container_id, dto in payloads:
        try:
            created.append(_req("POST", f"/containers/{container_id}/items", token=token, body=dto))
        except Exception:
            # If duplicates or validation errors occur, skip
            pass
    return created


def main():
    print(f"Backend: {BASE_URL}")
    print("Logging in…")
    token = login(USERNAME, PASSWORD)
    print("Token acquired")

    print("Ensuring item types…")
    item_types = ensure_item_types(token)
    print(f"Item types ready: {list(item_types.keys())}")

    print("Creating containers…")
    containers = create_containers(token)
    print("Containers:", {k: v["id"] for k, v in containers.items()})

    print("Creating items…")
    items = create_items(token, containers, item_types)
    print(f"Created {len(items)} items (or already present).")

    print("Done. You can now use the calculator endpoint.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as e:
        print("Seed failed:", e)
        sys.exit(1)
