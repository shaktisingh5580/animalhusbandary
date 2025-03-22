import express from "express"
import admin from "firebase-admin"
import { authenticateUser } from "../middleware/auth.js"

const router = express.Router()
const db = admin.firestore()
const notificationsCollection = db.collection("notifications")

// Get user notifications
router.get("/", authenticateUser, async (req, res) => {
  try {
    const notificationsSnapshot = await notificationsCollection
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()

    const notifications = []

    notificationsSnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    res.status(200).json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ error: "Failed to fetch notifications" })
  }
})

// Mark notification as read
router.put("/:id/read", authenticateUser, async (req, res) => {
  try {
    const notificationId = req.params.id

    // Check if notification exists and belongs to user
    const notificationDoc = await notificationsCollection.doc(notificationId).get()

    if (!notificationDoc.exists) {
      return res.status(404).json({ error: "Notification not found" })
    }

    if (notificationDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Update notification
    await notificationsCollection.doc(notificationId).update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    res.status(200).json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ error: "Failed to mark notification as read" })
  }
})

// Send notification (internal function, not directly exposed as API)
export const sendNotification = async (userId, title, body, data = {}) => {
  try {
    // Create notification in Firestore
    await notificationsCollection.add({
      userId,
      title,
      body,
      data,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Get user's FCM token
    const userDoc = await db.collection("users").doc(userId).get()
    if (!userDoc.exists) {
      console.error("User not found when sending notification")
      return
    }

    const fcmToken = userDoc.data().fcmToken

    // If user has FCM token, send push notification
    if (fcmToken) {
      const message = {
        notification: {
          title,
          body,
        },
        data,
        token: fcmToken,
      }

      await admin.messaging().send(message)
    }
  } catch (error) {
    console.error("Error sending notification:", error)
  }
}

export default router

