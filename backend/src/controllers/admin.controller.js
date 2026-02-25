import connection from "../config/db.js";

const MANAGEABLE_ROLES = new Set(["student", "landlord", "admin"]);

export const listUsers = (req, res) => {
  connection.query(
    "SELECT id, full_name, email, user_role, created_at FROM users ORDER BY created_at DESC",
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
