import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import models
from app.schemas import staff as staff_schema
from app.security.Hash import Hasher

def get_staff_and_verify_ownership(db: Session, staff_id: uuid.UUID, owner_id: uuid.UUID):
    """
    Helper function to get a staff member and verify the current owner has permission to manage them.
    """
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff not found")
    
    # Check if the owner owns the cafe this staff belongs to
    cafe = db.query(models.Cafe).filter(
        models.Cafe.id == staff.cafe_id,
        models.Cafe.owner_id == owner_id
    ).first()
    if not cafe:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage this staff member."
        )
    return staff


def create_staff_for_cafe(db: Session, staff: staff_schema.StaffCreate, owner_id: uuid.UUID):
    # 1. Verify the owner owns the cafe they're adding staff to
    cafe = db.query(models.Cafe).filter(
        models.Cafe.id == staff.cafe_id,
        models.Cafe.owner_id == owner_id
    ).first()
    if not cafe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cafe not found or you do not have permission to access it."
        )

    # 2. Check if the mobile number is already in use by an owner or other staff
    existing_user_owner = db.query(models.Owner).filter(models.Owner.mobileNo == staff.mobileNo).first()
    existing_user_staff = db.query(models.Staff).filter(models.Staff.mobileNo == staff.mobileNo).first()
    if existing_user_owner or existing_user_staff:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this mobile number already exists."
        )

    # 3. Hash the pin
    hashed_pin = Hasher.get_password_hash(staff.pin)

    # 4. Create the new staff member
    db_staff = models.Staff(
        staffName=staff.staffName,
        mobileNo=staff.mobileNo,
        pin=hashed_pin,
        cafe_id=staff.cafe_id
    )
    
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    
    return db_staff

def get_staff_by_cafe(db: Session, cafe_id: uuid.UUID, owner_id: uuid.UUID):
    # Verify owner owns the cafe before listing its staff
    cafe = db.query(models.Cafe).filter(
        models.Cafe.id == cafe_id,
        models.Cafe.owner_id == owner_id
    ).first()
    if not cafe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cafe not found or you do not have permission to access it."
        )
    return db.query(models.Staff).filter(models.Staff.cafe_id == cafe_id).all()

def update_staff_details(db: Session, staff_id: uuid.UUID, staff_update: staff_schema.StaffUpdate, owner_id: uuid.UUID):
    db_staff = get_staff_and_verify_ownership(db, staff_id, owner_id)

    # Check if the new mobile number is already taken by another user
    if staff_update.mobileNo != db_staff.mobileNo:
        existing_user_owner = db.query(models.Owner).filter(models.Owner.mobileNo == staff_update.mobileNo).first()
        existing_user_staff = db.query(models.Staff).filter(models.Staff.mobileNo == staff_update.mobileNo).first()
        if existing_user_owner or existing_user_staff:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this mobile number already exists."
            )

    db_staff.staffName = staff_update.staffName
    db_staff.mobileNo = staff_update.mobileNo
    db.commit()
    db.refresh(db_staff)
    return db_staff

def delete_staff_member(db: Session, staff_id: uuid.UUID, owner_id: uuid.UUID):
    db_staff = get_staff_and_verify_ownership(db, staff_id, owner_id)
    db.delete(db_staff)
    db.commit()
    return {"message": "Staff member deleted successfully"}
