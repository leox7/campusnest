import connection from "../config/db.js";
import { getRecommendations } from "../services/ai.client.js";
import { logInteraction, getUserHostelHistory } from "../services/interactions.service.js";

const FILTER_OPTIONS = new Set(["top", "ai", "verified", "near", "budget", "premium"]);
const SORT_MAP = {
  price: "h.price ASC",
  distance: "h.distance_km ASC",
  rating: "r.avg_rating DESC, h.created_at DESC",
  relevance: "h.ai_pick DESC, h.verified DESC, r.avg_rating DESC, h.created_at DESC",
};

const asPositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const mapRowToHostel = (row) => ({
  id: row.id,
  landlordId: row.landlord_id,
  name: row.name,
  area: row.location,
  roomType: row.room_type,
  distanceKm: Number(row.distance_km ?? 0),
  price: Number(row.price),
  description: row.description,
  utilitiesIncluded: Boolean(row.utilities_included),
  availability: row.availability ?? "available",
  aiPick: Boolean(row.ai_pick),
  verified: Boolean(row.verified),
  rating: Number(row.rating ?? 0),
  averageRating: Number(row.average_rating ?? row.rating ?? 0),
  reviewsCount: Number(row.reviews_count ?? 0),
  markerX: Number(row.marker_x ?? 50),
  markerY: Number(row.marker_y ?? 50),
  images: [],
});

const mergeHostelRows = (rows) => {
  const byId = new Map();

  rows.forEach((row) => {
    if (!byId.has(row.id)) {
      byId.set(row.id, mapRowToHostel(row));
    }

    if (row.image_id) {
      byId.get(row.id).images.push({
        id: row.image_id,
        url: row.image_url,
        alt: row.alt_text || "",
        sortOrder: row.sort_order,
        isPrimary: Boolean(row.is_primary),
      });
    }
  });

  return [...byId.values()];
};

export const listHostels = (req, res) => {
  const filters = [];
  const params = [];

  const area = typeof req.query.area === "string" ? req.query.area.trim() : "";
  const roomType = typeof req.query.roomType === "string" ? req.query.roomType.trim() : "";
  const minPrice = asPositiveNumber(req.query.minPrice);
  const maxPrice = asPositiveNumber(req.query.maxPrice);
  const filter = typeof req.query.filter === "string" ? req.query.filter.trim().toLowerCase() : "";
  const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy.trim().toLowerCase() : "relevance";

  if (area) {
    filters.push("h.location LIKE ?");
    params.push(`%${area}%`);
  }
  if (roomType) {
    filters.push("h.room_type = ?");
    params.push(roomType);
  }
  if (minPrice !== null) {
    filters.push("h.price >= ?");
    params.push(minPrice);
  }
  if (maxPrice !== null) {
    filters.push("h.price <= ?");
    params.push(maxPrice);
  }

  if (filter && FILTER_OPTIONS.has(filter)) {
    if (filter === "top") filters.push("r.avg_rating >= 4.7");
    if (filter === "ai") filters.push("h.ai_pick = TRUE");
    if (filter === "verified") filters.push("h.verified = TRUE");
    if (filter === "near") filters.push("h.distance_km < 2");
    if (filter === "budget") filters.push("h.price <= 10000");
    if (filter === "premium") filters.push("h.price >= 22000");
  }

  filters.push("h.verified = TRUE");

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
  const orderBy = SORT_MAP[sortBy] || SORT_MAP.relevance;

  const sql = `
    SELECT
      h.id,
      h.landlord_id,
      h.name,
      h.location,
      h.room_type,
      h.distance_km,
      h.price,
      h.description,
      h.utilities_included,
      h.availability,
      h.ai_pick,
      h.verified,
      h.reviews_count,
      h.average_rating,
      h.marker_x,
      h.marker_y,
      COALESCE(r.avg_rating, 0) AS rating,
      hi.id AS image_id,
      hi.image_url,
      hi.alt_text,
      hi.sort_order,
      hi.is_primary
    FROM hostels h
    LEFT JOIN (
      SELECT hostel_id, AVG(rating) AS avg_rating
      FROM reviews
      GROUP BY hostel_id
    ) r ON r.hostel_id = h.id
    LEFT JOIN hostel_images hi ON hi.hostel_id = h.id
    ${whereClause}
    ORDER BY ${orderBy}, h.id DESC, hi.is_primary DESC, hi.sort_order ASC, hi.id ASC
  `;

  connection.query(sql, params, async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const hostels = mergeHostelRows(results);

    // FR-27: log the browse/search interaction (no specific hostel).
    logInteraction(req.user.id, null, "search");

    // FR-23: personalise via the AI service. Always graceful — if the service is
    // down, getRecommendations resolves to null and we return the list unchanged.
    try {
      const history = await getUserHostelHistory(req.user.id);
      const payload = hostels.map((hostel) => ({
        id: hostel.id,
        price: hostel.price,
        distance_km: hostel.distanceKm,
        room_type: hostel.roomType,
        rating: hostel.averageRating || hostel.rating,
      }));

      const recommendation = await getRecommendations(req.user.id, payload, history);
      const recommendedIds = recommendation?.recommendedIds || [];

      if (recommendedIds.length) {
        const recommendedSet = new Set(recommendedIds);
        hostels.forEach((hostel) => {
          if (recommendedSet.has(hostel.id)) hostel.aiPick = true;
        });

        // Float recommended hostels to the top when the user is on default sort.
        if (sortBy === "relevance") {
          const rank = new Map(recommendedIds.map((id, index) => [id, index]));
          hostels.sort(
            (a, b) =>
              (rank.has(a.id) ? rank.get(a.id) : Number.MAX_SAFE_INTEGER) -
              (rank.has(b.id) ? rank.get(b.id) : Number.MAX_SAFE_INTEGER)
          );
        }
      }
    } catch (aiError) {
      console.warn(`[hostels] recommendation step skipped: ${aiError.message}`);
    }

    return res.status(200).json({ hostels });
  });
};

