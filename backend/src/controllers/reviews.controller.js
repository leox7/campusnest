import connection from "../config/db.js";

const MAX_COMMENT_LENGTH = 1000;

const mapReviewRow = (row) => ({
  id: row.id,
  rating: row.rating,
  comment: row.comment,
  reviewerName: row.reviewer_name,
  createdAt: row.created_at,
});

// POST /api/reviews
export const createReview = (req, res) => {
  const studentId = req.user.id;
  const hostelId = Number.parseInt(req.body.hostelId, 10);
  const rating = Number.parseInt(req.body.rating, 10);

  let comment = null;
  if (typeof req.body.comment === "string") {
    const trimmed = req.body.comment.trim();
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      return res
        .status(400)
        .json({ message: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer` });
    }
    comment = trimmed.length ? trimmed : null;
  }

  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be a whole number from 1 to 5" });
  }

  connection.query(
    "SELECT id FROM hostels WHERE id = ?",
    [hostelId],
    (hostelErr, hostels) => {
      if (hostelErr) return res.status(500).json({ error: hostelErr.message });
      if (!hostels.length) return res.status(404).json({ message: "Hostel not found" });

      connection.query(
        "SELECT id FROM bookings WHERE user_id = ? AND hostel_id = ? AND status = 'confirmed' LIMIT 1",
        [studentId, hostelId],
        (bookingErr, bookings) => {
          if (bookingErr) return res.status(500).json({ error: bookingErr.message });
          if (!bookings.length) {
            return res.status(403).json({
              message: "You can only review hostels you have confirmed bookings for",
            });
          }

          connection.query(
            "SELECT id FROM reviews WHERE user_id = ? AND hostel_id = ? LIMIT 1",
            [studentId, hostelId],
            (dupErr, existing) => {
              if (dupErr) return res.status(500).json({ error: dupErr.message });
              if (existing.length) {
                return res.status(409).json({ message: "You have already reviewed this hostel" });
              }

              connection.query(
                "INSERT INTO reviews (user_id, hostel_id, rating, comment) VALUES (?, ?, ?, ?)",
                [studentId, hostelId, rating, comment],
                (insertErr, result) => {
                  if (insertErr) return res.status(500).json({ error: insertErr.message });

                  const aggregateSql = `
                    UPDATE hostels h
                    SET
                      h.reviews_count = (SELECT COUNT(*) FROM reviews WHERE hostel_id = h.id),
                      h.average_rating = (SELECT AVG(rating) FROM reviews WHERE hostel_id = h.id)
                    WHERE h.id = ?
                  `;
                  connection.query(aggregateSql, [hostelId], (aggErr) => {
                    if (aggErr) return res.status(500).json({ error: aggErr.message });

                    connection.query(
                      "SELECT id, rating, comment, created_at FROM reviews WHERE id = ?",
                      [result.insertId],
                      (rowErr, rows) => {
                        if (rowErr) return res.status(500).json({ error: rowErr.message });
                        const row = rows[0];
                        return res.status(201).json({
                          review: {
                            id: row.id,
                            hostelId,
                            rating: row.rating,
                            comment: row.comment,
                            createdAt: row.created_at,
                          },
                        });
                      }
                    );
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};

// GET /api/hostels/:id/reviews
export const listReviews = (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }

  const sql = `
    SELECT
      r.id, r.rating, r.comment, r.created_at,
      u.full_name AS reviewer_name
    FROM reviews r
    INNER JOIN users u ON u.id = r.user_id
    WHERE r.hostel_id = ?
    ORDER BY r.created_at DESC
    LIMIT 50
  `;

  connection.query(sql, [hostelId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(200).json({ reviews: results.map(mapReviewRow) });
  });
};
