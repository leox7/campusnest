import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import landlordRoutes from "./routes/landlord.routes.js";
import hostelRoutes from "./routes/hostels.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/landlord", landlordRoutes);
app.use("/api/hostels", hostelRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

export default app;

