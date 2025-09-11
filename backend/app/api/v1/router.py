from fastapi import APIRouter
from app.api.v1.auth import auth_router
from app.api.v1.owner import cafe_router, management_router
from app.api.v1.staff import staff_router
from app.api.v1.gameSession import game_session_router
from app.api.v1.bill import payment_router
from app.api.v1.analytics import analytics_router
from app.api.v1.staff.dashboard_router import router as staffDashboardRouter
from app.models import models
from app.db.db import get_db
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

api_router = APIRouter()

# --- Public Routes ---
api_router.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])

# --- Owner Routes ---
api_router.include_router(cafe_router.router, prefix="/owner/cafes", tags=["Owner: Cafe Management"])
api_router.include_router(staff_router.router, prefix="/owner/staff", tags=["Owner: Staff Management"])
api_router.include_router(management_router.router, prefix="/owner/management", tags=["Owner: Table & Price Management"])

# --- Staff Routes ---
api_router.include_router(staffDashboardRouter, prefix="/staff", tags=["Staff:Dashboard"])
api_router.include_router(game_session_router.router, prefix="/staff/sessions", tags=["Staff: Game Sessions"])
api_router.include_router(payment_router.router, prefix="/staff/payments", tags=["Staff: Payments"])

# --- Analytics Routes (for both Owner and Staff) ---
api_router.include_router(analytics_router.router, prefix="/analytics", tags=["Analytics"])


# @api_router.get("/debug/pricing/all")
# def debug_pricing(db: Session = Depends(get_db)):
#     return db.query(models.Pricing).all()

