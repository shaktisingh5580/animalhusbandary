import * as admin from "firebase-admin"

// Check if Firebase app is already initialized
if (!admin.apps.length) {
  // Initialize the app with service account credentials
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  })
}

// Export Firebase admin services
export const db = admin.firestore()
export const auth = admin.auth()
export const messaging = admin.messaging()

export default admin

