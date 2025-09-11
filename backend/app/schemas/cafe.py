import uuid
from pydantic import BaseModel

# --- Base Schema ---
# Contains common attributes
class CafeBase(BaseModel):
    cafeName: str

# --- Input Schemas ---
# Used when creating a new cafe
class CafeCreate(CafeBase):
    pass

# Used when updating an existing cafe
class CafeUpdate(CafeBase):
    pass

# --- Output Schema ---
# This is the model that will be returned from the API
class Cafe(CafeBase):
    id: uuid.UUID
    owner_id: uuid.UUID

    class Config:
        # This allows the Pydantic model to be created from an ORM object
        from_attributes = True
