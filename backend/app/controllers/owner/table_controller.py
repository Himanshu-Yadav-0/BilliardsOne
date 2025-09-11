from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import models
from app.schemas import table as table_schema, pricing as pricing_schema

# --- Table Management Logic ---

def create_table_for_cafe(db: Session, table: table_schema.TableCreate, owner_id: str):
    # Verify the owner actually owns the cafe
    db_cafe = db.query(models.Cafe).filter(models.Cafe.id == table.cafe_id, models.Cafe.owner_id == owner_id).first()
    if not db_cafe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cafe not found or not owned by you")
    
    new_table = models.Table(**table.model_dump())
    db.add(new_table)
    db.commit()
    db.refresh(new_table)
    return new_table

def get_tables_for_cafe(db: Session, cafe_id: str, owner_id: str):
    # Verify ownership
    db_cafe = db.query(models.Cafe).filter(models.Cafe.id == cafe_id, models.Cafe.owner_id == owner_id).first()
    if not db_cafe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cafe not found or not owned by you")
        
    return db.query(models.Table).filter(models.Table.cafe_id == cafe_id).all()

# --- Pricing Management Logic ---

def get_pricing_for_cafe(db: Session, cafe_id: str, owner_id: str):
    # Verify ownership
    db_cafe = db.query(models.Cafe).filter(models.Cafe.id == cafe_id, models.Cafe.owner_id == owner_id).first()
    if not db_cafe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cafe not found")
        
    # Return all pricing rules for the cafe
    return db.query(models.Pricing).filter(models.Pricing.cafe_id == cafe_id).all() or []

# --- CORRECTED PRICING LOGIC ---
def set_pricing_for_cafe(db: Session, pricing: pricing_schema.PricingSet, owner_id: str):
    # Verify ownership
    db_cafe = db.query(models.Cafe).filter(models.Cafe.id == pricing.cafe_id, models.Cafe.owner_id == owner_id).first()
    if not db_cafe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cafe not found")

    # Check if a pricing rule for this table type already exists for this cafe
    db_pricing = db.query(models.Pricing).filter(
        models.Pricing.cafe_id == pricing.cafe_id,
        models.Pricing.tableType == pricing.tableType
    ).first()

    if db_pricing:
        # If it exists, update it
        db_pricing.hourPrice = pricing.hourPrice
        db_pricing.halfHourPrice = pricing.halfHourPrice
        db_pricing.extraPlayerPrice = pricing.extraPlayerPrice
    else:
        # If it does not exist, create a new one
        db_pricing = models.Pricing(**pricing.model_dump())
        db.add(db_pricing)
    
    # This is the crucial step that was missing: commit the changes to the database
    db.commit()
    db.refresh(db_pricing)
    return db_pricing

