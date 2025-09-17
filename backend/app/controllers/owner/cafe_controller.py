import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import models
from app.schemas import cafe as cafe_schema


def create_cafe(db: Session, cafe: cafe_schema.CafeCreate, owner: models.Owner):
    new_cafe = models.Cafe(
        cafeName=cafe.cafeName,
        billingStrategy=cafe.billingStrategy,
        owner_id=owner.id
    )
    db.add(new_cafe)
    db.flush()

    # --- Naya, Smart Logic ---
    # Check karein ki is owner ka primary staff profile pehle se hai ya nahi
    existing_staff_profile = db.query(models.Staff).filter(models.Staff.mobileNo == owner.mobileNo).first()
    
    # Sirf tabhi banayein jab pehle se na ho (yaani, yeh owner ka pehla cafe hai)
    if not existing_staff_profile:
        owner_as_staff = models.Staff(
            staffName=f"{owner.ownerName} (Owner)",
            mobileNo=owner.mobileNo,
            pin=owner.pinHash,
            cafe_id=new_cafe.id # Yeh uske pehle cafe se link ho jayega
        )
        db.add(owner_as_staff)
    
    db.commit()
    db.refresh(new_cafe)
    return new_cafe


def get_cafes_by_owner(db: Session, owner_id: uuid.UUID):
    return db.query(models.Cafe).filter(models.Cafe.owner_id == owner_id).all()

def get_cafe_by_id(db: Session, cafe_id: uuid.UUID, owner_id: uuid.UUID):
    db_cafe = db.query(models.Cafe).filter(models.Cafe.id == cafe_id, models.Cafe.owner_id == owner_id).first()
    if not db_cafe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cafe not found")
    return db_cafe

def update_cafe(db: Session, cafe_id: uuid.UUID, cafe: cafe_schema.CafeUpdate, owner_id: uuid.UUID):
    db_cafe = get_cafe_by_id(db, cafe_id, owner_id)
    db_cafe.cafeName = cafe.cafeName
    db.commit()
    db.refresh(db_cafe)
    return db_cafe

def delete_cafe(db: Session, cafe_id: uuid.UUID, owner_id: uuid.UUID):
    db_cafe = get_cafe_by_id(db, cafe_id, owner_id)
    db.delete(db_cafe)
    db.commit()
    return {"message": "Cafe deleted successfully"}
