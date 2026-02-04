def detect_anomaly(data):
    if data.get("price", 0) > 50000:
        return {"flagged": True}
    return {"flagged": False}
