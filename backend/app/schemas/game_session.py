import uuid
import datetime
from decimal import Decimal
from pydantic import BaseModel,Field
from typing import List, Optional

from .table import Table as TableSchema

# --- Input Schemas ---
class SessionStart(BaseModel):
    table_id: uuid.UUID
    initial_player_count: int

# --- Output Schemas ---
class BillDetails(BaseModel):
    session_id: uuid.UUID
    total_minutes_played: int
    time_based_cost: Decimal
    extra_player_cost: Decimal
    total_amount_due: Decimal

class PlayerChange(BaseModel):
    session_id: uuid.UUID
    timestamp: Optional[datetime.datetime] = None
    new_player_count: int = Field(alias="numberOfPlayers")

    class Config:
        from_attributes = True
        allow_population_by_field_name = True

class GameSession(BaseModel):
    id: uuid.UUID
    startTime: datetime.datetime
    endTime: Optional[datetime.datetime] = None
    table: TableSchema
    player_changes: List[PlayerChange]

    class Config:
        from_attributes = True

# --- CORRECTED BILL DETAILS SCHEMA ---
# Yeh schema ab controller se bheji jaane waali saari details se match karta hai
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

