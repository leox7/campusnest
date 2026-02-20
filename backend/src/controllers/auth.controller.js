import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connection from "../config/db.js";

// REGISTER
export const register = async (req, res) => {
  const { full_name, email, password, user_role } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    // Check if user exists
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        connection.query(
          "INSERT INTO users (full_name, email, password, user_role) VALUES (?, ?, ?, ?)",
          [full_name, email, hashedPassword, user_role || "student"],
          (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
              message: "User registered successfully",
              userId: result.insertId,
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};
// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = results[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
          { id: user.id, role: user.user_role },
          "your_secret_key",
          { expiresIn: "1d" }
        );

        res.status(200).json({
          message: "Login successful",
          token,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

