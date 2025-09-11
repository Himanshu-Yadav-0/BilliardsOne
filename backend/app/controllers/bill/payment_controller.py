from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from datetime import datetime, date, timezone

from app.models import models
from app.schemas import payment as payment_schema

def log_new_payment(db: Session, payment_data: payment_schema.PaymentCreate, staff: models.Staff):
    # This function remains correct
    session = db.query(models.GameSession).join(models.Table).filter(
        models.GameSession.id == payment_data.game_session_id,
        models.Table.cafe_id == staff.cafe_id
    ).first()

    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found in this cafe")

    if session.payment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This session has already been paid for")
    
    duration = session.endTime - session.startTime
    duration_minutes = int(duration.total_seconds() / 60)

    new_payment = models.Payment(
        session_id=payment_data.game_session_id,
        totalAmount=payment_data.total_amount,
        paymentMethod=payment_data.payment_method,
        timePlayedInMinutes=duration_minutes
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment

# --- CORRECTED FUNCTION ---
def get_payments_for_staff_today(db: Session, staff: models.Staff):
    """
    Fetches all payments recorded by the current staff member for the current day,
    using the server's local timezone.
    """
    # Get the start of today in the server's local timezone
    today_start_local = datetime.combine(date.today(), datetime.min.time())
    
    # The query now correctly compares local timestamps
    payments = db.query(models.Payment).join(models.GameSession).filter(
        models.GameSession.staff_id == staff.id,
        models.Payment.paymentTimestamp >= today_start_local
    ).options(
        joinedload(models.Payment.game_session).joinedload(models.GameSession.table)
    ).order_by(models.Payment.paymentTimestamp.desc()).all()
    
    return payments

