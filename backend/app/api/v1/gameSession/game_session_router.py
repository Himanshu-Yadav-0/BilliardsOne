from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.db import get_db
# Import all necessary schemas based on your controller's usage
from app.schemas import game_session as game_session_schema
from app.controllers.gameSession import game_session_controller
from app.security.dependencies import get_current_staff
from app.models import models

router = APIRouter()

@router.post("/start", response_model=game_session_schema.GameSession)
def start_session(
    session_data: game_session_schema.SessionStart, 
    db: Session = Depends(get_db), 
    current_staff: models.Staff = Depends(get_current_staff)
):
    """
    Starts a new game session for a given table.
    """
    return game_session_controller.start_new_session(db=db, session_data=session_data, staff=current_staff)

@router.post("/end/{session_id}", response_model=game_session_schema.BillDetails)
def end_session(
    session_id: str, 
    db: Session = Depends(get_db), 
    current_staff: models.Staff = Depends(get_current_staff)
):
    """
    Ends an active game session and calculates the final bill.
    """
    return game_session_controller.end_existing_session(db=db, session_id=session_id, staff=current_staff)

@router.post("/update_players", status_code=200)
def update_players(
    change_data: game_session_schema.PlayerChange, 
    db: Session = Depends(get_db), 
    current_staff: models.Staff = Depends(get_current_staff)
):
    """
    Adds a new player change record to an active session.
    """
    return game_session_controller.update_player_count(db=db, change_data=change_data, staff=current_staff)