export const getHostelById = (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }

  const sql = `
    SELECT
      h.id,
      h.landlord_id,
      h.name,
      h.location,
      h.room_type,
      h.distance_km,
      h.price,
      h.description,
      h.utilities_included,
      h.availability,
      h.ai_pick,
      h.verified,
      h.reviews_count,
      h.average_rating,
      h.marker_x,
      h.marker_y,
      COALESCE(r.avg_rating, 0) AS rating,
      hi.id AS image_id,
      hi.image_url,
      hi.alt_text,
      hi.sort_order,
      hi.is_primary
    FROM hostels h
    LEFT JOIN (
      SELECT hostel_id, AVG(rating) AS avg_rating
      FROM reviews
      GROUP BY hostel_id
    ) r ON r.hostel_id = h.id
    LEFT JOIN hostel_images hi ON hi.hostel_id = h.id
    WHERE h.id = ?
    ORDER BY hi.is_primary DESC, hi.sort_order ASC, hi.id ASC
  `;

  connection.query(sql, [hostelId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ message: "Hostel not found" });

    const [hostel] = mergeHostelRows(rows);

    if (req.user.role === "student" && !hostel.verified) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    logInteraction(req.user.id, hostelId, "view");
    return res.status(200).json({ hostel });
  });
};

export const toggleSavedHostel = (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);
  const studentId = req.user.id;

  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }

  connection.query(
    "SELECT id FROM hostels WHERE id = ?",
    [hostelId],
    (hostelErr, hostels) => {
      if (hostelErr) return res.status(500).json({ error: hostelErr.message });
      if (!hostels.length) return res.status(404).json({ message: "Hostel not found" });

      connection.query(
        "SELECT id FROM saved_hostels WHERE student_id = ? AND hostel_id = ?",
        [studentId, hostelId],
        (checkErr, savedRows) => {
          if (checkErr) return res.status(500).json({ error: checkErr.message });

          if (savedRows.length) {
            connection.query(
              "DELETE FROM saved_hostels WHERE student_id = ? AND hostel_id = ?",
              [studentId, hostelId],
              (deleteErr) => {
                if (deleteErr) return res.status(500).json({ error: deleteErr.message });
                return res.status(200).json({ saved: false });
              }
            );
            return;
          }

          connection.query(
            "INSERT INTO saved_hostels (student_id, hostel_id) VALUES (?, ?)",
            [studentId, hostelId],
            (insertErr) => {
              if (insertErr) return res.status(500).json({ error: insertErr.message });
              return res.status(200).json({ saved: true });
            }
          );
        }
      );
    }
  );
};

export const listSavedHostels = (req, res) => {
  const studentId = req.user.id;
  const sql = `
    SELECT
      h.id,
      h.landlord_id,
      h.name,
      h.location,
      h.room_type,
      h.distance_km,
      h.price,
      h.description,
      h.utilities_included,
      h.availability,
      h.ai_pick,
      h.verified,
      h.reviews_count,
      h.average_rating,
      h.marker_x,
      h.marker_y,
      COALESCE(r.avg_rating, 0) AS rating,
      hi.id AS image_id,
      hi.image_url,
      hi.alt_text,
      hi.sort_order,
      hi.is_primary
    FROM saved_hostels s
    INNER JOIN hostels h ON h.id = s.hostel_id
    LEFT JOIN (
      SELECT hostel_id, AVG(rating) AS avg_rating
      FROM reviews
      GROUP BY hostel_id
    ) r ON r.hostel_id = h.id
    LEFT JOIN hostel_images hi ON hi.hostel_id = h.id
    WHERE s.student_id = ?
    ORDER BY s.created_at DESC, hi.is_primary DESC, hi.sort_order ASC, hi.id ASC
  `;

  connection.query(sql, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(200).json({ hostels: mergeHostelRows(results) });
  });
};
