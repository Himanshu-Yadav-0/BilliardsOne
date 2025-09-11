import uuid
from pydantic import BaseModel
from app.models.models import TableType, TableStatus

# --- Base Schema ---
class TableBase(BaseModel):
    tableName: str
    tableType: TableType

# --- Input Schemas ---
class TableCreate(TableBase):
    cafe_id: uuid.UUID

class TableUpdate(TableBase):
    status: TableStatus

# --- Output Schema ---
class Table(TableBase):
    id: uuid.UUID
    cafe_id: uuid.UUID
    status: TableStatus

    class Config:
        from_attributes = True
