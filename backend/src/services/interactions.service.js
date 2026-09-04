// User interaction logging + history (FR-27).
//
// Writes events to user_interactions (view / click / search) and reads a small
// interaction history used to personalise recommendations. Writes are
// fire-and-forget: a logging failure must never break the user-facing request.

import connection from "../config/db.js";

const INTERACTION_TYPES = new Set(["view", "click", "search"]);

// Fire-and-forget insert into user_interactions. hostelId may be null (e.g. search).
export const logInteraction = (userId, hostelId, type) => {
  if (!userId || !INTERACTION_TYPES.has(type)) return;
  connection.query(
    "INSERT INTO user_interactions (user_id, hostel_id, interaction_type) VALUES (?, ?, ?)",
    [userId, hostelId ?? null, type],
    (err) => {
      if (err) console.warn(`[interactions] failed to log ${type}: ${err.message}`);
    }
  );
};

// Returns feature rows of hostels this user has recently interacted with, used as
// the "preference profile" for recommendations. Resolves to [] on any error.
export const getUserHostelHistory = (userId, limit = 20) =>
  new Promise((resolve) => {
    if (!userId) {
      resolve([]);
      return;
    }

    // Group by hostel so each appears once, ordered by its most recent
    // interaction. GROUP BY + MAX(created_at) is ONLY_FULL_GROUP_BY safe,
    // unlike SELECT DISTINCT with an ORDER BY on a non-selected column.
    const sql = `
      SELECT
        h.id,
        h.price,
        h.distance_km,
        h.room_type,
        COALESCE(h.average_rating, 0) AS rating,
        MAX(ui.created_at) AS last_seen
      FROM user_interactions ui
      INNER JOIN hostels h ON h.id = ui.hostel_id
      WHERE ui.user_id = ? AND ui.hostel_id IS NOT NULL
      GROUP BY h.id, h.price, h.distance_km, h.room_type, h.average_rating
      ORDER BY last_seen DESC
      LIMIT ?
    `;

    connection.query(sql, [userId, limit], (err, rows) => {
      if (err) {
        console.warn(`[interactions] history lookup failed: ${err.message}`);
        resolve([]);
        return;
      }
      resolve(
        rows.map((row) => ({
          id: row.id,
          price: Number(row.price),
          distance_km: Number(row.distance_km),
          room_type: row.room_type,
          rating: Number(row.rating),
        }))
      );
    });
  });
