import uuid
from decimal import Decimal
import datetime
from pydantic import BaseModel
from app.models.models import PaymentMethod

# --- Nested Schemas for the Response ---

class TableInPaymentResponse(BaseModel):
    tableName: str
    class Config:
        from_attributes = True

class GameSessionInPaymentResponse(BaseModel):
    table: TableInPaymentResponse
    class Config:
        from_attributes = True

# --- Main Schemas ---

class PaymentCreate(BaseModel):
    game_session_id: uuid.UUID
    total_amount: Decimal
    payment_method: PaymentMethod

class Payment(BaseModel):
    id: uuid.UUID
    totalAmount: Decimal
    paymentMethod: PaymentMethod
    paymentTimestamp: datetime.datetime
    game_session: GameSessionInPaymentResponse # Use the nested schema

    class Config:
        from_attributes = True

