import connection from "../config/db.js";
import { checkFraud } from "../services/ai.client.js";

const ROOM_TYPES = new Set(["Single Room", "Shared", "Studio", "Apartment"]);
const AVAILABILITY_OPTIONS = new Set(["available", "full"]);

const asNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapLandlordHostels = (rows) => {
  const byId = new Map();

  rows.forEach((row) => {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        landlord_id: row.landlord_id,
        name: row.name,
        location: row.location,
        room_type: row.room_type,
        distance_km: Number(row.distance_km ?? 0),
        price: Number(row.price),
        description: row.description,
        utilities_included: Boolean(row.utilities_included),
        availability: row.availability,
        marker_x: Number(row.marker_x ?? 50),
        marker_y: Number(row.marker_y ?? 50),
        created_at: row.created_at,
        images: [],
      });
    }

    if (row.image_id) {
      byId.get(row.id).images.push({
        id: row.image_id,
        image_url: row.image_url,
        alt_text: row.alt_text || "",
        sort_order: row.sort_order,
        is_primary: Boolean(row.is_primary),
      });
    }
  });

  return [...byId.values()];
};

export const listMyHostels = (req, res) => {
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
      h.marker_x,
      h.marker_y,
      h.created_at,
      hi.id AS image_id,
      hi.image_url,
      hi.alt_text,
      hi.sort_order,
      hi.is_primary
    FROM hostels h
    LEFT JOIN hostel_images hi ON hi.hostel_id = h.id
    WHERE h.landlord_id = ?
    ORDER BY h.created_at DESC, hi.is_primary DESC, hi.sort_order ASC, hi.id ASC
  `;

  connection.query(
    sql,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.status(200).json({ hostels: mapLandlordHostels(results) });
    }
  );
};

export const createHostel = async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const location = typeof req.body.location === "string" ? req.body.location.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const roomType = typeof req.body.room_type === "string" ? req.body.room_type.trim() : "Single Room";
  const availability =
    typeof req.body.availability === "string" ? req.body.availability.trim().toLowerCase() : "available";
  const price = Number(req.body.price);
  const distanceKm = asNumberOrNull(req.body.distance_km);
  const markerX = asNumberOrNull(req.body.marker_x);
  const markerY = asNumberOrNull(req.body.marker_y);
  const utilitiesIncluded =
    typeof req.body.utilities_included === "boolean" ? req.body.utilities_included : true;

  if (!name || !location || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ message: "Name, location, and a valid positive price are required" });
  }
  if (!ROOM_TYPES.has(roomType)) {
    return res.status(400).json({ message: "Invalid room_type value" });
  }
  if (!AVAILABILITY_OPTIONS.has(availability)) {
    return res.status(400).json({ message: "Invalid availability value" });
  }
  if (distanceKm !== null && distanceKm < 0) {
    return res.status(400).json({ message: "distance_km must be zero or positive" });
  }
  if (markerX !== null && (markerX < 0 || markerX > 100)) {
    return res.status(400).json({ message: "marker_x must be between 0 and 100" });
  }
  if (markerY !== null && (markerY < 0 || markerY > 100)) {
    return res.status(400).json({ message: "marker_y must be between 0 and 100" });
  }

  // FR-25/FR-26: run the fraud/anomaly check. New listings are always unverified
  // (hostels.verified defaults to FALSE), so a flagged listing simply stays in the
  // admin pending list for manual review. Graceful: if the AI service is down,
  // checkFraud resolves to null and creation proceeds normally.
  const fraud = await checkFraud({
    name,
    location,
    price,
    distance_km: distanceKm ?? 0,
    room_type: roomType,
    description: description || "",
  });
  if (fraud?.flagged) {
    console.warn(`[landlord] new hostel "${name}" flagged by fraud check: ${(fraud.reasons || []).join("; ")}`);
  }

  connection.query(
    `INSERT INTO hostels
      (landlord_id, name, location, room_type, distance_km, price, description, utilities_included, availability, marker_x, marker_y)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      name,
      location,
      roomType,
      distanceKm ?? 0,
      price,
      description || null,
      utilitiesIncluded,
      availability,
      markerX ?? 50,
      markerY ?? 50,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.status(201).json({
        message: "Hostel created successfully",
        hostelId: result.insertId,
        flagged: Boolean(fraud?.flagged),
      });
    }
  );
};

