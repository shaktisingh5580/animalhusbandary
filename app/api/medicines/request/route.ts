import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin"
import { getFirestore } from "firebase-admin/firestore"

export async function POST(request: Request) {
  try {
    // Get auth token from request
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Verify the token
    const decodedToken = await auth.verifyIdToken(token)
    const uid = decodedToken.uid

    // Get request data
    const { medicineName, medicineCategory, quantity, reason } = await request.json()

    // Validate request data
    if (!medicineName || !medicineCategory || !quantity || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create medicine request in Firestore
    const db = getFirestore()
    const requestRef = await db.collection("medicineRequests").add({
      userId: uid,
      medicineName,
      medicineCategory,
      quantity: Number(quantity),
      reason,
      status: "pending",
      requestedAt: new Date(),
    })

    // Send notification to veterinary officers (in a real application)
    // await sendNotificationToVets(medicineName, uid);

    return NextResponse.json({
      message: "Medicine request submitted successfully",
      requestId: requestRef.id,
    })
  } catch (error: any) {
    console.error("Error submitting medicine request:", error)

    return NextResponse.json({ error: error.message || "Failed to submit request" }, { status: 500 })
  }
}

