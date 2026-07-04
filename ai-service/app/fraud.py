"""Listing fraud / anomaly detection (FR-25, FR-26).

An unsupervised scikit-learn IsolationForest is fit on a synthetic baseline of
"normal" hostel listings at import time, then each incoming listing is scored.
IsolationForest fits this problem well: it needs no labelled fraud data and flags
listings whose feature combination (price, distance, room type) is an outlier
versus typical listings. A few hard sanity rules catch obviously bad values
regardless of the model.

The Node backend uses the result to keep a flagged hostel `verified = false`, so
it surfaces in the admin pending list for manual review (no `is_flagged` column
is added to the schema).
"""

import numpy as np
from sklearn.ensemble import IsolationForest

ROOM_TYPES = ["Single Room", "Shared", "Studio", "Apartment"]

# Rough realistic monthly rent (KES) per room type for the baseline distribution.
_BASE_PRICE = {"Single Room": 10000, "Shared": 6000, "Studio": 18000, "Apartment": 25000}
_PRICE_SPREAD = 4000
_HARD_MIN_PRICE = 1500
_HARD_MAX_PRICE = 60000
_HARD_MAX_DISTANCE = 30.0

_model = None


def _features(price, distance, room_type):
    room_index = ROOM_TYPES.index(room_type) if room_type in ROOM_TYPES else 0
    return [price, distance, room_index]


def _train_baseline(seed=42, samples=600):
    rng = np.random.default_rng(seed)
    per_type = max(samples // len(_BASE_PRICE), 1)
    rows = []
    for room_type, base in _BASE_PRICE.items():
        prices = rng.normal(base, _PRICE_SPREAD, per_type)
        distances = np.abs(rng.normal(2.5, 1.5, per_type))
        for price, distance in zip(prices, distances):
            rows.append(_features(max(price, _HARD_MIN_PRICE), distance, room_type))
    model = IsolationForest(contamination=0.05, random_state=seed)
    model.fit(np.array(rows, dtype=float))
    return model


def _get_model():
    global _model
    if _model is None:
        _model = _train_baseline()
    return _model


def _num(value, default=0.0):
    try:
        result = float(value)
        if np.isnan(result) or np.isinf(result):
            return default
        return result
    except (TypeError, ValueError):
        return default


def detect_anomaly(data):
    try:
        price = _num(data.get("price"))
        distance = _num(data.get("distance_km"))
        room_type = data.get("room_type") or "Single Room"

        reasons = []
        if price < _HARD_MIN_PRICE:
            reasons.append("price below realistic minimum")
        if price > _HARD_MAX_PRICE:
            reasons.append("price above realistic maximum")
        if distance > _HARD_MAX_DISTANCE:
            reasons.append("distance from campus is implausibly large")

        model = _get_model()
        features = np.array([_features(price, distance, room_type)], dtype=float)
        prediction = int(model.predict(features)[0])  # -1 anomaly, 1 normal
        raw_score = float(model.decision_function(features)[0])  # lower = more anomalous

        model_flag = prediction == -1
        if model_flag and not reasons:
            reasons.append("listing attributes are unusual versus typical listings")

        return {
            "flagged": bool(reasons) or model_flag,
            "score": round(raw_score, 4),
            "reasons": reasons,
            "model": "isolation-forest",
        }
    except Exception as error:
        # On any model error, do not block the listing; report not-flagged.
        return {"flagged": False, "score": 0.0, "reasons": [], "error": str(error)}
