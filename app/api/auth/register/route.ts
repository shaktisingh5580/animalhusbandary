import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json()

    // Validate role
    if (!["farmer", "veterinary", "government"].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 })
    }

    // Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
    })

    // Store additional user data in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      fullName,
      role,
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: "User registered successfully",
      uid: userRecord.uid,
    })
  } catch (error: any) {
    console.error("Error registering user:", error)

    return NextResponse.json({ error: error.message || "Failed to register user" }, { status: 500 })
  }
}

