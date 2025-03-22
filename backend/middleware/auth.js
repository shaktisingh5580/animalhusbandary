import admin from "firebase-admin"

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" })
    }

    const token = authHeader.split(" ")[1]

    const decodedToken = await admin.auth().verifyIdToken(token)
    req.user = decodedToken

    next()
  } catch (error) {
    console.error("Authentication error:", error)
    return res.status(401).json({ error: "Unauthorized: Invalid token" })
  }
}

export const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { uid } = req.user

      // Get user's role from Firestore
      const userDoc = await admin.firestore().collection("users").doc(uid).get()

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" })
      }

      const userData = userDoc.data()
      const userRole = userData.role

      // Check if user's role is allowed
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" })
      }

      // Add user role to request
      req.userRole = userRole
      next()
    } catch (error) {
      console.error("Role verification error:", error)
      return res.status(500).json({ error: "Role verification failed" })
    }
  }
}

