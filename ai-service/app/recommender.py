"""Content-based hostel recommender (FR-23).

Uses scikit-learn to rank candidate hostels for a student. Each hostel becomes a
small feature vector (scaled price / distance / rating plus a one-hot of the room
type) and every candidate is scored by cosine similarity to a "preference
profile" built from the hostels the student has already interacted with.

This is intentionally a lightweight, stateless content-based model: each request
carries the candidate hostels (and optional history), so there is no model file
to persist and it behaves well on a small marketplace dataset. New users with no
history fall back to a transparent quality score (cheaper, closer, higher rated).
"""

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

ROOM_TYPES = ["Single Room", "Shared", "Studio", "Apartment"]
TOP_PICKS = 3


def _numeric(value, default=0.0):
    try:
        result = float(value)
        if np.isnan(result) or np.isinf(result):
            return default
        return result
    except (TypeError, ValueError):
        return default


def _room_one_hot(room_type):
    vector = [0.0] * len(ROOM_TYPES)
    if room_type in ROOM_TYPES:
        vector[ROOM_TYPES.index(room_type)] = 1.0
    return vector


def _numeric_matrix(items):
    return np.array(
        [
            [
                _numeric(item.get("price")),
                _numeric(item.get("distance_km")),
                _numeric(item.get("rating")),
            ]
            for item in items
        ],
        dtype=float,
    )


def _quality_scores(numeric):
    """Fallback for users with no history: cheaper + closer + higher rated."""
    rating = numeric[:, 2]
    price = numeric[:, 0]
    distance = numeric[:, 1]

    def _norm(column, invert=False):
        span = column.max() - column.min()
        if span == 0:
            return np.zeros_like(column)
        scaled = (column - column.min()) / span
        return 1 - scaled if invert else scaled

    return 0.5 * _norm(rating) + 0.3 * _norm(price, invert=True) + 0.2 * _norm(distance, invert=True)


def recommend_hostels(user_input):
    try:
        hostels = user_input.get("hostels") or []
        history = user_input.get("history") or []

        if not hostels:
            return {"recommended": [], "recommendedIds": []}

        candidate_numeric = _numeric_matrix(hostels)
        candidate_rooms = np.array([_room_one_hot(h.get("room_type")) for h in hostels])

        scaler = StandardScaler()
        scaled_candidates = scaler.fit_transform(candidate_numeric)
        candidate_features = np.hstack([scaled_candidates, candidate_rooms])

        if history:
            history_numeric = _numeric_matrix(history)
            history_rooms = np.array([_room_one_hot(h.get("room_type")) for h in history])
            scaled_history = scaler.transform(history_numeric)
            history_features = np.hstack([scaled_history, history_rooms])
            profile = history_features.mean(axis=0, keepdims=True)
            scores = cosine_similarity(candidate_features, profile).ravel()
        else:
            scores = _quality_scores(candidate_numeric)

        ranked = sorted(
            (
                {"id": hostels[i].get("id"), "score": round(float(scores[i]), 4)}
                for i in range(len(hostels))
            ),
            key=lambda row: row["score"],
            reverse=True,
        )
        recommended_ids = [row["id"] for row in ranked[:TOP_PICKS] if row["id"] is not None]

        return {"recommended": ranked, "recommendedIds": recommended_ids}
    except Exception as error:  # never break the API on a model error
        return {"recommended": [], "recommendedIds": [], "error": str(error)}
