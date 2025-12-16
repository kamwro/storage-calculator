#!/usr/bin/env python3
import os
import json
import sys
from urllib import request


def main():
    base = os.environ.get("CARGO_URL", "http://localhost:8000")
    service_key = os.environ.get("X_CARGO_API_KEY", "dev-key")
    url = base.rstrip('/') + "/graphql"

    query = """
    mutation Normalize($source: String!, $payload: JSON!) {
      normalize(source: $source, payload: $payload) {
        itemTypes { name unitWeightKg unitVolumeM3 lengthM widthM heightM }
        items { itemTypeName quantity }
      }
    }
    """

    variables = {
        "source": "demo",
        "payload": {
            "types": [
                {"name": "Box S", "w": 1, "v": 0.02, "lengthM": 0.4, "widthM": 0.3, "heightM": 0.2}
            ],
            "items": [
                {"type": "Box S", "q": 5}
            ]
        }
    }

    body = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    req = request.Request(url, data=body, method="POST", headers={
        "Content-Type": "application/json",
        "X-CARGO-API-KEY": service_key,
    })
    with request.urlopen(req, timeout=10) as resp:
        print(resp.read().decode("utf-8"))


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as e:
        print("Request failed:", e)
        sys.exit(1)
