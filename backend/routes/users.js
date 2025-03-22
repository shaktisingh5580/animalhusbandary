import express from "express"
import admin from "firebase-admin"
import { authenticateUser, checkRole } from "../middleware/auth.js"

const router = express.Router()
const db = admin.firestore()
const usersCollection = db.collection("users")

// Get user profile
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const userDoc = await usersCollection.doc(req.user.uid).get()

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" })
    }

    const userData = userDoc.data()

    // Remove sensitive information
    delete userData.password

    res.status(200).json({
      uid: req.user.uid,
      ...userData,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ error: "Failed to fetch user profile" })
  }
})

// Update user profile
router.put("/profile", authenticateUser, async (req, res) => {
  try {
    const { fullName, phoneNumber, address, location } = req.body

    const updateData = {}
    if (fullName) updateData.fullName = fullName
    if (phoneNumber) updateData.phoneNumber = phoneNumber
    if (address) updateData.address = address
    if (location) updateData.location = location

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp()

    await usersCollection.doc(req.user.uid).update(updateData)

    res.status(200).json({
      message: "Profile updated successfully",
      ...updateData,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    res.status(500).json({ error: "Failed to update user profile" })
  }
})

// Get all users (Government only)
router.get("/", authenticateUser, checkRole(["government"]), async (req, res) => {
  try {
    const usersSnapshot = await usersCollection.get()
    const users = []

    usersSnapshot.forEach((doc) => {
      const userData = doc.data()
      // Remove sensitive information
      delete userData.password

      users.push({
        uid: doc.id,
        ...userData,
      })
    })

    res.status(200).json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Get all veterinary officers (Farmer only)
router.get("/veterinarians", authenticateUser, checkRole(["farmer"]), async (req, res) => {
  try {
    const vetsSnapshot = await usersCollection.where("role", "==", "veterinary").get()
    const vets = []

    vetsSnapshot.forEach((doc) => {
      const userData = doc.data()
      // Include only necessary information
      vets.push({
        uid: doc.id,
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        location: userData.location,
      })
    })

    res.status(200).json(vets)
  } catch (error) {
    console.error("Error fetching veterinarians:", error)
    res.status(500).json({ error: "Failed to fetch veterinarians" })
  }
})

export default router

