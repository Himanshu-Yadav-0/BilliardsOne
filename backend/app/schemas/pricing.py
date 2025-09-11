import uuid
from decimal import Decimal
from pydantic import BaseModel
from app.models.models import TableType

# --- Base Schema ---
class PricingBase(BaseModel):
    tableType: TableType
    hourPrice: Decimal
    halfHourPrice: Decimal
    extraPlayerPrice: Decimal

# --- Input Schema ---
class PricingSet(PricingBase):
    cafe_id: uuid.UUID
    class Config:
        from_attributes = True

# --- Output Schema ---
class Pricing(PricingBase):
    id: uuid.UUID
    cafe_id: uuid.UUID

    class Config:
        from_attributes = True
