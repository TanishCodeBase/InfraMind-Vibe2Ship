import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getDatabase, type Database } from "firebase-admin/database";

function requireAdminEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Firebase Admin] Missing required environment variable: ${key}. ` +
      `Ensure this variable is configured in your server environment or .env.local.`
    );
  }
  return value;
}

let adminApp: App | null = null;

export function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else {
      const projectId = requireAdminEnv("FIREBASE_ADMIN_PROJECT_ID");
      const clientEmail = requireAdminEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
      const privateKey = requireAdminEnv("FIREBASE_ADMIN_PRIVATE_KEY");

      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    }
  }
  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminRtdb(): Database {
  return getDatabase(getAdminApp());
}
