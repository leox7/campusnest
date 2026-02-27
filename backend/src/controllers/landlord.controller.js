import connection from "../config/db.js";

export const listMyHostels = (req, res) => {
  connection.query(
    "SELECT id, landlord_id, name, location, price, description, created_at FROM hostels WHERE landlord_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.status(200).json({ hostels: results });
    }
  );
};

export const createHostel = (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const location = typeof req.body.location === "string" ? req.body.location.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const price = Number(req.body.price);

  if (!name || !location || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ message: "Name, location, and a valid positive price are required" });
  }

  connection.query(
    "INSERT INTO hostels (landlord_id, name, location, price, description) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, name, location, price, description || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.status(201).json({
        message: "Hostel created successfully",
        hostelId: result.insertId,
      });
    }
  );
};

export const updateHostel = (req, res) => {
  const hostelId = Number.parseInt(req.params.id, 10);
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const location = typeof req.body.location === "string" ? req.body.location.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const price = Number(req.body.price);

  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }
  if (!name || !location || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ message: "Name, location, and a valid positive price are required" });
  }

  connection.query(
    "SELECT id FROM hostels WHERE id = ? AND landlord_id = ?",
    [hostelId, req.user.id],
    (findErr, hostels) => {
      if (findErr) return res.status(500).json({ error: findErr.message });
      if (hostels.length === 0) {
        return res.status(404).json({ message: "Hostel not found for this landlord" });
      }

      connection.query(
        "UPDATE hostels SET name = ?, location = ?, price = ?, description = ? WHERE id = ? AND landlord_id = ?",
        [name, location, price, description || null, hostelId, req.user.id],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: updateErr.message });
          return res.status(200).json({ message: "Hostel updated successfully" });
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
