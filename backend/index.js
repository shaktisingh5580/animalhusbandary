import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import medicinesRoutes from "./routes/medicines.js";
import healthRoutes from "./routes/health.js";
import locationsRoutes from "./routes/locations.js";
import notificationsRoutes from "./routes/notifications.js";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Ensure proper formatting
    }),
  });
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/medicines", medicinesRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/notifications", notificationsRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Animal Husbandry Inventory System API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
