from pydantic import BaseModel
from decimal import Decimal
from typing import Dict

class RevenueData(BaseModel):
    total_revenue: Decimal
    cash_revenue: Decimal
    online_revenue: Decimal

class AnalyticsReport(BaseModel):
    revenue: RevenueData
    sessions_per_table_type: Dict[str, int]
    peak_hours: Dict[int, int]

class StaffDailyAnalyticsReport(BaseModel):
    revenue: RevenueData
    total_sessions: int

# --- Owner Analytics ---
class OwnerAnalyticsResponse(BaseModel):
    total_revenue: Decimal
    total_sessions: int
    peak_hours: str | None
    revenue_by_payment_method: Dict[str, Decimal]

# --- Staff Analytics (Corrected) ---
# The field names now match the dictionary returned by the controller
class StaffDailyAnalyticsResponse(BaseModel):
    total_revenue: Decimal
    sessions_managed: int
    cash_collected: Decimal
    online_collected: Decimal

    class Config:
        from_attributes = True


