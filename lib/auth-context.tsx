"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { signIn, signUp, signOut, getCurrentUserToken, setupTokenRefresh } from "./auth-utils"

type UserRole = "farmer" | "veterinary" | "government" | null

interface AuthContextType {
  user: User | null
  userRole: UserRole
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string, role: UserRole, fullName: string) => Promise<User>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          // Get user token for API calls
          await getCurrentUserToken(user)

          // Set up token refresh
          const cleanupRefresh = setupTokenRefresh(user)

          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role as UserRole)
          }

          return () => cleanupRefresh()
        } catch (error) {
          console.error("Error fetching user role:", error)
        }
      } else {
        setUserRole(null)
        localStorage.removeItem("authToken")
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    return await signIn(email, password)
  }

  const handleSignUp = async (email: string, password: string, role: UserRole, fullName: string) => {
    const user = await signUp(email, password)

    // Create user profile in Firestore via API
    const token = await getCurrentUserToken(user)

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, role, fullName }),
    })

    if (!response.ok) {
      // If profile creation fails, delete the auth user and throw error
      await signOut()
      throw new Error("Failed to create user profile")
    }

    return user
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

