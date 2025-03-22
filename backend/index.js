import express from "express"
import cors from "cors"
import admin from "firebase-admin"
import dotenv from "dotenv"
import medicineRoutes from "./routes/medicines.js"
import healthRoutes from "./routes/health.js"
import userRoutes from "./routes/users.js"
import notificationRoutes from "./routes/notifications.js"
import locationRoutes from "./routes/locations.js"

// Load environment variables
dotenv.config()

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
})

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use("/api/medicines", medicineRoutes)
app.use("/api/health", healthRoutes)
app.use("/api/users", userRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/locations", locationRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("Animal Husbandry Inventory System API is running")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app

