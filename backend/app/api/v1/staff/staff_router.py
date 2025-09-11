import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.models import models
from app.schemas import staff as staff_schema
from app.controllers.staff import staff_controller
from app.security.dependencies import get_current_owner

router = APIRouter()

@router.post("/", response_model=staff_schema.Staff, status_code=status.HTTP_201_CREATED)
def create_new_staff(
    staff: staff_schema.StaffCreate,
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Create a new staff member for a specific cafe.
    """
    return staff_controller.create_staff_for_cafe(db=db, staff=staff, owner_id=current_owner.id)

@router.get("/", response_model=List[staff_schema.Staff])
def read_staff_for_cafe(
    cafe_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Retrieve all staff members for a specific cafe.
    """
    return staff_controller.get_staff_by_cafe(db=db, cafe_id=cafe_id, owner_id=current_owner.id)

@router.put("/{staff_id}", response_model=staff_schema.Staff)
def update_staff(
    staff_id: uuid.UUID,
    staff: staff_schema.StaffUpdate,
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Update a staff member's details.
    """
    return staff_controller.update_staff_details(db=db, staff_id=staff_id, staff_update=staff, owner_id=current_owner.id)

@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(
    staff_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Delete a staff member.
    """
    staff_controller.delete_staff_member(db=db, staff_id=staff_id, owner_id=current_owner.id)
    return


