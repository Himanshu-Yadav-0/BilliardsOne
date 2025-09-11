from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from datetime import datetime, timezone
import math
from decimal import Decimal
from app.models import models
from app.schemas import game_session as game_session_schema

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

    # --- NAYA PRO-RATA BILLING LOGIC ---
    session.endTime = datetime.now(timezone.utc)
    duration = session.endTime - session.startTime
    duration_minutes = math.ceil(duration.total_seconds() / 60)

    table = session.table
    pricing_rule = db.query(models.Pricing).filter(
        models.Pricing.cafe_id == table.cafe_id,
        models.Pricing.tableType == table.tableType
    ).first()

    if not pricing_rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing for this table type is not set")

    base_charge = Decimal('0.0')
    extra_minutes_played = 0
    per_minute_rate = Decimal(pricing_rule.hourPrice) / Decimal('60')
    overtime_charge = Decimal('0.0')

    if duration_minutes <= 30:
        base_charge = Decimal(pricing_rule.halfHourPrice)
    else:
        base_charge = Decimal(pricing_rule.halfHourPrice)
        extra_minutes_played = duration_minutes - 30
        overtime_charge = extra_minutes_played * per_minute_rate

    time_based_cost = base_charge + overtime_charge

    latest_player_change = db.query(models.PlayerChange).filter(
        models.PlayerChange.session_id == session.id
    ).order_by(models.PlayerChange.timestamp.desc()).first()
    
    final_player_count = latest_player_change.numberOfPlayers if latest_player_change else 0
    
    extra_player_cost = Decimal('0.0')
    base_players_allowed = 2 # Assuming a base of 2 players
    if final_player_count > base_players_allowed:
        extra_players = final_player_count - base_players_allowed
        extra_player_cost = extra_players * Decimal(pricing_rule.extraPlayerPrice)

    total_amount_due = time_based_cost + extra_player_cost
    
    # Update table status back to "Available"
    table.status = models.TableStatus.available
    
    # Store final duration in the session for record-keeping
    session.timePlayedInMinutes = duration_minutes

    db.commit()

    # Return a dictionary that matches the BillDetails schema in the Canvas
    return {
        "session_id": str(session.id),
        "total_minutes_played": duration_minutes,
        "base_charge": base_charge,
        "extra_minutes_played": extra_minutes_played,
        "per_minute_rate": per_minute_rate,
        "overtime_charge": overtime_charge,
        "time_based_cost": time_based_cost,
        "final_player_count": final_player_count,
        "extra_player_cost": extra_player_cost,
        "total_amount_due": total_amount_due,
    }

