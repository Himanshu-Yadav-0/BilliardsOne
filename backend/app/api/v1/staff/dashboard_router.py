from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.schemas import dashboard as dashboard_schema
from app.controllers.staff import dashboard_controller
from app.security.dependencies import get_current_staff
from app.models import models

router = APIRouter()

@router.get("/dashboard", response_model=dashboard_schema.StaffDashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db), 
    current_staff: models.Staff = Depends(get_current_staff)
):
    return dashboard_controller.get_staff_dashboard_data(db=db, staff=current_staff)
