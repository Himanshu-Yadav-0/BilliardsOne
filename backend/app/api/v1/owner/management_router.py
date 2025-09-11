from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.db import get_db
from app.schemas import table as table_schema, pricing as pricing_schema
from app.controllers.owner import table_controller
from app.security.dependencies import get_current_owner
from app.models import models

router = APIRouter()

# --- Table Routes ---
@router.post("/tables/", response_model=table_schema.Table, status_code=201)
def create_table(
    table: table_schema.TableCreate, 
    db: Session = Depends(get_db), 
    current_owner: models.Owner = Depends(get_current_owner)
):
    return table_controller.create_table_for_cafe(db=db, table=table, owner_id=current_owner.id)

@router.get("/tables/", response_model=List[table_schema.Table])
def get_tables(
    cafe_id: str, 
    db: Session = Depends(get_db), 
    current_owner: models.Owner = Depends(get_current_owner)
):
    return table_controller.get_tables_for_cafe(db=db, cafe_id=cafe_id, owner_id=current_owner.id)

# --- Pricing Routes ---
@router.post("/pricing/", response_model=pricing_schema.Pricing)
def set_pricing(
    pricing: pricing_schema.PricingSet, 
    db: Session = Depends(get_db), 
    current_owner: models.Owner = Depends(get_current_owner)
):
    return table_controller.set_pricing_for_cafe(db=db, pricing=pricing, owner_id=current_owner.id)

@router.get("/pricing/", response_model=List[pricing_schema.Pricing])
def get_pricing(
    cafe_id: str, 
    db: Session = Depends(get_db), 
    current_owner: models.Owner = Depends(get_current_owner)
):
    db_pricing = table_controller.get_pricing_for_cafe(db=db, cafe_id=cafe_id, owner_id=current_owner.id)
    return db_pricing or []

