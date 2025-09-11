from pydantic import BaseModel
from decimal import Decimal

class BillDetails(BaseModel):
    session_id: str
    total_minutes_played: int
    
    # Comprehensive Breakdown Fields
    base_charge: Decimal
    extra_minutes_played: int
    per_minute_rate: Decimal
    overtime_charge: Decimal
    
    time_based_cost: Decimal
    
    final_player_count: int
    extra_player_cost: Decimal
    
    total_amount_due: Decimal

    class Config:
        from_attributes = True

