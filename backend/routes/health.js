import express from "express"
import admin from "firebase-admin"
import { authenticateUser, checkRole } from "../middleware/auth.js"

const router = express.Router()
const db = admin.firestore()
const healthReportsCollection = db.collection("healthReports")

// Create a health report (Farmer only)
router.post("/reports", authenticateUser, checkRole(["farmer"]), async (req, res) => {
  try {
    const { animalType, symptoms, count, location, additionalInfo } = req.body

    // Validate required fields
    if (!animalType || !symptoms || !count) {
      return res.status(400).json({ error: "Animal type, symptoms, and count are required" })
    }

    // Determine priority based on symptoms (simplified logic)
    let priority = "low"
    const urgentSymptoms = ["difficulty breathing", "severe bleeding", "paralysis", "seizure", "collapse"]
    const highPrioritySymptoms = ["fever", "diarrhea", "vomiting", "lameness", "swelling"]

    if (urgentSymptoms.some((symptom) => symptoms.toLowerCase().includes(symptom))) {
      priority = "high"
    } else if (highPrioritySymptoms.some((symptom) => symptoms.toLowerCase().includes(symptom))) {
      priority = "medium"
    }

    // Create report
    const reportData = {
      userId: req.user.uid,
      animalType,
      symptoms,
      count: Number(count),
      location: location || "Not specified",
      additionalInfo: additionalInfo || "",
      priority,
      status: "pending",
      reportDate: admin.firestore.FieldValue.serverTimestamp(),
      attachments: [],
    }

    const docRef = await healthReportsCollection.add(reportData)

    // Notify veterinary officers for high priority (in a real app)
    // This is a placeholder for notification logic

    res.status(201).json({
      id: docRef.id,
      ...reportData,
    })
  } catch (error) {
    console.error("Error creating health report:", error)
    res.status(500).json({ error: "Failed to create health report" })
  }
})

// Get all health reports (Vet and Gov only)
router.get("/reports", authenticateUser, checkRole(["veterinary", "government"]), async (req, res) => {
  try {
    const reportsSnapshot = await healthReportsCollection.orderBy("reportDate", "desc").get()

    const reports = []

    reportsSnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    res.status(200).json(reports)
  } catch (error) {
    console.error("Error fetching health reports:", error)
    res.status(500).json({ error: "Failed to fetch health reports" })
  }
})

// Get a farmer's health reports
router.get("/reports/my", authenticateUser, checkRole(["farmer"]), async (req, res) => {
  try {
    const reportsSnapshot = await healthReportsCollection
      .where("userId", "==", req.user.uid)
      .orderBy("reportDate", "desc")
      .get()

    const reports = []

    reportsSnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    res.status(200).json(reports)
  } catch (error) {
    console.error("Error fetching health reports:", error)
    res.status(500).json({ error: "Failed to fetch health reports" })
  }
})

// Get a single health report
router.get("/reports/:id", authenticateUser, async (req, res) => {
  try {
    const reportDoc = await healthReportsCollection.doc(req.params.id).get()

    if (!reportDoc.exists) {
      return res.status(404).json({ error: "Health report not found" })
    }

    const reportData = reportDoc.data()

    // If farmer, check if it's their report
    if (req.userRole === "farmer" && reportData.userId !== req.user.uid) {
      return res.status(403).json({ error: "Access denied" })
    }

    res.status(200).json({
      id: reportDoc.id,
      ...reportData,
    })
  } catch (error) {
    console.error("Error fetching health report:", error)
    res.status(500).json({ error: "Failed to fetch health report" })
  }
})

// Update health report status (Vet only)
router.put("/reports/:id", authenticateUser, checkRole(["veterinary"]), async (req, res) => {
  try {
    const { status, diagnosis, treatment, notes } = req.body
    const reportId = req.params.id

    // Validate status
    if (!status || !["in-review", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Valid status (in-review/resolved) is required" })
    }

    // Get report data
    const reportDoc = await healthReportsCollection.doc(reportId).get()

    if (!reportDoc.exists) {
      return res.status(404).json({ error: "Health report not found" })
    }

    // Update report
    const updateData = {
      status,
      reviewedBy: req.user.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    if (diagnosis) updateData.diagnosis = diagnosis
    if (treatment) updateData.treatment = treatment
    if (notes) updateData.vetNotes = notes

    await healthReportsCollection.doc(reportId).update(updateData)

    // Notify the farmer (in a real app)
    // This is a placeholder for the notification logic

    res.status(200).json({
      id: reportId,
      ...updateData,
    })
  } catch (error) {
    console.error("Error updating health report:", error)
    res.status(500).json({ error: "Failed to update health report" })
  }
})

// Add a comment to a health report
router.post("/reports/:id/comments", authenticateUser, async (req, res) => {
  try {
    const { comment } = req.body
    const reportId = req.params.id

    if (!comment) {
      return res.status(400).json({ error: "Comment is required" })
    }

    // Get report to verify it exists
    const reportDoc = await healthReportsCollection.doc(reportId).get()
    if (!reportDoc.exists) {
      return res.status(404).json({ error: "Health report not found" })
    }

    // Create comment
    const commentData = {
      reportId,
      userId: req.user.uid,
      userRole: req.userRole,
      comment,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }

    const commentRef = await db.collection("healthReportComments").add(commentData)

    // Update the report with comment count
    await healthReportsCollection.doc(reportId).update({
      commentCount: admin.firestore.FieldValue.increment(1),
      lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    res.status(201).json({
      id: commentRef.id,
      ...commentData,
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    res.status(500).json({ error: "Failed to add comment" })
  }
})

// Get comments for a health report
router.get("/reports/:id/comments", authenticateUser, async (req, res) => {
  try {
    const reportId = req.params.id

    // Verify report exists and user has access
    const reportDoc = await healthReportsCollection.doc(reportId).get()

    if (!reportDoc.exists) {
      return res.status(404).json({ error: "Health report not found" })
    }

    // If farmer, check if it's their report
    if (req.userRole === "farmer" && reportDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Get comments
    const commentsSnapshot = await db
      .collection("healthReportComments")
      .where("reportId", "==", reportId)
      .orderBy("timestamp", "asc")
      .get()

    const comments = []

    commentsSnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    res.status(200).json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    res.status(500).json({ error: "Failed to fetch comments" })
  }
})

export default router

