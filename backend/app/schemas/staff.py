import uuid
from pydantic import BaseModel

# --- Base Schema ---
class StaffBase(BaseModel):
    staffName: str
    mobileNo: str

# --- Input Schemas ---
# Used when an owner creates a new staff member
class StaffCreate(StaffBase):
    pin: str
    cafe_id: uuid.UUID

# Used when an owner updates staff details
class StaffUpdate(StaffBase):
    pass

# --- Output Schema ---
# This is the model that will be returned from the API
class Staff(StaffBase):
    id: uuid.UUID
    cafe_id: uuid.UUID

    class Config:
        from_attributes = True
