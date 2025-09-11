from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.db import get_db
from app.schemas import payment as payment_schema
from app.controllers.bill import payment_controller
from app.security.dependencies import get_current_staff
from app.models import models

router = APIRouter()

@router.post("/", response_model=payment_schema.Payment)
def log_payment(
    payment: payment_schema.PaymentCreate,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(get_current_staff)
):
    """
    Logs a new payment for a completed session.
    """
    return payment_controller.log_new_payment(db=db, payment_data=payment, staff=current_staff)

@router.get("/", response_model=List[payment_schema.Payment])
def get_payments(
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(get_current_staff)
):
    """
    Retrieves the payment history for the current staff member for today.
    """
    return payment_controller.get_payments_for_staff_today(db=db, staff=current_staff)

