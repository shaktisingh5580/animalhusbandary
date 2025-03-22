import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
}

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()

// Sample data for initial setup
const sampleMedicines = [
  {
    name: "Antibiotic X",
    category: "Antibiotics",
    quantity: 50,
    description: "Broad-spectrum antibiotic for bacterial infections",
    unitOfMeasure: "bottles",
    status: "in-stock",
    lastUpdated: new Date(),
  },
  {
    name: "Vitamin B Complex",
    category: "Vitamins",
    quantity: 120,
    description: "Essential vitamins for livestock health",
    unitOfMeasure: "packets",
    status: "in-stock",
    lastUpdated: new Date(),
  },
  {
    name: "Anthelmintic Y",
    category: "Parasiticides",
    quantity: 8,
    description: "Deworming medication for livestock",
    unitOfMeasure: "bottles",
    status: "low-stock",
    lastUpdated: new Date(),
  },
  {
    name: "Vaccine Z",
    category: "Vaccines",
    quantity: 0,
    description: "Preventive vaccine for common livestock diseases",
    unitOfMeasure: "vials",
    status: "out-of-stock",
    lastUpdated: new Date(),
  },
  {
    name: "Anti-inflammatory P",
    category: "Anti-inflammatories",
    quantity: 32,
    description: "Reduces inflammation and pain in animals",
    unitOfMeasure: "bottles",
    status: "in-stock",
    lastUpdated: new Date(),
  },
]

// Create collections and add sample data
async function initializeFirestore() {
  try {
    console.log("Starting Firestore initialization...")

    // Create medicines collection with sample data
    const medicinesBatch = db.batch()

    for (const medicine of sampleMedicines) {
      const medicineRef = db.collection("medicines").doc()
      medicinesBatch.set(medicineRef, medicine)
    }

    await medicinesBatch.commit()
    console.log("Sample medicines added successfully")

    // Create initial roles
    const roles = ["farmer", "veterinary", "government"]
    const rolesBatch = db.batch()

    for (const role of roles) {
      const roleRef = db.collection("roles").doc(role)
      rolesBatch.set(roleRef, {
        name: role,
        permissions: [],
        createdAt: new Date(),
      })
    }

    await rolesBatch.commit()
    console.log("Roles added successfully")

    // Create Firestore indexes (in a real scenario, you'd use the Firebase console or firebase.json)
    console.log("Firestore initialization completed successfully")
  } catch (error) {
    console.error("Error initializing Firestore:", error)
  }
}

// Run the initialization
initializeFirestore()

