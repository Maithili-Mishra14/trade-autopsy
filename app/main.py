from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Trade
from analysis import analyze_trade, generate_insights, calculate_severity

app = FastAPI(title="Trade Autopsy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
