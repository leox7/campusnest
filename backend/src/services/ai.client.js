// REST client for the Python FastAPI AI microservice (ai-service/).
//
// Integration is REST-only (no Python imported into Node). Every call is wrapped
// so that if the AI service is slow, down, or returns an error, we resolve to a
// safe fallback value instead of throwing. This guarantees the main app keeps
// working when the AI service is unavailable (graceful degradation).
//
// Transport is Node's built-in fetch (Node 18+) with an AbortSignal timeout, so
// no extra dependency is needed.

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS) || 4000;

const postJson = async (path, body, fallback) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn(`[ai.client] ${path} responded ${response.status}`);
      return fallback;
    }
    return await response.json();
  } catch (error) {
    console.warn(`[ai.client] ${path} unavailable: ${error.message}`);
    return fallback;
  }
};

// FR-23. Returns { recommended: [{id, score}], recommendedIds: [...] } or null.
export const getRecommendations = (userId, hostels = [], history = []) =>
  postJson("/recommend", { userId, hostels, history }, null);

// FR-24. Returns { sentiment, score, model } or null.
export const analyzeSentiment = (text) => postJson("/sentiment", { text: text ?? "" }, null);

// FR-25/FR-26. Returns { flagged, score, reasons } or null.
export const checkFraud = (hostelData) => postJson("/fraud", hostelData ?? {}, null);

export default { getRecommendations, analyzeSentiment, checkFraud };
