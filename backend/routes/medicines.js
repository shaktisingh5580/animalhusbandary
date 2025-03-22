import express from "express"
import admin from "firebase-admin"
import { authenticateUser, checkRole } from "../middleware/auth.js"

const router = express.Router()
const db = admin.firestore()
const medicinesCollection = db.collection("medicines")
const requestsCollection = db.collection("medicineRequests")

// Get all medicines
router.get("/", authenticateUser, async (req, res) => {
  try {
    const medicinesSnapshot = await medicinesCollection.get()
    const medicines = []

    medicinesSnapshot.forEach((doc) => {
      medicines.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    res.status(200).json(medicines)
  } catch (error) {
    console.error("Error fetching medicines:", error)
    res.status(500).json({ error: "Failed to fetch medicines" })
  }
})

// Get a single medicine by ID
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const medicineDoc = await medicinesCollection.doc(req.params.id).get()

    if (!medicineDoc.exists) {
      return res.status(404).json({ error: "Medicine not found" })
    }

    res.status(200).json({
      id: medicineDoc.id,
      ...medicineDoc.data(),
    })
  } catch (error) {
    console.error("Error fetching medicine:", error)
    res.status(500).json({ error: "Failed to fetch medicine" })
  }
})

// Add a new medicine (Government and Vet only)
router.post("/", authenticateUser, checkRole(["government", "veterinary"]), async (req, res) => {
  try {
    const { name, category, quantity, description, unitOfMeasure } = req.body

    // Validate required fields
    if (!name || !category || !quantity) {
      return res.status(400).json({ error: "Name, category, and quantity are required" })
    }

    // Determine stock status
    let status = "in-stock"
    if (quantity <= 0) {
      status = "out-of-stock"
    } else if (quantity < 10) {
      status = "low-stock"
    }

    // Create medicine document
    const medicineData = {
      name,
      category,
      quantity: Number(quantity),
      description: description || "",
      unitOfMeasure: unitOfMeasure || "units",
      status,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid,
    }

    const docRef = await medicinesCollection.add(medicineData)

    // Add an audit log
    await db.collection("auditLogs").add({
      action: "add_medicine",
      medicineId: docRef.id,
      medicineName: name,
      userId: req.user.uid,
      userRole: req.userRole,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: medicineData,
    })

    res.status(201).json({
      id: docRef.id,
      ...medicineData,
    })
  } catch (error) {
    console.error("Error adding medicine:", error)
    res.status(500).json({ error: "Failed to add medicine" })
  }
})

// Update a medicine (Government and Vet only)
router.put("/:id", authenticateUser, checkRole(["government", "veterinary"]), async (req, res) => {
  try {
    const { name, category, quantity, description, unitOfMeasure } = req.body
    const medicineId = req.params.id

    // Get current medicine data
    const medicineDoc = await medicinesCollection.doc(medicineId).get()

    if (!medicineDoc.exists) {
      return res.status(404).json({ error: "Medicine not found" })
    }

    // Determine stock status
    let status = "in-stock"
    if (quantity <= 0) {
      status = "out-of-stock"
    } else if (quantity < 10) {
      status = "low-stock"
    }

    // Update data
    const updateData = {
      ...(name && { name }),
      ...(category && { category }),
      ...(quantity !== undefined && {
        quantity: Number(quantity),
        status,
      }),
      ...(description !== undefined && { description }),
      ...(unitOfMeasure && { unitOfMeasure }),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid,
    }

    await medicinesCollection.doc(medicineId).update(updateData)

    // Add audit log
    await db.collection("auditLogs").add({
      action: "update_medicine",
      medicineId,
      medicineName: name || medicineDoc.data().name,
      userId: req.user.uid,
      userRole: req.userRole,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: updateData,
    })

    res.status(200).json({
      id: medicineId,
      ...updateData,
    })
  } catch (error) {
    console.error("Error updating medicine:", error)
    res.status(500).json({ error: "Failed to update medicine" })
  }
})

