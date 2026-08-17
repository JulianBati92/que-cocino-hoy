import { NextRequest, NextResponse } from "next/server";
import type { DocumentReference } from "firebase-admin/firestore";
import {
  adminAuth,
  adminDb,
  firebaseUser,
  isAdminEmail,
} from "@/lib/firebase-admin";
export const runtime = "nodejs";
const schema = {
  type: "object",
  required: ["recipes"],
  properties: {
    recipes: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        required: [
          "name",
          "summary",
          "matchPercentage",
          "difficulty",
          "minutes",
          "servings",
          "availableIngredients",
          "missingIngredients",
          "substitutions",
          "steps",
          "chefTip",
          "safetyNote",
          "emoji",
        ],
        properties: {
          name: { type: "string" },
          summary: { type: "string" },
          matchPercentage: { type: "integer" },
          difficulty: { type: "string" },
          minutes: { type: "integer" },
          servings: { type: "integer" },
          availableIngredients: { type: "array", items: { type: "string" } },
          missingIngredients: { type: "array", items: { type: "string" } },
          substitutions: { type: "array", items: { type: "string" } },
          steps: {
            type: "array",
            minItems: 7,
            maxItems: 14,
            items: { type: "string" },
          },
          chefTip: { type: "string" },
          safetyNote: { type: "string" },
          emoji: { type: "string" },
        },
      },
    },
  },
};
export async function POST(request: NextRequest) {
  let reservedUserRef: DocumentReference | null = null;
  let reservedFreeUse = false;
  let reservedInClaims = false;
  let reservedUid = "";
  try {
    const user = await firebaseUser(request);
    if (!user)
      return NextResponse.json(
        { error: "La sesión venció. Volvé a iniciar sesión." },
        { status: 401 },
      );
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey)
      return NextResponse.json(
        { error: "El servicio de recetas todavía no está configurado." },
        { status: 503 },
      );
    const body = await request.json(),
      { ingredients, meal, diet, minutes, servings, preferences, image } = body;
    if (!Array.isArray(ingredients) || !ingredients.length)
      return NextResponse.json(
        { error: "Agregá al menos un ingrediente." },
        { status: 400 },
      );
    if (ingredients.length > 50)
      return NextResponse.json(
        { error: "Podés consultar hasta 50 ingredientes por vez." },
        { status: 400 },
      );
    if (preferences && typeof preferences !== "string")
      return NextResponse.json(
        { error: "Las preferencias tienen un formato inválido." },
        { status: 400 },
      );
    if (typeof preferences === "string" && preferences.length > 500)
      return NextResponse.json(
        { error: "Las preferencias pueden tener hasta 500 caracteres." },
        { status: 400 },
      );
    if (image && (typeof image !== "string" || image.length > 14000000))
      return NextResponse.json(
        { error: "La foto es demasiado grande." },
        { status: 413 },
      );
    const db = adminDb(),
      userRef = db.collection("users").doc(user.uid);
    reservedUserRef = userRef;
    let access = { allowed: true, premium: true, freeUsed: 0 };
    try {
      access = await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(userRef),
          membership = snap.data() || { plan: "free", freeUsed: 0 };
        const expires =
          membership.expiresAt?.toDate?.() ||
          new Date(membership.expiresAt || 0);
        const premium =
          isAdminEmail(user.email) ||
          membership.plan === "admin" ||
          (membership.plan === "premium" && expires > new Date());
        const freeUsed = Number(membership.freeUsed || 0);
        if (!snap.exists)
          transaction.set(userRef, {
            email: user.email,
            plan: "free",
            freeUsed: premium ? 0 : 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        else if (!premium && freeUsed < 3)
          transaction.set(
            userRef,
            {
              email: user.email,
              freeUsed: freeUsed + 1,
              updatedAt: new Date(),
            },
            { merge: true },
          );
        return {
          allowed: premium || freeUsed < 3,
          premium,
          freeUsed: premium ? freeUsed : freeUsed + 1,
        };
      });
    } catch (quotaError) {
      const detail =
        quotaError instanceof Error ? quotaError.message : String(quotaError);
      if (
        !detail.includes("PERMISSION_DENIED") &&
        !detail.includes("insufficient permissions")
      )
        throw quotaError;
      console.warn(
        "[api/recipes] Firestore no disponible; usando Firebase Auth para el cupo",
        { uid: user.uid },
      );
      const account = await adminAuth().getUser(user.uid),
        claims = account.customClaims || {};
      const expiresAt = Number(claims.membershipExpiresAt || 0);
      const premium =
        isAdminEmail(user.email) ||
        claims.membershipPlan === "admin" ||
        (claims.membershipPlan === "premium" && expiresAt > Date.now());
      const freeUsed = Number(claims.recipeFreeUsed || 0);
      access = {
        allowed: premium || freeUsed < 3,
        premium,
        freeUsed: premium ? freeUsed : freeUsed + 1,
      };
      if (access.allowed && !premium) {
        await adminAuth().setCustomUserClaims(user.uid, {
          ...claims,
          recipeFreeUsed: freeUsed + 1,
        });
        reservedInClaims = true;
        reservedUid = user.uid;
      }
    }
    if (!access.allowed)
      return NextResponse.json(
        { error: "Ya utilizaste tus 3 generaciones gratuitas.", upgrade: true },
        { status: 402 },
      );
    reservedFreeUse = !access.premium;
    const prompt = `Sos un chef argentino práctico y experto en aprovechamiento de alimentos. Respondé en español rioplatense claro.
${image ? "Analizá la foto como referencia visual del plato que la persona quiere lograr. La identificación es aproximada; no afirmes ingredientes ocultos como certeza." : "No hay foto. Proponé recetas realistas basadas en lo disponible."}
Ingredientes disponibles declarados: ${ingredients.join(", ")}.
Preferencias generales: ${meal}; ${diet}; máximo ${minutes} minutos; ${servings} porciones.
Gustos, rechazos y formas de preparación indicadas por la persona: ${typeof preferences === "string" && preferences.trim() ? preferences.trim() : "No indicó preferencias adicionales"}.
Respetá estas preferencias de forma estricta. Un ingrediente rechazado en una preparación puede usarse sólo si la persona indicó explícitamente otra forma en la que sí lo acepta. No confundas rechazo de una textura o cocción con rechazo total del ingrediente. Explicá brevemente en cada propuesta cómo se respetó lo indicado.
Devolvé exactamente 5 opciones diferentes, completas y realistas. Es preferible entregar cinco recetas excelentes y detalladas antes que muchas ideas superficiales. Priorizá estrictamente cocinar con los ingredientes disponibles: las primeras opciones deben poder hacerse sin comprar nada o con un máximo de 1 o 2 faltantes opcionales. No conviertas ingredientes faltantes en obligatorios si existe un reemplazo razonable con algo declarado. Ordená por similitud visual, si hay foto, coincidencia con lo disponible y menor cantidad de compras. matchPercentage mide cuánto puede acercarse al resultado usando lo disponible, entre 1 y 100.
Escribí cada receta para una persona que nunca cocinó. availableIngredients y missingIngredients deben incluir cantidades concretas para las porciones solicitadas, por ejemplo "2 huevos" o "200 g de arroz", sin asumir que la persona sabe calcularlas. Indicá también la presentación previa necesaria: lavar, pelar, cortar, escurrir, descongelar o precalentar.
Cada receta debe tener entre 7 y 14 pasos, en orden estricto. Cada paso debe ser autosuficiente y explicar: qué utensilio usar, qué hacer exactamente, temperatura o intensidad del fuego, tiempo aproximado y la señal visual o de textura que confirma que está listo. Evitá instrucciones vagas como "cocinar hasta que esté listo", "condimentar a gusto" o "mezclar bien" sin explicar cómo. Si una preparación puede salir mal, explicá en ese mismo paso cómo prevenirlo o corregirlo. Incluí precalentado, reposos, armado y forma de servir cuando correspondan. Un paso puede tener de 2 a 4 oraciones si hace falta.
substitutions explica reemplazos concretos con cantidades equivalentes para comprar menos. chefTip debe aportar una mejora práctica o una solución a un error frecuente. No inventes disponibilidad.
Si la preferencia es "Apta para personas con diabetes", proponé platos orientativos con verduras sin almidón, proteínas magras, porciones moderadas de carbohidratos de calidad, más fibra y sin azúcares agregados; evitá granos refinados cuando haya alternativa. No afirmes que una receta controla la glucemia ni reemplaces indicaciones médicas. Indicá en safetyNote que las necesidades varían y que debe revisar porciones y carbohidratos con su profesional tratante. Señalá además cocción segura, alérgenos o alimentos crudos cuando corresponda.`;
    const parts: Array<Record<string, unknown>> = [{ text: prompt }];
    if (image) {
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(image);
      if (!match)
        return NextResponse.json(
          { error: "La imagen tiene un formato inválido." },
          { status: 400 },
        );
      parts.unshift({ inlineData: { mimeType: match[1], data: match[2] } });
    }
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: schema,
            temperature: 0.45,
          },
        }),
      },
    );
    const raw = (await response.json()) as {
      error?: { status?: string };
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    if (!response.ok) {
      const status = raw.error?.status;
      throw new Error(
        status === "RESOURCE_EXHAUSTED"
          ? "Se alcanzó el límite de consultas. Probá más tarde."
          : "El servicio no pudo procesar esta consulta.",
      );
    }
    const text = raw.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
    if (!text) throw new Error("Gemini devolvió una respuesta vacía");
    const result = JSON.parse(text);
    reservedFreeUse = false;
    reservedInClaims = false;
    return NextResponse.json({
      ...result,
      freeRemaining: access.premium ? null : Math.max(0, 3 - access.freeUsed),
    });
  } catch (error) {
    console.error("[api/recipes] error", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (reservedFreeUse && reservedUserRef) {
      try {
        await adminDb().runTransaction(async (transaction) => {
          const snap = await transaction.get(reservedUserRef!);
          const used = Number(snap.data()?.freeUsed || 0);
          transaction.set(
            reservedUserRef!,
            { freeUsed: Math.max(0, used - 1), updatedAt: new Date() },
            { merge: true },
          );
        });
      } catch (rollbackError) {
        console.error("[api/recipes] rollback error", rollbackError);
      }
    }
    if (reservedInClaims && reservedUid) {
      try {
        const account = await adminAuth().getUser(reservedUid),
          claims = account.customClaims || {},
          used = Number(claims.recipeFreeUsed || 0);
        await adminAuth().setCustomUserClaims(reservedUid, {
          ...claims,
          recipeFreeUsed: Math.max(0, used - 1),
        });
      } catch (rollbackError) {
        console.error("[api/recipes] claims rollback error", rollbackError);
      }
    }
    const detail = error instanceof Error ? error.message : "";
    const message = detail.includes("Firebase Admin no configurado")
      ? "El acceso de usuarios todavía no está configurado en el servidor."
      : detail.startsWith("Se alcanzó") ||
          detail.startsWith("El servicio no pudo")
        ? detail
        : "No pudimos generar las recetas. Intentá nuevamente en unos minutos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
