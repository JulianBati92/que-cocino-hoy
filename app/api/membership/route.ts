import { NextResponse } from "next/server";
import {
  adminAuth,
  adminDb,
  firebaseUser,
  isAdminEmail,
} from "@/lib/firebase-admin";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await firebaseUser(request);
  if (!user)
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  const admin = isAdminEmail(user.email);
  try {
    const ref = adminDb().collection("users").doc(user.uid),
      snap = await ref.get();
    if (!snap.exists)
      await ref.set({
        email: user.email,
        plan: "free",
        freeUsed: 0,
        createdAt: new Date(),
      });
    const data = snap.exists ? snap.data()! : { plan: "free", freeUsed: 0 };
    const expiresAt =
      data.expiresAt?.toDate?.()?.toISOString?.() || data.expiresAt || null;
    const premium =
      admin ||
      data.plan === "admin" ||
      (data.plan === "premium" &&
        expiresAt &&
        new Date(expiresAt) > new Date());
    return NextResponse.json({
      plan: admin ? "admin" : data.plan || "free",
      freeRemaining: Math.max(0, 3 - (data.freeUsed || 0)),
      premium,
      expiresAt,
    });
  } catch {
    try {
      const account = await adminAuth().getUser(user.uid),
        claims = account.customClaims || {};
      const expiresAt = Number(claims.membershipExpiresAt || 0),
        plan = String(claims.membershipPlan || "free");
      const premium =
        admin ||
        plan === "admin" ||
        (plan === "premium" && expiresAt > Date.now());
      return NextResponse.json({
        plan: admin ? "admin" : plan,
        freeRemaining: Math.max(0, 3 - Number(claims.recipeFreeUsed || 0)),
        premium,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
    } catch {
      return NextResponse.json(
        { error: "No pudimos consultar la membresía" },
        { status: 503 },
      );
    }
  }
}
