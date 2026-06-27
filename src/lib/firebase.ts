import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getDatabase, type Database } from "firebase/database";

// ─── Config validation ────────────────────────────────────────────────────────

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[Firebase] Missing required environment variable: ${name}`
    );
  }
  return value;
}

// ─── Firebase Config ──────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    "NEXT_PUBLIC_FIREBASE_API_KEY"
  ),

  authDomain: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  ),

  projectId: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  ),

  storageBucket: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  ),

  messagingSenderId: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  ),

  appId: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    "NEXT_PUBLIC_FIREBASE_APP_ID"
  ),

  // Optional
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,

  // Needed because you are using RTDB
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// ─── Firebase Singletons ──────────────────────────────────────────────────────

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let rtdb: Database;

// ─── Initialize Firebase ──────────────────────────────────────────────────────

function initialiseFirebase(): void {
  // Prevent duplicate initialization during hot reload
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }

  // Services
  auth = getAuth(app);

  // Simple Firestore init (better for hackathon stability)
  db = getFirestore(app);

  storage = getStorage(app);

  // Realtime Database (you said you need this)
  rtdb = getDatabase(app);
}

initialiseFirebase();

// ─── Exports ──────────────────────────────────────────────────────────────────

export { app, auth, db, storage, rtdb };