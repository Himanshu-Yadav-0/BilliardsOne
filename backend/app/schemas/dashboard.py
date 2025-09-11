from pydantic import BaseModel
from typing import List, Optional
import uuid
import datetime
from decimal import Decimal


class PricingInfo(BaseModel):
    tableType: str
    hourPrice: Decimal
    halfHourPrice: Decimal

    class Config:
        from_attributes = True

class TableStatus(BaseModel):
    id: uuid.UUID
    tableName: str
    tableType: str
    status: str
    current_session_id: Optional[uuid.UUID] = None
    startTime: Optional[datetime.datetime] = None # Add this line
    elapsed_time: Optional[str] = None
    current_players: Optional[int] = None

    class Config:
        from_attributes = True

class StaffDashboardResponse(BaseModel):
    cafeName: str
    tables: List[TableStatus]
    pricing_rules: List[PricingInfo]