// Request medicine (Farmer only)
router.post("/request", authenticateUser, checkRole(["farmer"]), async (req, res) => {
  try {
    const { medicineName, medicineCategory, quantity, reason } = req.body

    // Validate required fields
    if (!medicineName || !medicineCategory || !quantity || !reason) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // Create request
    const requestData = {
      userId: req.user.uid,
      medicineName,
      medicineCategory,
      quantity: Number(quantity),
      reason,
      status: "pending",
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const docRef = await requestsCollection.add(requestData)

    // Notify veterinary officers (in a real app, this would send a Firebase notification)
    // This is a placeholder for the notification logic

    res.status(201).json({
      id: docRef.id,
      ...requestData,
    })
  } catch (error) {
    console.error("Error requesting medicine:", error)
    res.status(500).json({ error: "Failed to request medicine" })
  }
})

// Get all medicine requests
router.get("/requests/all", authenticateUser, checkRole(["veterinary", "government"]), async (req, res) => {
  try {
    const requestsSnapshot = await requestsCollection.orderBy("requestedAt", "desc").get()
    const requests = []

    requestsSnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    res.status(200).json(requests)
  } catch (error) {
    console.error("Error fetching medicine requests:", error)
    res.status(500).json({ error: "Failed to fetch medicine requests" })
  }
})

// Get a farmer's medicine requests
router.get("/requests/my", authenticateUser, checkRole(["farmer"]), async (req, res) => {
  try {
    const requestsSnapshot = await requestsCollection
      .where("userId", "==", req.user.uid)
      .orderBy("requestedAt", "desc")
      .get()

    const requests = []

    requestsSnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    res.status(200).json(requests)
  } catch (error) {
    console.error("Error fetching medicine requests:", error)
    res.status(500).json({ error: "Failed to fetch medicine requests" })
  }
})

// Approve/Reject medicine request (Vet only)
router.put("/requests/:id", authenticateUser, checkRole(["veterinary"]), async (req, res) => {
  try {
    const { status, notes } = req.body
    const requestId = req.params.id

    // Validate status
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Valid status (approved/rejected) is required" })
    }

    // Get request data
    const requestDoc = await requestsCollection.doc(requestId).get()

    if (!requestDoc.exists) {
      return res.status(404).json({ error: "Request not found" })
    }

    const requestData = requestDoc.data()

    // Update request
    const updateData = {
      status,
      notes: notes || "",
      reviewedBy: req.user.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await requestsCollection.doc(requestId).update(updateData)

    // If approved, update medicine inventory
    if (status === "approved") {
      // Find the medicine in inventory
      const medicinesSnapshot = await medicinesCollection.where("name", "==", requestData.medicineName).limit(1).get()

      if (!medicinesSnapshot.empty) {
        const medicineDoc = medicinesSnapshot.docs[0]
        const medicineData = medicineDoc.data()

        // Update quantity
        const newQuantity = Math.max(0, medicineData.quantity - requestData.quantity)
        let newStatus = "in-stock"

        if (newQuantity <= 0) {
          newStatus = "out-of-stock"
        } else if (newQuantity < 10) {
          newStatus = "low-stock"
        }

        await medicinesCollection.doc(medicineDoc.id).update({
          quantity: newQuantity,
          status: newStatus,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        })

        // Add distribution record
        await db.collection("medicineDistributions").add({
          requestId,
          medicineId: medicineDoc.id,
          medicineName: requestData.medicineName,
          quantity: requestData.quantity,
          farmerId: requestData.userId,
          approvedBy: req.user.uid,
          distributedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }
    }

    // Notify the farmer (in a real app)
    // This is a placeholder for the notification logic

    res.status(200).json({
      id: requestId,
      ...updateData,
    })
  } catch (error) {
    console.error("Error processing medicine request:", error)
    res.status(500).json({ error: "Failed to process medicine request" })
  }
})

export default router

