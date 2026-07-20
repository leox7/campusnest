import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server authentication config is missing" });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    return next();
  };
};