export const updateHostel = async (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const location = typeof req.body.location === "string" ? req.body.location.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const roomType = typeof req.body.room_type === "string" ? req.body.room_type.trim() : "Single Room";
  const availability =
    typeof req.body.availability === "string" ? req.body.availability.trim().toLowerCase() : "available";
  const price = Number(req.body.price);
  const distanceKm = asNumberOrNull(req.body.distance_km);
  const markerX = asNumberOrNull(req.body.marker_x);
  const markerY = asNumberOrNull(req.body.marker_y);
  const utilitiesIncluded =
    typeof req.body.utilities_included === "boolean" ? req.body.utilities_included : true;

  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }
  if (!name || !location || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ message: "Name, location, and a valid positive price are required" });
  }
  if (!ROOM_TYPES.has(roomType)) {
    return res.status(400).json({ message: "Invalid room_type value" });
  }
  if (!AVAILABILITY_OPTIONS.has(availability)) {
    return res.status(400).json({ message: "Invalid availability value" });
  }
  if (distanceKm !== null && distanceKm < 0) {
    return res.status(400).json({ message: "distance_km must be zero or positive" });
  }
  if (markerX !== null && (markerX < 0 || markerX > 100)) {
    return res.status(400).json({ message: "marker_x must be between 0 and 100" });
  }
  if (markerY !== null && (markerY < 0 || markerY > 100)) {
    return res.status(400).json({ message: "marker_y must be between 0 and 100" });
  }

  connection.query(
    "SELECT id FROM hostels WHERE id = ? AND landlord_id = ?",
    [hostelId, req.user.id],
    async (findErr, hostels) => {
      if (findErr) return res.status(500).json({ error: findErr.message });
      if (hostels.length === 0) {
        return res.status(404).json({ message: "Hostel not found for this landlord" });
      }

      // FR-25/FR-26: re-run the fraud check on edit. If the updated listing looks
      // suspicious, send it back to pending (verified = FALSE) so an admin
      // re-reviews it before it is visible to students. Graceful: checkFraud
      // resolves to null if the AI service is down, leaving verification as-is.
      const fraud = await checkFraud({
        name,
        location,
        price,
        distance_km: distanceKm ?? 0,
        room_type: roomType,
        description: description || "",
      });
      const flagged = Boolean(fraud?.flagged);
      if (flagged) {
        console.warn(`[landlord] updated hostel ${hostelId} flagged by fraud check: ${(fraud.reasons || []).join("; ")}`);
      }
      const verifiedClause = flagged ? ", verified = FALSE" : "";

      connection.query(
        `UPDATE hostels
         SET name = ?, location = ?, room_type = ?, distance_km = ?, price = ?, description = ?, utilities_included = ?, availability = ?, marker_x = ?, marker_y = ?${verifiedClause}
         WHERE id = ? AND landlord_id = ?`,
        [
          name,
          location,
          roomType,
          distanceKm ?? 0,
          price,
          description || null,
          utilitiesIncluded,
          availability,
          markerX ?? 50,
          markerY ?? 50,
          hostelId,
          req.user.id,
        ],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: updateErr.message });
          return res.status(200).json({ message: "Hostel updated successfully", flagged });
        }
      );
    }
  );
};

export const deleteHostel = (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }

  connection.query(
    "DELETE FROM hostels WHERE id = ? AND landlord_id = ?",
    [hostelId, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Hostel not found for this landlord" });
      }
      return res.status(200).json({ message: "Hostel deleted successfully" });
    }
  );
};

