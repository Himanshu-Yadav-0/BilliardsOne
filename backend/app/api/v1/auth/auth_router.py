from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.db.db import get_db
from app.schemas import auth as auth_schema
from app.schemas import token as token_schema
from app.controllers.auth import auth as auth_controller
from app.models import models
from app.security.dependencies import get_current_owner

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def create_owner(owner: auth_schema.OwnerCreate, db: Session = Depends(get_db)):
    """
    Register a new Owner.
    """
    auth_controller.register_owner(db=db, owner=owner)
    return {"message": "Owner registered successfully"}

@router.post("/login", response_model=token_schema.Token)
def login_for_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends() # Use the standard dependency here
):
    # Pass the form_data directly to the controller
    return auth_controller.login_for_access_token(db=db, form_data=form_data)

@router.post("/assume-role/{cafe_id}", response_model=token_schema.Token)
def switch_to_staff_view(
    cafe_id: str,
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Allows a verified owner to get a temporary staff token for one of their cafes.
    """
    return auth_controller.assume_staff_role(db=db, cafe_id=cafe_id, owner=current_owner)
