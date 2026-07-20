import connection from "../config/db.js";

const MANAGEABLE_ROLES = new Set(["student", "landlord", "admin"]);
const mapHostelRow = (row) => ({
  id: row.id,
  landlordId: row.landlord_id,
  name: row.name,
  location: row.location,
  roomType: row.room_type,
  distanceKm: Number(row.distance_km ?? 0),
  price: Number(row.price ?? 0),
  description: row.description || "",
  utilitiesIncluded: Boolean(row.utilities_included),
  aiPick: Boolean(row.ai_pick),
  verified: Boolean(row.verified),
  reviewsCount: Number(row.reviews_count ?? 0),
  markerX: Number(row.marker_x ?? 50),
  markerY: Number(row.marker_y ?? 50),
  availability: row.availability || "available",
  createdAt: row.created_at,
  landlord: {
    id: row.landlord_id,
    name: row.landlord_name,
    email: row.landlord_email,
  },
  images: [],
});

export const listUsers = (req, res) => {
  connection.query(
    "SELECT id, full_name, email, user_role, is_active, created_at FROM users ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.status(200).json({ users: results });
    }
  );
};

export const updateUserRole = (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);
  const nextRole = typeof req.body.user_role === "string" ? req.body.user_role.trim().toLowerCase() : "";

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  if (!MANAGEABLE_ROLES.has(nextRole)) {
    return res.status(400).json({ message: "Invalid role supplied" });
  }
  if (req.user.id === userId && nextRole !== "admin") {
    return res.status(400).json({ message: "Admin cannot remove their own admin role" });
  }

  connection.query("SELECT id FROM users WHERE id = ?", [userId], (findErr, users) => {
    if (findErr) return res.status(500).json({ error: findErr.message });
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    connection.query(
      "UPDATE users SET user_role = ? WHERE id = ?",
      [nextRole, userId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        return res.status(200).json({ message: "User role updated successfully" });
      }
    );
  });
};

// NOTE: Deactivating a user does not invalidate any JWT they already hold.
// Enforcing that immediately would require a token blocklist or short expiry,
// which is out of scope for Phase 5. A deactivated user keeps access until
// their current token expires.
export const updateUserActive = (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);
  const rawActive = req.body.is_active;
  const canParseBool =
    typeof rawActive === "boolean" || rawActive === "true" || rawActive === "false";
  const isActive = rawActive === true || rawActive === "true";

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  if (!canParseBool) {
    return res.status(400).json({ message: "is_active must be true or false" });
  }
  if (req.user.id === userId) {
    return res.status(400).json({ message: "Admin cannot deactivate their own account" });
  }

  connection.query("SELECT id FROM users WHERE id = ?", [userId], (findErr, users) => {
    if (findErr) return res.status(500).json({ error: findErr.message });
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    connection.query(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [isActive, userId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        return res.status(200).json({
          message: isActive ? "User activated successfully" : "User deactivated successfully",
        });
      }
    );
  });
};

export const listHostels = (req, res) => {
  const sql = `
    SELECT
      h.id,
      h.landlord_id,
      h.name,
      h.location,
      h.room_type,
      h.distance_km,
      h.price,
      h.verified,
      h.availability,
      h.created_at,
      u.full_name AS landlord_name,
      u.email AS landlord_email
    FROM hostels h
    INNER JOIN users u ON u.id = h.landlord_id
    ORDER BY h.created_at DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(200).json({ hostels: results });
  });
};

export const verifyHostel = (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);
  const rawVerified = req.body.verified;
  const canParseBoolean = typeof rawVerified === "boolean" || rawVerified === "true" || rawVerified === "false";
  const verified = rawVerified === true || rawVerified === "true";

  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }
  if (!canParseBoolean) {
    return res.status(400).json({ message: "verified must be true or false" });
  }

  connection.query("SELECT id FROM hostels WHERE id = ?", [hostelId], (findErr, hostels) => {
    if (findErr) return res.status(500).json({ error: findErr.message });
    if (hostels.length === 0) return res.status(404).json({ message: "Hostel not found" });

    connection.query(
      "UPDATE hostels SET verified = ? WHERE id = ?",
      [verified, hostelId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        return res.status(200).json({
          message: verified ? "Hostel verified successfully" : "Hostel marked as unverified",
        });
      }
    );
  });
};

export const getHostelByIdForAdmin = (req, res) => {
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
      h.ai_pick,
      h.verified,
      h.reviews_count,
      h.marker_x,
      h.marker_y,
      h.availability,
      h.created_at,
      u.full_name AS landlord_name,
      u.email AS landlord_email,
      hi.id AS image_id,
      hi.image_url,
      hi.alt_text,
      hi.sort_order,
      hi.is_primary
    FROM hostels h
    INNER JOIN users u ON u.id = h.landlord_id
    LEFT JOIN hostel_images hi ON hi.hostel_id = h.id
    WHERE h.id = ?
    ORDER BY hi.is_primary DESC, hi.sort_order ASC, hi.id ASC
  `;

  connection.query(sql, [hostelId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ message: "Hostel not found" });

    const hostel = mapHostelRow(rows[0]);
    hostel.images = rows
      .filter((row) => row.image_id)
      .map((row) => ({
        id: row.image_id,
        url: row.image_url,
        alt: row.alt_text || "",
        sortOrder: row.sort_order ?? 0,
        isPrimary: Boolean(row.is_primary),
      }));

    return res.status(200).json({ hostel });
  });
};
