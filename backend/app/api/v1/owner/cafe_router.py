import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.models import models
from app.schemas import cafe as cafe_schema
from app.controllers.owner import cafe_controller
from app.security.dependencies import get_current_owner

router = APIRouter()

@router.post("/", response_model=cafe_schema.Cafe, status_code=status.HTTP_201_CREATED)
def create_new_cafe(
    cafe: cafe_schema.CafeCreate,
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Create a new cafe for the currently authenticated owner.
    """
    return cafe_controller.create_cafe(db=db, cafe=cafe, owner_id=current_owner.id)

@router.get("/", response_model=List[cafe_schema.Cafe])
def read_owner_cafes(
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Retrieve all cafes owned by the currently authenticated owner.
    """
    return cafe_controller.get_cafes_by_owner(db=db, owner_id=current_owner.id)

@router.get("/{cafe_id}", response_model=cafe_schema.Cafe)
def read_cafe(
    cafe_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Retrieve a specific cafe by its ID.
    """
    return cafe_controller.get_cafe_by_id(db=db, cafe_id=cafe_id, owner_id=current_owner.id)

@router.put("/{cafe_id}", response_model=cafe_schema.Cafe)
def update_existing_cafe(
    cafe_id: uuid.UUID,
    cafe: cafe_schema.CafeUpdate,
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Update a specific cafe's details.
    """
    return cafe_controller.update_cafe(db=db, cafe_id=cafe_id, cafe=cafe, owner_id=current_owner.id)

@router.delete("/{cafe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_cafe(
    cafe_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Delete a specific cafe.
    """
    cafe_controller.delete_cafe(db=db, cafe_id=cafe_id, owner_id=current_owner.id)
    return
