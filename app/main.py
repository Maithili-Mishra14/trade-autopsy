from fastapi import FastAPI
from app.models import Trade
from app.analysis import analyze_trade, generate_insights, calculate_severity

app = FastAPI(title="Trade Autopsy API")

@app.post("/analyze-trade")
def analyze(trade: Trade):
    analysis = analyze_trade(trade)
    insights = generate_insights(trade, analysis)
    severity = calculate_severity(insights)

    return {
        "status": "success",
        "analysis": analysis,
        "insights": insights,
        "severity": severity
    }


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
