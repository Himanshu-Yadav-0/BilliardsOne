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
    # The username is the mobile number
    mobile_no = form_data.username
    
    # First, check if the user is an owner
    user = db.query(models.Owner).filter(models.Owner.mobileNo == mobile_no).first()
    role = "owner"
    
    # If not an owner, check if they are a staff member
    if not user:
        user = db.query(models.Staff).filter(models.Staff.mobileNo == mobile_no).first()
        role = "staff"
        if user==None:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
            detail="No user Exists, Please Register Yourself",
            headers={"WWW-Authenticate": "Bearer"},
        )
        pin = user.pin
    else:
        pin = user.pinHash

    # If user is not found in either table, or password doesn't match
    if not user or not Hasher.verify_password(form_data.password, pin):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or PIN",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create the token with the correct role included in the payload
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.mobileNo, "role": role}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role":role}

