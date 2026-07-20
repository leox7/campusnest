import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connection from "../config/db.js";

const PUBLIC_ROLES = new Set(["student", "landlord"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const getJwtConfig = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  };
};

// REGISTER
export const register = async (req, res) => {
  const fullName = typeof req.body.full_name === "string" ? req.body.full_name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const requestedRole =
    typeof req.body.user_role === "string" ? req.body.user_role.trim().toLowerCase() : "student";

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }
  if (!PASSWORD_POLICY_REGEX.test(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
    });
  }
  if (requestedRole === "admin") {
    return res.status(403).json({ message: "Admin registration is not allowed" });
  }
  if (!PUBLIC_ROLES.has(requestedRole)) {
    return res.status(400).json({ message: "Invalid role supplied" });
  }

  try {
    connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //insert the user into the database
        connection.query(
          "INSERT INTO users (full_name, email, password, user_role) VALUES (?, ?, ?, ?)",
          [fullName, email, hashedPassword, requestedRole],
          (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
              message: "User registered successfully",
              userId: result.insertId,
              role: requestedRole,
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
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const expectedRole =
    typeof req.body.expected_role === "string" ? req.body.expected_role.trim().toLowerCase() : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }
  if (expectedRole && !["student", "landlord", "admin"].includes(expectedRole)) {
    return res.status(400).json({ message: "Invalid expected role supplied" });
  }

  try {
    connection.query(
      "SELECT id, email, password, user_role FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = results[0];
        // compare the password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        if (expectedRole && user.user_role !== expectedRole) {
          return res.status(403).json({ message: `This account is not allowed for ${expectedRole} login` });
        }

        const jwtConfig = getJwtConfig();
        if (!jwtConfig) {
          return res.status(500).json({ message: "Server authentication config is missing" });
        }

        const token = jwt.sign(
          { id: user.id, role: user.user_role },
          jwtConfig.secret,
          { expiresIn: jwtConfig.expiresIn }
        );

        res.status(200).json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.user_role,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

