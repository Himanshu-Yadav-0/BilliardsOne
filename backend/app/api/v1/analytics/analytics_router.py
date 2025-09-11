import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models import models
from app.schemas import analytics as analytics_schema
from app.controllers.analytics import analytics_controller
from app.security.dependencies import get_current_owner, get_current_staff


router = APIRouter()

@router.get("/owner/{cafe_id}", response_model=analytics_schema.OwnerAnalyticsResponse, summary="Get Owner Analytics Report")
def get_analytics_for_cafe(
    cafe_id: str,
    period: str, # Add this to accept the query parameter
    db: Session = Depends(get_db),
    current_owner: models.Owner = Depends(get_current_owner)
):
    """
    Retrieves a full analytics report for a specific cafe owned by the current user.
    """
    return analytics_controller.get_owner_analytics(db=db, cafe_id=cafe_id, period=period, owner_id=current_owner.id)

@router.get("/staff/today", response_model=analytics_schema.StaffDailyAnalyticsResponse, summary="Get Staff's Daily Analytics")
def get_daily_analytics_for_staff(
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(get_current_staff)
):
    """
    Retrieves a simplified analytics report for the current staff member's cafe for today.
    """
    return analytics_controller.get_staff_daily_analytics(db=db, staff=current_staff)

