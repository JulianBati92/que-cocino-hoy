import { NextResponse } from "next/server";
import { firebaseUser } from "@/lib/firebase-admin";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const user = await firebaseUser(request);
  if (!user)
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken)
    return NextResponse.json(
      { error: "Los pagos todavía no están configurados" },
      { status: 503 },
    );
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://quecocinohoy.vercel.app";
  const response = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: "Que Cocino Hoy Premium",
      external_reference: user.uid,
      payer_email: user.email,
      back_url: appUrl,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 15000,
        currency_id: "ARS",
      },
      status: "pending",
    }),
  });
  const data = await response.json();
  if (!response.ok)
    return NextResponse.json(
      { error: "No pudimos iniciar la suscripción" },
      { status: 502 },
    );
  return NextResponse.json({ url: data.init_point });
}
