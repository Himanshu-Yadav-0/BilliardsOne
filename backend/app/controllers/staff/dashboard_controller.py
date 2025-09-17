from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models import models

def get_staff_dashboard_data(db: Session, staff: models.Staff): # Yahaan 'staff' object ek Owner bhi ho sakta hai
    # --- NAYA, CORRECTED LOGIC ---
    # Hum pehle check karenge ki 'staff' object ke paas .cafe attribute hai ya nahi,
    # jo hamare dependency ne add kiya tha.
    if hasattr(staff, 'cafe') and staff.cafe is not None:
        cafe = staff.cafe
        cafe_id = cafe.id
    else:
        # Agar yeh ek normal staff member hai, toh uski default properties use karein
        cafe = staff.cafe
        cafe_id = staff.cafe_id

    tables = db.query(models.Table).filter(models.Table.cafe_id == cafe_id).order_by(models.Table.tableName).all()
    pricing_rules = db.query(models.Pricing).filter(models.Pricing.cafe_id == cafe_id).all()

    table_statuses = []
    for table in tables:
        status_info = {
            "id": table.id,
            "tableName": table.tableName,
            "tableType": table.tableType.value,
            "status": table.status.value
        }
        if table.status == models.TableStatus.in_use:
            active_session = db.query(models.GameSession).filter(
                models.GameSession.table_id == table.id,
                models.GameSession.endTime == None
            ).first()
            
            if active_session:
                now = datetime.now(timezone.utc)
                elapsed = now - active_session.startTime
                
                hours, remainder = divmod(elapsed.total_seconds(), 3600)
                minutes, seconds = divmod(remainder, 60)

                status_info["current_session_id"] = active_session.id
                status_info["startTime"] = active_session.startTime
                status_info["elapsed_time"] = f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"
                
                latest_player_change = db.query(models.PlayerChange).filter(
                    models.PlayerChange.session_id == active_session.id
                ).order_by(models.PlayerChange.timestamp.desc()).first()
                status_info["current_players"] = latest_player_change.numberOfPlayers if latest_player_change else 0
        
        table_statuses.append(status_info)

    return {
        "cafeName": cafe.cafeName, 
        "tables": table_statuses,
        "pricing_rules": pricing_rules
    }

