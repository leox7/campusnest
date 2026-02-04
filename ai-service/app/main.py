from fastapi import FastAPI
from app.recommender import recommend_hostels
from app.sentiment import analyze_sentiment
from app.fraud import detect_anomaly

app = FastAPI()

@app.get("/")
def root():
    return {"message": "CampusNest AI Service running"}

@app.post("/recommend")
def recommend(data: dict):
    return recommend_hostels(data)

@app.post("/sentiment")
def sentiment(data: dict):
    return analyze_sentiment(data["text"])

@app.post("/fraud")
def fraud(data: dict):
    return detect_anomaly(data)
