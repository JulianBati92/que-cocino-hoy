import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})),
      url = new URL(request.url);
    const id =
      body.data?.id ||
      body.id ||
      url.searchParams.get("id") ||
      url.searchParams.get("data.id");
    if (!id || !process.env.MERCADOPAGO_ACCESS_TOKEN)
      return NextResponse.json({ ok: true });
    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      },
    );
    if (!response.ok) return NextResponse.json({ ok: true });
    const subscription = await response.json(),
      uid = subscription.external_reference;
    if (!uid) return NextResponse.json({ ok: true });
    const active = subscription.status === "authorized";
    const expiresAt = new Date(
      active
        ? subscription.next_payment_date || Date.now() + 30 * 86400000
        : Date.now(),
    ).getTime();
    try {
      await adminDb()
        .collection("users")
        .doc(uid)
        .set(
          {
            plan: active ? "premium" : "free",
            subscriptionStatus: subscription.status,
            mercadoPagoSubscriptionId: String(id),
            expiresAt: new Date(expiresAt).toISOString(),
            updatedAt: new Date(),
          },
          { merge: true },
        );
    } catch {
      const account = await adminAuth().getUser(uid),
        claims = account.customClaims || {};
      await adminAuth().setCustomUserClaims(uid, {
        ...claims,
        membershipPlan: active ? "premium" : "free",
        membershipExpiresAt: expiresAt,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[mercadopago webhook]", error);
    return NextResponse.json({ ok: true });
  }
}
