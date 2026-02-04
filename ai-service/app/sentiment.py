def analyze_sentiment(text):
    if "good" in text.lower():
        return {"sentiment": "positive"}
    return {"sentiment": "neutral"}
