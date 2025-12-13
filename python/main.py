import os
from typing import Any, List, Optional
import strawberry
from fastapi import FastAPI, Header, HTTPException
from strawberry.fastapi import GraphQLRouter


SERVICE_KEY_ENV = "X_CARGO_PROCESSOR_API_KEY"


def ensure_service_key(x_cargo_processor_api_key: Optional[str]) -> None:
    expected = os.environ.get(SERVICE_KEY_ENV)
    if not expected:
        # If no expected key is set, allow all in dev, but warn via exception message when misused.
        return
    if x_cargo_processor_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid service key")


@strawberry.type
class ItemTypeInput:
    name: str
    unitWeightKg: float
    unitVolumeM3: float
    lengthM: Optional[float] = None
    widthM: Optional[float] = None
    heightM: Optional[float] = None


@strawberry.type
class ItemInput:
    itemTypeName: str
    quantity: int


@strawberry.type
class NormalizeResult:
    itemTypes: List[ItemTypeInput]
    items: List[ItemInput]


@strawberry.type
class Mutation:
    @strawberry.mutation
    def normalize(
        self,
        info,  # strawberry's resolver info
        source: str,
        payload: strawberry.scalars.JSON,
    ) -> NormalizeResult:
        # Very simple demo normalization: try to map generic keys to ItemTypes/Items
        # Expected demo payload example:
        # { "types": [{"name":"Box S","w":1,"v":0.02}], "items": [{"type":"Box S","q":3}] }
        raw: dict[str, Any] = payload or {}
        types_raw = raw.get("types") or []
        items_raw = raw.get("items") or []

        item_types: List[ItemTypeInput] = []
        items: List[ItemInput] = []

        for t in types_raw:
            item_types.append(
                ItemTypeInput(
                    name=str(t.get("name") or t.get("id") or "Unknown"),
                    unitWeightKg=float(t.get("unitWeightKg") or t.get("w") or 0.0),
                    unitVolumeM3=float(t.get("unitVolumeM3") or t.get("v") or 0.0),
                    lengthM=(float(t["lengthM"]) if t.get("lengthM") is not None else None),
                    widthM=(float(t["widthM"]) if t.get("widthM") is not None else None),
                    heightM=(float(t["heightM"]) if t.get("heightM") is not None else None),
                )
            )

        for it in items_raw:
            items.append(
                ItemInput(
                    itemTypeName=str(it.get("itemTypeName") or it.get("type") or "Unknown"),
                    quantity=int(it.get("quantity") or it.get("q") or 0),
                )
            )

        return NormalizeResult(itemTypes=item_types, items=items)


schema = strawberry.Schema(mutation=Mutation)


async def auth_context_getter(x_cargo_processor_api_key: Optional[str] = Header(default=None)):
    ensure_service_key(x_cargo_processor_api_key)
    return {}


graphql_app = GraphQLRouter(schema, context_getter=auth_context_getter)

app = FastAPI(title="Cargo Processor (GraphQL)")
app.include_router(graphql_app, prefix="/graphql")


@app.get("/health")
def health():
    return {"status": "ok"}
