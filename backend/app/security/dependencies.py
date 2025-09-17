from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.db import get_db
from app.models import models
from app.schemas.token import TokenData, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        mobileNo: str = payload.get("sub")
        role_str: str = payload.get("role")
        is_owner_acting_as_staff: bool = payload.get("is_owner", False)
        cafe_id_from_token: str = payload.get("cafe_id")

        if mobileNo is None or role_str is None:
            raise credentials_exception
        
        role = Role(role_str)
        token_data = TokenData(
            mobileNo=mobileNo, 
            role=role, 
            is_owner=is_owner_acting_as_staff,
            cafe_id=cafe_id_from_token
        )

    except (JWTError, ValueError):
        raise credentials_exception
    
    user = None
    if token_data.role == Role.owner:
        user = db.query(models.Owner).filter(models.Owner.mobileNo == token_data.mobileNo).first()
    elif token_data.role == Role.staff:
        if token_data.is_owner:
            user = db.query(models.Owner).filter(models.Owner.mobileNo == token_data.mobileNo).first()
        else: 
            user = db.query(models.Staff).filter(models.Staff.mobileNo == token_data.mobileNo).first()

    if user is None:
        raise credentials_exception
        
    return user, token_data

def get_current_owner(user_data = Depends(get_current_user)) -> models.Owner:
    user, token_data = user_data
    if token_data.role != Role.owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access forbidden: requires owner role"
        )
    return user

# --- Final, "Self-Healing" Version ---
def get_current_staff(user_data = Depends(get_current_user), db: Session = Depends(get_db)) -> models.Staff:
    user, token_data = user_data
    if token_data.role != Role.staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access forbidden: requires staff role"
        )
    
    # Agar owner as a staff act kar raha hai
    if token_data.is_owner:
        # Hamesha owner ka primary staff profile hi dhoondein (mobileNo se)
        owner_staff_profile = db.query(models.Staff).filter(
            models.Staff.mobileNo == user.mobileNo
        ).first()
        
        # Agar profile nahi milti (purana cafe)
        if not owner_staff_profile:
            # On-the-spot naya staff profile banayein
            owner_as_staff = models.Staff(
                staffName=f"{user.ownerName} (Owner)",
                mobileNo=user.mobileNo,
                pin=user.pinHash,
                cafe_id=token_data.cafe_id
            )
            db.add(owner_as_staff)
            db.commit()
            db.refresh(owner_as_staff)
            return owner_as_staff

        # Sabse important step: Sahi cafe ko dynamically attach karein
        if token_data.cafe_id:
            cafe_to_act_in = db.query(models.Cafe).filter(models.Cafe.id == token_data.cafe_id).first()
            if cafe_to_act_in:
                # Staff object ke cafe ko overwrite karein
                owner_staff_profile.cafe = cafe_to_act_in
        
        return owner_staff_profile
    
    # Agar normal staff hai, toh user (jo pehle se Staff object hai) return hoga
    return user