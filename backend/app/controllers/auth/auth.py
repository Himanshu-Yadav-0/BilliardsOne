from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import models
from app.schemas import auth as auth_schema
from app.security.Hash import Hasher
from app.security.jwt import create_access_token
from app.core.config import settings

def register_owner(db: Session, owner: auth_schema.OwnerCreate):
    db_owner = db.query(models.Owner).filter(models.Owner.mobileNo == owner.mobileNo).first()
    if db_owner:
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    
    hashed_pin = Hasher.get_password_hash(owner.pin)
    new_owner = models.Owner(
        ownerName=owner.ownerName,
        mobileNo=owner.mobileNo,
        pinHash=hashed_pin
    )
    db.add(new_owner)
    db.commit()
    db.refresh(new_owner)
    return new_owner


def login_for_access_token(db: Session, form_data: auth_schema.OAuth2PasswordRequestForm):
    mobile_no = form_data.username
    
    user = db.query(models.Owner).filter(models.Owner.mobileNo == mobile_no).first()
    role = "owner"
    pin_hash_to_check = user.pinHash if user else None
    
    if not user:
        user = db.query(models.Staff).filter(models.Staff.mobileNo == mobile_no).first()
        role = "staff"
        pin_hash_to_check = user.pin if user else None

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register as an owner first.",
        )

    if not Hasher.verify_password(form_data.password, pin_hash_to_check):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The PIN you entered is incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.mobileNo, "role": role}, 
        expires_delta=access_token_expires
    )
    
    # Also add role to the response here for consistency
    return {"access_token": access_token, "token_type": "bearer", "role": role}

def assume_staff_role(db: Session, cafe_id: str, owner: models.Owner):
    cafe = db.query(models.Cafe).filter(
        models.Cafe.id == cafe_id,
        models.Cafe.owner_id == owner.id
    ).first()

    if not cafe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cafe not found or not owned by you")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # --- Yahaan Hai Magic ---
    # Hum token ke data mein 'cafe_id' bhi add kar rahe hain
    access_token = create_access_token(
        data={
            "sub": owner.mobileNo, 
            "role": "staff", 
            "is_owner": True,
            "cafe_id": str(cafe.id) # Gate Number
        }, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role": "staff"}





