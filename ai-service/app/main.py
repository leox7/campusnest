from fastapi import FastAPI

from app.recommender import recommend_hostels
from app.sentiment import analyze_sentiment
from app.fraud import detect_anomaly

app = FastAPI(title="CampusNest AI Service", version="1.0.0")


@app.get("/")
def root():
    return {"message": "CampusNest AI Service running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/recommend")
def recommend(data: dict):
    # Expects { userId, hostels: [...], history: [...] }
    return recommend_hostels(data or {})


@app.post("/sentiment")
def sentiment(data: dict):
    # Expects { text }
    return analyze_sentiment((data or {}).get("text", ""))


@app.post("/fraud")
def fraud(data: dict):
    # Expects a hostel payload with at least price, distance_km, room_type
    return detect_anomaly(data or {})
