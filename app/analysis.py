RULES = {
    "max_risk_pct": 1.0,
    "min_rr": 1.5
}

def analyze_trade(trade):
    # P&L
    if trade.direction == "long":
        pnl = (trade.exit_price - trade.entry_price) * trade.quantity
        risk_per_unit = trade.entry_price - trade.stop_loss
    else:
        pnl = (trade.entry_price - trade.exit_price) * trade.quantity
        risk_per_unit = trade.stop_loss - trade.entry_price

    risk_amount = risk_per_unit * trade.quantity
    risk_pct = (risk_amount / trade.capital) * 100 if trade.capital else 0

    reward = abs(trade.exit_price - trade.entry_price)
    rr_ratio = reward / abs(trade.entry_price - trade.stop_loss) if trade.stop_loss else None

    return {
        "pnl": round(pnl, 2),
        "risk_amount": round(risk_amount, 2),
        "risk_pct": round(risk_pct, 2),
        "rr_ratio": round(rr_ratio, 2) if rr_ratio else None
    }

def generate_insights(trade, analysis):
    insights = []

    # Rule 1: Stop loss check
    if trade.stop_loss == 0:
        insights.append({
            "type": "error",
            "message": "Trade has no stop-loss. Risk is undefined."
        })

    # Rule 2: Risk percentage
    if analysis["risk_pct"] > RULES["max_risk_pct"]:
        insights.append({
            "type": "error",
            "message": f"Risk per trade exceeded {RULES['max_risk_pct']}% of capital."
        })

    # Rule 3: Risk–Reward ratio
    if analysis["rr_ratio"] and analysis["rr_ratio"] < RULES["min_rr"]:
        insights.append({
            "type": "warning",
            "message": "Low risk–reward ratio. Trade expectancy is weak."
        })

    # Positive feedback
    if not insights:
        insights.append({
            "type": "good",
            "message": "NOTHING.Your Trade followed risk and discipline rules."
        })

    return insights

def calculate_severity(insights):
    """
    Severity levels:
    1 = Disciplined (no violations)
    2 = Questionable (warnings only)
    3 = High Risk (any error)
    """
    if any(i["type"] == "error" for i in insights):
        return 3
    if any(i["type"] == "warning" for i in insights):
        return 2
    return 1

