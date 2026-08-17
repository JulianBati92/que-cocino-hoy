import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
function app() {
  if (getApps().length) return getApps()[0];
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  if (
    !process.env.FIREBASE_ADMIN_PROJECT_ID ||
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !privateKey
  )
    throw new Error("Firebase Admin no configurado");
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}
export function adminDb() {
  return getFirestore(app());
}
export function adminAuth() {
  return getAuth(app());
}
export async function firebaseUser(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || "" };
  } catch {
    return null;
  }
}
