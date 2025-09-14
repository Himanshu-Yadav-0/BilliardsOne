from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from datetime import datetime, timezone
import math
from decimal import Decimal
from app.models import models
from app.schemas import game_session as game_session_schema
from app.billing import strategies

def start_new_session(db: Session, session_data: game_session_schema.SessionStart, staff: models.Staff):
    table = db.query(models.Table).filter(models.Table.id == session_data.table_id).first()
    if not table or table.status != models.TableStatus.available:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Table is not available")

    # Create the new session
    new_session = models.GameSession(table_id=session_data.table_id, staff_id=staff.id)
    db.add(new_session)
    
    # IMPORTANT: Create the initial PlayerChange record
    initial_players = models.PlayerChange(
        game_session=new_session, 
        numberOfPlayers=session_data.initial_player_count
    )
    db.add(initial_players)

    table.status = models.TableStatus.in_use
    db.commit()
    db.refresh(new_session)
    return new_session

def update_player_count(db: Session, change_data: game_session_schema.PlayerChange, staff: models.Staff):
    session = db.query(models.GameSession).filter(models.GameSession.id == change_data.session_id).first()
    if not session or session.endTime is not None:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    # Ensure the staff member belongs to the same cafe as the session's table
    if session.table.cafe_id != staff.cafe_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this session")

    new_change = models.PlayerChange(
        session_id=change_data.session_id,
        numberOfPlayers=change_data.new_player_count
    )
    db.add(new_change)
    db.commit()
    return {"message": "Player count updated successfully"}

def end_existing_session(db: Session, session_id: str, staff: models.Staff):
    session = db.query(models.GameSession).filter(
        models.GameSession.id == session_id, 
        models.GameSession.endTime == None
    ).first()

    if not session or session.staff.cafe_id != staff.cafe_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active session not found")

    # --- Naya "Traffic Cop" Logic ---
    
    # 1. Basic details calculate karein
    session.endTime = datetime.now(timezone.utc)
    duration = session.endTime - session.startTime
    duration_minutes = math.ceil(duration.total_seconds() / 60)

    table = session.table
    cafe = table.cafe
    billing_strategy = cafe.billingStrategy # Cafe ki strategy fetch karein

    pricing_rule = db.query(models.Pricing).filter(
        models.Pricing.cafe_id == table.cafe_id,
        models.Pricing.tableType == table.tableType
    ).first()

    if not pricing_rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing for this table type is not set")

    latest_player_change = db.query(models.PlayerChange).filter(
        models.PlayerChange.session_id == session.id
    ).order_by(models.PlayerChange.timestamp.desc()).first()
    
    final_player_count = latest_player_change.numberOfPlayers if latest_player_change else 0

    # 2. Strategy ke hisaab se sahi calculation engine chunein
    calculation_function = None
    if billing_strategy == models.BillingStrategy.pro_rata:
        calculation_function = strategies.calculate_pro_rata_bill
    elif billing_strategy == models.BillingStrategy.per_minute:
        calculation_function = strategies.calculate_per_minute_bill
    elif billing_strategy == models.BillingStrategy.fixed_hour:
        calculation_function = strategies.calculate_fixed_hour_bill
    else:
        raise HTTPException(status_code=500, detail="Unknown billing strategy configured for this cafe")

    # 3. Chune hue engine se bill calculate karwayein
    bill_details = calculation_function(duration_minutes, pricing_rule, final_player_count)
    
    # Baaki updates waise ke waise
    table.status = models.TableStatus.available
    session.timePlayedInMinutes = duration_minutes
    db.commit()

    # Final response mein session_id add karke bhej dein
    return {"session_id": str(session.id), **bill_details}

