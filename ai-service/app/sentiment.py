"""Review sentiment analysis (FR-24) using NLTK's VADER model.

VADER is a pretrained lexicon + rule based sentiment model tuned for short,
informal text (exactly what hostel reviews look like), so it needs no training
data. We load the lexicon lazily and download it once if missing; if the
environment is offline we fall back to a tiny built-in keyword lexicon so the
endpoint never fails.
"""

_analyzer = None
_fallback = False

_POSITIVE = {
    "good", "great", "excellent", "clean", "safe", "comfortable", "friendly",
    "spacious", "affordable", "love", "recommend", "nice", "quiet", "perfect",
}
_NEGATIVE = {
    "bad", "dirty", "noisy", "unsafe", "expensive", "rude", "small", "broken",
    "scam", "terrible", "poor", "awful", "horrible", "avoid", "cramped",
}


def _load_analyzer():
    """Initialise the VADER analyzer once; switch to fallback if unavailable."""
    global _analyzer, _fallback
    if _analyzer is not None or _fallback:
        return
    try:
        import nltk
        from nltk.sentiment.vader import SentimentIntensityAnalyzer

        try:
            nltk.data.find("sentiment/vader_lexicon.zip")
        except LookupError:
            nltk.download("vader_lexicon", quiet=True)
        _analyzer = SentimentIntensityAnalyzer()
    except Exception:
        _fallback = True


def _classify(compound):
    if compound >= 0.05:
        return "positive"
    if compound <= -0.05:
        return "negative"
    return "neutral"


def _fallback_score(text):
    words = [word.strip(".,!?;:'\"") for word in text.lower().split()]
    positive = sum(1 for word in words if word in _POSITIVE)
    negative = sum(1 for word in words if word in _NEGATIVE)
    total = positive + negative
    if total == 0:
        return 0.0
    return (positive - negative) / total


def analyze_sentiment(text):
    text = (text or "").strip()
    if not text:
        return {"sentiment": "neutral", "score": 0.0, "model": "none"}

    _load_analyzer()
    if _analyzer is not None:
        compound = _analyzer.polarity_scores(text)["compound"]
        return {"sentiment": _classify(compound), "score": round(compound, 4), "model": "vader"}

    score = _fallback_score(text)
    return {"sentiment": _classify(score), "score": round(score, 4), "model": "lexicon-fallback"}
