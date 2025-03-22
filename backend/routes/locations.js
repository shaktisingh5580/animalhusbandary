import express from "express"
import admin from "firebase-admin"
import { authenticateUser, checkRole } from "../middleware/auth.js"

const router = express.Router()
const db = admin.firestore()
const locationsCollection = db.collection("locations")

// Update user location
router.put("/", authenticateUser, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude are required" })
    }

    const locationData = {
      userId: req.user.uid,
      userRole: req.userRole,
      latitude,
      longitude,
      address: address || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Check if location document already exists
    const locationQuery = await locationsCollection.where("userId", "==", req.user.uid).limit(1).get()

    if (!locationQuery.empty) {
      // Update existing document
      await locationsCollection.doc(locationQuery.docs[0].id).update(locationData)
    } else {
      // Create new document
      await locationsCollection.add({
        ...locationData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }

    // Update user document with location
    await db
      .collection("users")
      .doc(req.user.uid)
      .update({
        location: {
          latitude,
          longitude,
          address: address || "",
        },
        locationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

    res.status(200).json({ message: "Location updated successfully" })
  } catch (error) {
    console.error("Error updating location:", error)
    res.status(500).json({ error: "Failed to update location" })
  }
})

// Get nearby veterinary services (Farmer only)
router.get("/services", authenticateUser, checkRole(["farmer"]), async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude are required" })
    }

    // Get all vet locations
    const vetsSnapshot = await locationsCollection.where("userRole", "==", "veterinary").get()

    const services = []
    const vetsData = []

    // Collect all vet locations
    vetsSnapshot.forEach((doc) => {
      const locationData = doc.data()
      vetsData.push({
        id: doc.id,
        ...locationData,
      })
    })

    // Calculate distance and filter
    const userLat = Number.parseFloat(latitude)
    const userLng = Number.parseFloat(longitude)

    for (const vet of vetsData) {
      const distance = calculateDistance(userLat, userLng, vet.latitude, vet.longitude)

      if (distance <= radius) {
        // Get vet details
        const vetDoc = await db.collection("users").doc(vet.userId).get()

        if (vetDoc.exists) {
          const vetData = vetDoc.data()

          services.push({
            id: vet.userId,
            name: vetData.fullName,
            address: vet.address || "No address specified",
            contact: vetData.phoneNumber || "No contact number",
            email: vetData.email,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
            latitude: vet.latitude,
            longitude: vet.longitude,
          })
        }
      }
    }

    // Sort by distance
    services.sort((a, b) => a.distance - b.distance)

    res.status(200).json(services)
  } catch (error) {
    console.error("Error fetching nearby services:", error)
    res.status(500).json({ error: "Failed to fetch nearby services" })
  }
})

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

export default router

