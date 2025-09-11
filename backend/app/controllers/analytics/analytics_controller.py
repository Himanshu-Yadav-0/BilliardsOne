import uuid
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract
from decimal import Decimal
from fastapi import HTTPException
from datetime import datetime, date, timedelta
from app.models import models

def get_owner_analytics(db: Session, cafe_id: str, period: str, owner_id: str):
    """
    Calculates and returns the performance analytics for a specific cafe owned by the current owner.
    """
    # First, verify the owner actually owns this cafe
    cafe = db.query(models.Cafe).filter(models.Cafe.id == cafe_id, models.Cafe.owner_id == owner_id).first()
    if not cafe:
        # This will prevent analytics from being loaded for a cafe not owned by the user
        return {
            "total_revenue": 0, "total_sessions": 0, "peak_hours": "N/A",
            "revenue_by_payment_method": {"Cash": 0, "Online": 0}
        }

    # --- CORRECTED TIMEZONE LOGIC ---
    # We calculate the start date using the server's local timezone
    today = date.today()
    if period == 'today':
        start_date = datetime.combine(today, datetime.min.time())
    elif period == 'week':
        start_date = datetime.combine(today - timedelta(days=today.weekday()), datetime.min.time())
    elif period == 'month':
        start_date = datetime.combine(today.replace(day=1), datetime.min.time())
    else:
        # Default to week if an invalid period is provided
        start_date = datetime.combine(today - timedelta(days=today.weekday()), datetime.min.time())

    # This query now correctly fetches payments for the selected cafe within the local time period
    payments = db.query(models.Payment).join(models.GameSession).join(models.Table).filter(
        models.Table.cafe_id == cafe_id,
        models.Payment.paymentTimestamp >= start_date
    ).all()

    total_revenue = sum(p.totalAmount for p in payments)
    total_sessions = len(set(p.session_id for p in payments))
    
    revenue_by_method = {
        "Cash": sum(p.totalAmount for p in payments if p.paymentMethod == models.PaymentMethod.cash),
        "Online": sum(p.totalAmount for p in payments if p.paymentMethod == models.PaymentMethod.online)
    }

    # Peak hours calculation (simplified)
    if payments:
        hour_counts = {}
        for p in payments:
            hour = p.paymentTimestamp.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        peak_hour = max(hour_counts, key=hour_counts.get)
        peak_hours_str = f"{peak_hour}:00 - {peak_hour+1}:00"
    else:
        peak_hours_str = "N/A"

    return {
        "total_revenue": total_revenue,
        "total_sessions": total_sessions,
        "peak_hours": peak_hours_str,
        "revenue_by_payment_method": revenue_by_method
    }

def get_staff_daily_analytics(db: Session, staff: models.Staff):
    """
    Calculates and returns the daily performance analytics for the current staff member.
    """
    # Use the server's local timezone to define the start of today
    today_start_local = datetime.combine(date.today(), datetime.min.time())

    # Query all payments made by this staff member today
    payments_today = db.query(models.Payment).join(models.GameSession).filter(
        models.GameSession.staff_id == staff.id,
        models.Payment.paymentTimestamp >= today_start_local
    ).all()

    # Initialize analytics counters
    total_revenue = Decimal('0.0')
    cash_collected = Decimal('0.0')
    online_collected = Decimal('0.0')
    # Use a set to count unique sessions managed
    sessions_managed = set()

    # Calculate totals by iterating through the payments
    for payment in payments_today:
        total_revenue += payment.totalAmount
        sessions_managed.add(payment.session_id)
        if payment.paymentMethod == models.PaymentMethod.cash:
            cash_collected += payment.totalAmount
        elif payment.paymentMethod == models.PaymentMethod.online:
            online_collected += payment.totalAmount
            
    return {
        "total_revenue": total_revenue,
        "sessions_managed": len(sessions_managed),
        "cash_collected": cash_collected,
        "online_collected": online_collected,
    }