export const addHostelImage = (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);
  const imageUrl = typeof req.body.image_url === "string" ? req.body.image_url.trim() : "";
  const altText = typeof req.body.alt_text === "string" ? req.body.alt_text.trim() : "";
  const sortOrder = Number.isFinite(Number(req.body.sort_order)) ? Number(req.body.sort_order) : 0;
  const isPrimary = Boolean(req.body.is_primary);

  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }
  if (!imageUrl) {
    return res.status(400).json({ message: "image_url is required" });
  }
  if (!/^https?:\/\//i.test(imageUrl)) {
    return res.status(400).json({ message: "image_url must be a valid http/https URL" });
  }

  connection.query(
    "SELECT id FROM hostels WHERE id = ? AND landlord_id = ?",
    [hostelId, req.user.id],
    (findErr, hostels) => {
      if (findErr) return res.status(500).json({ error: findErr.message });
      if (!hostels.length) return res.status(404).json({ message: "Hostel not found for this landlord" });

      const insertImage = () => {
        connection.query(
          "INSERT INTO hostel_images (hostel_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)",
          [hostelId, imageUrl, altText || null, sortOrder, isPrimary],
          (insertErr, result) => {
            if (insertErr) return res.status(500).json({ error: insertErr.message });
            return res.status(201).json({
              message: "Hostel image added successfully",
              imageId: result.insertId,
            });
          }
        );
      };

      if (isPrimary) {
        connection.query(
          "UPDATE hostel_images SET is_primary = FALSE WHERE hostel_id = ?",
          [hostelId],
          (clearErr) => {
            if (clearErr) return res.status(500).json({ error: clearErr.message });
            insertImage();
          }
        );
        return;
      }

      insertImage();
    }
  );
};

export const updateHostelImage = (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);
  const imageId = Number.parseInt(req.params.imageId, 10);
  const hasSortOrder = Object.prototype.hasOwnProperty.call(req.body, "sort_order");
  const hasPrimary = Object.prototype.hasOwnProperty.call(req.body, "is_primary");
  const sortOrder = hasSortOrder ? Number(req.body.sort_order) : null;
  const isPrimary = hasPrimary ? Boolean(req.body.is_primary) : null;

  if (!Number.isInteger(hostelId) || hostelId <= 0 || !Number.isInteger(imageId) || imageId <= 0) {
    return res.status(400).json({ message: "Invalid hostel/image ID" });
  }
  if (!hasSortOrder && !hasPrimary) {
    return res.status(400).json({ message: "Provide sort_order and/or is_primary to update" });
  }
  if (hasSortOrder && !Number.isFinite(sortOrder)) {
    return res.status(400).json({ message: "sort_order must be a valid number" });
  }

  connection.query(
    `SELECT hi.id
     FROM hostel_images hi
     INNER JOIN hostels h ON h.id = hi.hostel_id
     WHERE hi.id = ? AND hi.hostel_id = ? AND h.landlord_id = ?`,
    [imageId, hostelId, req.user.id],
    (findErr, rows) => {
      if (findErr) return res.status(500).json({ error: findErr.message });
      if (!rows.length) return res.status(404).json({ message: "Image not found for this landlord hostel" });

      const runUpdate = () => {
        const fields = [];
        const values = [];

        if (hasSortOrder) {
          fields.push("sort_order = ?");
          values.push(sortOrder);
        }
        if (hasPrimary) {
          fields.push("is_primary = ?");
          values.push(isPrimary);
        }
        values.push(imageId, hostelId);

        connection.query(
          `UPDATE hostel_images SET ${fields.join(", ")} WHERE id = ? AND hostel_id = ?`,
          values,
          (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            return res.status(200).json({ message: "Hostel image updated successfully" });
          }
        );
      };

      if (hasPrimary && isPrimary) {
        connection.query(
          "UPDATE hostel_images SET is_primary = FALSE WHERE hostel_id = ?",
          [hostelId],
          (clearErr) => {
            if (clearErr) return res.status(500).json({ error: clearErr.message });
            runUpdate();
          }
        );
        return;
      }

      runUpdate();
    }
  );
};

export const deleteHostelImage = (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);
  const imageId = Number.parseInt(req.params.imageId, 10);

  if (!Number.isInteger(hostelId) || hostelId <= 0 || !Number.isInteger(imageId) || imageId <= 0) {
    return res.status(400).json({ message: "Invalid hostel/image ID" });
  }

  connection.query(
    `DELETE hi
     FROM hostel_images hi
     INNER JOIN hostels h ON h.id = hi.hostel_id
     WHERE hi.id = ? AND hi.hostel_id = ? AND h.landlord_id = ?`,
    [imageId, hostelId, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Image not found for this landlord hostel" });
      }
      return res.status(200).json({ message: "Hostel image deleted successfully" });
    }
  );
};
