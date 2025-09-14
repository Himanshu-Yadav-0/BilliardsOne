import math
from decimal import Decimal
from app.models import models

def _calculate_extra_player_cost(pricing_rule: models.Pricing, final_player_count: int) -> Decimal:
    """
    Ek helper function jo sirf extra player ka charge calculate karta hai.
    """
    extra_player_cost = Decimal('0.0')
    base_players_allowed = 2  # Hum 2 players ko base maante hain
    if final_player_count > base_players_allowed:
        extra_players = final_player_count - base_players_allowed
        extra_player_price = Decimal(pricing_rule.extraPlayerPrice or '0.0')
        extra_player_cost = extra_players * extra_player_price
    return extra_player_cost

def calculate_pro_rata_bill(duration_minutes: int, pricing_rule: models.Pricing, final_player_count: int) -> dict:
    """
    Strategy 1: Pro-Rata Billing.
    Pehle 30 min ka fixed charge, uske baad per-minute.
    """
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
    extra_player_cost = _calculate_extra_player_cost(pricing_rule, final_player_count)
    total_amount_due = time_based_cost + extra_player_cost

    return {
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

def calculate_per_minute_bill(duration_minutes: int, pricing_rule: models.Pricing, final_player_count: int) -> dict:
    """
    Strategy 2: Per-Minute Billing.
    Shuru se hi per-minute charge.
    """
    per_minute_rate = Decimal(pricing_rule.hourPrice) / Decimal('60')
    time_based_cost = duration_minutes * per_minute_rate
    extra_player_cost = _calculate_extra_player_cost(pricing_rule, final_player_count)
    total_amount_due = time_based_cost + extra_player_cost

    return {
        "total_minutes_played": duration_minutes,
        "base_charge": Decimal('0.0'),  # Is model mein koi base charge nahi hai
        "extra_minutes_played": duration_minutes,
        "per_minute_rate": per_minute_rate,
        "overtime_charge": time_based_cost, # Poora time-based cost hi overtime hai
        "time_based_cost": time_based_cost,
        "final_player_count": final_player_count,
        "extra_player_cost": extra_player_cost,
        "total_amount_due": total_amount_due,
    }

def calculate_fixed_hour_bill(duration_minutes: int, pricing_rule: models.Pricing, final_player_count: int) -> dict:
    """
    Strategy 3: Fixed-Hour Billing (Purana System).
    Agle ghante pe round-up karna.
    """
    if duration_minutes <= 30 and pricing_rule.halfHourPrice is not None:
        time_based_cost = Decimal(pricing_rule.halfHourPrice)
    else:
        hours_played = math.ceil(duration_minutes / 60)
        # Agar 0 minutes ho toh 1 hour ka charge lagega
        if hours_played == 0:
            hours_played = 1
        time_based_cost = hours_played * Decimal(pricing_rule.hourPrice)

    extra_player_cost = _calculate_extra_player_cost(pricing_rule, final_player_count)
    total_amount_due = time_based_cost + extra_player_cost

    return {
        "total_minutes_played": duration_minutes,
        "base_charge": time_based_cost, # Is model mein base charge hi poora time cost hai
        "extra_minutes_played": 0,
        "per_minute_rate": Decimal(pricing_rule.hourPrice) / Decimal('60'),
        "overtime_charge": Decimal('0.0'),
        "time_based_cost": time_based_cost,
        "final_player_count": final_player_count,
        "extra_player_cost": extra_player_cost,
        "total_amount_due": total_amount_due,
    }
