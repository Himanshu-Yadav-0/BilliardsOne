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
        if mobileNo is None or role_str is None:
            raise credentials_exception
        
        # Validate the role string against the Role enum
        try:
            role = Role(role_str)
        except ValueError:
            raise credentials_exception
            
        token_data = TokenData(mobileNo=mobileNo, role=role)
    except JWTError:
        raise credentials_exception
    
    user = None
    if token_data.role == Role.owner:
        user = db.query(models.Owner).filter(models.Owner.mobileNo == token_data.mobileNo).first()
    elif token_data.role == Role.staff:
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


def get_current_staff(user_data = Depends(get_current_user)) -> models.Staff:
    user, token_data = user_data
    if token_data.role != Role.staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access forbidden: requires staff role"
        )
    return user

