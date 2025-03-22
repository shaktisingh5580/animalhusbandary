import { auth } from "./firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { getIdToken } from "firebase/auth"

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const token = await getIdToken(userCredential.user)
    localStorage.setItem("authToken", token)
    return userCredential.user
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in")
  }
}

// Sign up with email and password
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const token = await getIdToken(userCredential.user)
    localStorage.setItem("authToken", token)
    return userCredential.user
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign up")
  }
}

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    localStorage.removeItem("authToken")
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out")
  }
}

// Get current user token
export const getCurrentUserToken = async (user: User | null) => {
  if (!user) return null

  try {
    const token = await getIdToken(user, true)
    localStorage.setItem("authToken", token)
    return token
  } catch (error) {
    console.error("Error getting user token:", error)
    return null
  }
}

// Refresh token periodically
export const setupTokenRefresh = (user: User) => {
  // Refresh token every 50 minutes (Firebase tokens expire after 1 hour)
  const refreshInterval = 50 * 60 * 1000 // 50 minutes in milliseconds

  const intervalId = setInterval(async () => {
    try {
      await getCurrentUserToken(user)
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
  }, refreshInterval)

  return () => clearInterval(intervalId)
}

