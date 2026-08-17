"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseApiKey, firebaseAuth } from "@/lib/firebase-client";

type Recipe = {
  name: string;
  summary: string;
  matchPercentage: number;
  difficulty: string;
  minutes: number;
  servings: number;
  availableIngredients: string[];
  missingIngredients: string[];
  substitutions: string[];
  steps: string[];
  chefTip: string;
  safetyNote: string;
  emoji: string;
};
const quick = [
  "Huevos",
  "Arroz",
  "Papas",
  "Cebolla",
  "Tomate",
  "Pollo",
  "Queso",
  "Fideos",
];
const loginSlides = [
  {
    image: "/login-family.jpg",
    kicker: "MENOS DESPERDICIO",
    title: "Cociná mejor.",
    accent: "Comprá menos.",
    text: "Transformá lo que ya tenés en una comida que todos quieran compartir.",
  },
  {
    image: "/login-generations.jpg",
    kicker: "RECETAS QUE UNEN",
    title: "Sabores de siempre.",
    accent: "Ideas para hoy.",
    text: "Combiná tus ingredientes con recetas simples, ricas y hechas para compartir.",
  },
  {
    image: "/login-together.jpg",
    kicker: "TU COCINA, MÁS FÁCIL",
    title: "Más momentos.",
    accent: "Menos dudas.",
    text: "Decidí qué cocinar en segundos y disfrutá más tiempo alrededor de la mesa.",
  },
  {
    image: "/login-world.jpg",
    kicker: "INSPIRACIÓN SIN FRONTERAS",
    title: "Ingredientes simples.",
    accent: "Grandes historias.",
    text: "Descubrí nuevas formas de cocinar con lo que ya está esperando en tu cocina.",
  },
];

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]),
    [entry, setEntry] = useState("");
  const [meal, setMeal] = useState("Cualquiera"),
    [diet, setDiet] = useState("Sin restricciones");
  const [minutes, setMinutes] = useState(45),
    [servings, setServings] = useState(2);
  const [preferences, setPreferences] = useState("");
  const [image, setImage] = useState<string | null>(null),
    [imageName, setImageName] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]),
    [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null),
    [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [loginLoading, setLoginLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [registering, setRegistering] = useState(false),
    [name, setName] = useState(""),
    [confirmPassword, setConfirmPassword] = useState(""),
    [accepted, setAccepted] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]),
    resultsRef = useRef<HTMLElement>(null);
  const [loginSlide, setLoginSlide] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("firebase_id_token");
    if (!saved) {
      setAuthReady(true);
    } else {
      fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: saved }),
        },
      )
        .then((response) => {
          if (response.ok) setToken(saved);
          else localStorage.removeItem("firebase_id_token");
        })
        .finally(() => setAuthReady(true));
    }
    setFavorites(JSON.parse(localStorage.getItem("recipe_favorites") || "[]"));
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  useEffect(() => {
    const timer = window.setInterval(
      () => setLoginSlide((current) => (current + 1) % loginSlides.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, []);

  function add(raw = entry) {
    const values = raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    setIngredients((old) => {
      const next = [...old];
      values.forEach((v) => {
        if (!next.some((x) => x.toLowerCase() === v.toLowerCase()))
          next.push(v);
      });
      return next;
    });
    setEntry("");
  }
  function photo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setError("Elegí una imagen válida de hasta 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setImageName(file.name);
      setError("");
    };
    reader.readAsDataURL(file);
  }
  function favorite(name: string) {
    setFavorites((old) => {
      const next = old.includes(name)
        ? old.filter((x) => x !== name)
        : [...old, name];
      localStorage.setItem("recipe_favorites", JSON.stringify(next));
      return next;
    });
  }
  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setError("");
    try {
      if (registering && password !== confirmPassword)
        throw new Error("Las contraseñas no coinciden.");
      if (registering && !accepted)
        throw new Error("Tenés que aceptar los términos de uso.");
      const action = registering ? "signUp" : "signInWithPassword";
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${firebaseApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            returnSecureToken: true,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.idToken)
        throw new Error(
          registering
            ? "No pudimos crear la cuenta. Revisá el correo o usá una contraseña de al menos 6 caracteres."
            : "Correo o contraseña incorrectos.",
        );
      if (registering && name.trim())
        await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${firebaseApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: data.idToken,
              displayName: name.trim(),
              returnSecureToken: true,
            }),
          },
        );
      localStorage.setItem("firebase_id_token", data.idToken);
      setToken(data.idToken);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No pudimos completar el acceso.",
      );
    } finally {
      setLoginLoading(false);
    }
  }
  function logout() {
    localStorage.removeItem("firebase_id_token");
    setToken(null);
  }
  async function googleLogin() {
    setLoginLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(
          firebaseAuth,
          new GoogleAuthProvider(),
        ),
        idToken = await result.user.getIdToken();
      localStorage.setItem("firebase_id_token", idToken);
      setToken(idToken);
    } catch {
      setError("No pudimos iniciar sesión con Google.");
    } finally {
      setLoginLoading(false);
    }
  }
  async function subscribe() {
    if (!token) return;
    setLoginLoading(true);
    try {
      const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }),
        data = await response.json();
      if (!response.ok) throw new Error(data.error);
      location.href = data.url;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "No pudimos iniciar el pago",
      );
    } finally {
      setLoginLoading(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Volvé a iniciar sesión.");
      return;
    }
    if (!ingredients.length) {
      setError("Agregá al menos un ingrediente.");
      return;
    }
    setLoading(true);
    setError("");
    setRecipes([]);
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredients,
          meal,
          diet,
          minutes,
          servings,
          preferences,
          image,
        }),
      });
      const data = await response.json();
      if (response.status === 401) logout();
      if (response.status === 402 || data.upgrade) {
        setUpgradeOpen(true);
        return;
      }
      if (!response.ok)
        throw new Error(data.error || "No se pudo crear la receta.");
      setRecipes(data.recipes || []);
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
      if (data.freeRemaining === 0) setTimeout(() => setUpgradeOpen(true), 900);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!authReady)
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-brand">
            <BrandIcon />
            <strong>¿Qué Cocino Hoy?</strong>
          </div>
          <p>Preparando tu cocina…</p>
        </section>
      </main>
    );
  if (!token)
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-brand">
            <BrandIcon />
            <div>
              <strong>¿Qué Cocino Hoy?</strong>
              <small>Tu cocina, tus ingredientes</small>
            </div>
          </div>
          <span className="eyebrow">ACCESO PRIVADO</span>
          <h1>{registering ? "Crear cuenta" : "Bienvenido"}</h1>
          <p>
            {registering
              ? "Completá tus datos para comenzar a crear recetas."
              : "Iniciá sesión para crear recetas con lo que tenés disponible."}
          </p>
          <form onSubmit={login}>
            {registering && (
              <label>
                <span>Nombre y apellido</span>
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </label>
            )}
            <label>
              <span>Correo electrónico</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={!registering}
              />
            </label>
            <label>
              <span>Contraseña</span>
              <input
                type="password"
                minLength={6}
                autoComplete={registering ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {registering && (
              <>
                <label>
                  <span>Repetir contraseña</span>
                  <input
                    type="password"
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </label>
                <label className="terms">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  <span>
                    Acepto los términos de uso y la política de privacidad.
                  </span>
                </label>
              </>
            )}
            {error && <div className="login-error">{error}</div>}
            <button disabled={loginLoading}>
              {loginLoading
                ? registering
                  ? "Creando cuenta…"
                  : "Ingresando…"
                : registering
                  ? "Crear mi cuenta"
                  : "Iniciar sesión"}
            </button>
          </form>
          <button
            className="google-login"
            onClick={googleLogin}
            disabled={loginLoading}
          >
            G  Continuar con Google
          </button>
          <button
            className="switch-auth"
            onClick={() => {
              setRegistering((value) => !value);
              setError("");
            }}
          >
            {registering
              ? "Ya tengo una cuenta"
              : "¿No tenés cuenta? Registrate"}
          </button>
          <small className="login-safe">
            🔒 Acceso protegido y sesión privada.
          </small>
        </section>
        <div className="login-art" aria-live="polite">
          {loginSlides.map((slide, index) => (
            <div
              className={`login-slide ${index === loginSlide ? "active" : ""}`}
              key={slide.image}
              aria-hidden={index !== loginSlide}
            >
              <img src={slide.image} alt="" />
              <span className="login-shade" />
              <div className="login-copy">
                <span className="login-kicker">{slide.kicker}</span>
                <h2>
                  {slide.title}
                  <br />
                  <em>{slide.accent}</em>
                </h2>
                <p>{slide.text}</p>
              </div>
            </div>
          ))}
          <div className="slide-controls" aria-label="Historias destacadas">
            {loginSlides.map((slide, index) => (
              <button
                type="button"
                key={slide.image}
                className={index === loginSlide ? "active" : ""}
                onClick={() => setLoginSlide(index)}
                aria-label={`Ver historia ${index + 1}`}
              />
            ))}
          </div>
          <small className="slide-count">
            0{loginSlide + 1} / 0{loginSlides.length}
          </small>
        </div>
      </main>
    );

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#inicio">
          <BrandIcon />
          <span>
            <strong>¿Qué Cocino Hoy?</strong>
            <small>Tu asistente de cocina</small>
          </span>
        </a>
        <div className="account-actions">
          <button className="premium-button" onClick={subscribe}>
            <img src="/icon-premium.svg" alt="" />
            Premium · $15.000/mes
          </button>
          <button className="key-status" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <section className="home-hero" id="inicio">
        <div className="home-hero-copy">
          <span className="eyebrow">TU COCINA, UNA NUEVA IDEA</span>
          <h1>
            Decidir qué cocinar puede ser <em>muy fácil.</em>
          </h1>
          <p>
            Mostranos una foto del plato que te inspira o contanos qué
            ingredientes tenés. En segundos vas a recibir cinco recetas claras,
            posibles y adaptadas a vos.
          </p>
          <div className="hero-actions">
            <a href="#crear">
              Crear mi primera receta <span>→</span>
            </a>
            <a className="hero-guide" href="#como-funciona">
              Ver cómo funciona
            </a>
          </div>
          <div className="trust">
            <span>✦ 3 pruebas gratis</span>
            <span>✦ Paso a paso detallado</span>
            <span>✦ Menos desperdicio</span>
          </div>
        </div>
        <div className="home-visual">
          <img
            src="/login-together.jpg"
            alt="Familia preparando una comida casera"
          />
          <span className="home-visual-shade" />
          <div className="visual-caption">
            <small>UNA IDEA PARA HOY</small>
            <strong>
              Lo que ya tenés
              <br />
              puede sorprenderte.
            </strong>
          </div>
          <div className="visual-badge">
            <b>5</b>
            <span>
              recetas por
              <br />
              cada pedido
            </span>
          </div>
        </div>
      </section>
      <section className="how" id="como-funciona">
        <div className="how-head">
          <span className="eyebrow">ASÍ DE SIMPLE</span>
          <h2>Tres pasos. Una comida resuelta.</h2>
          <p>
            No necesitás saber cocinar ni escribir instrucciones complicadas.
            Nosotros te guiamos.
          </p>
        </div>
        <div className="how-grid">
          <article>
            <span>01</span>
            <img src="/icon-photo.svg" alt="" />
            <h3>Mostrá tu idea</h3>
            <p>
              Subí una foto del plato que querés lograr. Es opcional: también
              podés empezar sólo con tus ingredientes.
            </p>
          </article>
          <article>
            <span>02</span>
            <img src="/icon-ingredients.svg" alt="" />
            <h3>Contanos qué tenés</h3>
            <p>
              Escribí los ingredientes de tu cocina y elegí tiempo, porciones y
              tipo de alimentación.
            </p>
          </article>
          <article>
            <span>03</span>
            <img src="/icon-recipe.svg" alt="" />
            <h3>Elegí y cociná</h3>
            <p>
              Recibí cinco opciones con cantidades, faltantes, reemplazos y un
              paso a paso fácil de seguir.
            </p>
          </article>
        </div>
        <div className="how-tip">
          <span>💡</span>
          <p>
            <strong>Un buen pedido puede ser muy simple:</strong> “Tengo pollo,
            arroz, cebolla y 30 minutos para cocinar”.
          </p>
          <a href="#crear">Probar ahora →</a>
        </div>
      </section>
      <form className="workspace" id="crear" onSubmit={submit}>
        <section className="card">
          <Heading
            n="1"
            icon="/icon-photo.svg"
            title="El plato que querés lograr"
            text="Opcional, pero ayuda a entender mejor el resultado."
          />
          {image ? (
            <div className="preview">
              <img src={image} alt="Plato de referencia" />
              <div>
                <span>{imageName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImageName("");
                  }}
                >
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <label className="upload">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => photo(e.target.files?.[0])}
              />
              <span className="upload-icon">
                <img src="/icon-photo.svg" alt="" />
              </span>
              <strong>Sacá una foto o elegí una imagen</strong>
              <small>JPG, PNG o WEBP · máximo 10 MB</small>
              <b>Elegir foto</b>
            </label>
          )}
        </section>
        <section className="card">
          <Heading
            n="2"
            icon="/icon-ingredients.svg"
            title="¿Qué ingredientes tenés?"
            text="Agregalos de a uno o separados por comas."
          />
          <div className="entry">
            <input
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
              placeholder="Ej.: pollo, arroz, tomate..."
            />
            <button
              type="button"
              onClick={() => add()}
              disabled={!entry.trim()}
            >
              Agregar
            </button>
          </div>
          {ingredients.length > 0 && (
            <div className="tags">
              {ingredients.map((x) => (
                <button
                  type="button"
                  key={x}
                  onClick={() =>
                    setIngredients((old) => old.filter((i) => i !== x))
                  }
                >
                  {x}
                  <span>×</span>
                </button>
              ))}
            </div>
          )}
          <div className="quick">
            <span>Agregá rápido:</span>
            {quick
              .filter(
                (x) =>
                  !ingredients.some((i) => i.toLowerCase() === x.toLowerCase()),
              )
              .map((x) => (
                <button type="button" key={x} onClick={() => add(x)}>
                  + {x}
                </button>
              ))}
          </div>
        </section>
        <section className="card">
          <Heading
            n="3"
            icon="/icon-recipe.svg"
            title="Ajustá la receta"
            text="Contanos también cómo te gusta comer cada ingrediente."
          />
          <div className="fields">
            <label>
              <span>Momento</span>
              <select value={meal} onChange={(e) => setMeal(e.target.value)}>
                {[
                  "Cualquiera",
                  "Desayuno",
                  "Almuerzo",
                  "Merienda",
                  "Cena",
                  "Postre",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Alimentación</span>
              <select value={diet} onChange={(e) => setDiet(e.target.value)}>
                {[
                  "Sin restricciones",
                  "Vegetariana",
                  "Vegana",
                  "Sin gluten",
                  "Sin lactosa",
                  "Apta para personas con diabetes",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              <span>
                Tiempo máximo <strong>{minutes} min</strong>
              </span>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </label>
            <label>
              <span>Porciones</span>
              <div className="counter">
                <button
                  type="button"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                >
                  −
                </button>
                <strong>{servings}</strong>
                <button
                  type="button"
                  onClick={() => setServings(Math.min(12, servings + 1))}
                >
                  +
                </button>
              </div>
            </label>
            <label className="preference-field">
              <span>
                Gustos, texturas y formas de cocción{" "}
                <small>{preferences.length}/500</small>
              </span>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Ej.: El bife sólo me gusta hecho milanesa. No quiero zanahoria cruda ni morrón quemado. Prefiero texturas crocantes y poco picante."
              />
              <small>
                Podés contar qué no te gusta, cómo sí lo comerías y qué sabores
                o texturas preferís.
              </small>
            </label>
          </div>
        </section>
        {error && (
          <div className="error" role="alert">
            <b>!</b>
            <p>{error}</p>
            <button type="button" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}
        <button className="generate" disabled={!ingredients.length || loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Creando tus recetas…
            </>
          ) : (
            <>✦ Crear mis recetas</>
          )}
        </button>
        <small className="note">
          Verificá siempre alergias, cocción y estado de los alimentos.
        </small>
      </form>
      {recipes.length > 0 && (
        <section className="results" ref={resultsRef}>
          <div className="results-head">
            <div>
              <span className="eyebrow">RESULTADOS PERSONALIZADOS</span>
              <h2>Podés cocinar esto hoy</h2>
              <p>Basado en: {ingredients.join(", ")}</p>
            </div>
            <b>{recipes.length} opciones</b>
          </div>
          <div className="recipe-grid">
            {recipes.map((r, i) => (
              <article className="recipe" key={r.name + i}>
                <div className="recipe-top">
                  <span>{r.emoji || "🍽️"}</span>
                  <div>
                    <strong>{r.matchPercentage}%</strong>
                    <small>coincidencia</small>
                  </div>
                </div>
                <button
                  type="button"
                  className={`heart ${favorites.includes(r.name) ? "on" : ""}`}
                  onClick={() => favorite(r.name)}
                >
                  ♥
                </button>
                <h3>{r.name}</h3>
                <p>{r.summary}</p>
                <div className="meta">
                  <span>◷ {r.minutes} min</span>
                  <span>◇ {r.difficulty}</span>
                  <span>♙ {r.servings}</span>
                </div>
                <div
                  className={`availability ${!r.missingIngredients.length ? "complete" : ""}`}
                >
                  {!r.missingIngredients.length
                    ? "✓ Tenés todo lo necesario"
                    : `Te faltan ${r.missingIngredients.length}: ${r.missingIngredients.slice(0, 3).join(", ")}`}
                </div>
                <button
                  type="button"
                  className="open"
                  onClick={() => setSelected(r)}
                >
                  Ver receta completa <span>→</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      <footer className="site-footer">
        <a className="brand" href="#inicio">
          <BrandIcon />
          <span>
            <strong>¿Qué Cocino Hoy?</strong>
            <small>Aprovechá más, desperdiciá menos.</small>
          </span>
        </a>
        <nav aria-label="Información legal">
          <a href="/legal#terminos">Términos y condiciones</a>
          <a href="/legal#privacidad">Privacidad</a>
          <a href="/legal#cookies">Cookies</a>
          <a href="/legal#seguridad">Seguridad alimentaria</a>
        </nav>
        <p>© 2026 · Recetas asistidas por IA</p>
      </footer>
      {upgradeOpen && (
        <div
          className="backdrop upgrade-bg"
          onMouseDown={() => setUpgradeOpen(false)}
        >
          <article
            className="upgrade-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setUpgradeOpen(false)}>
              ×
            </button>
            <span className="upgrade-icon">✦</span>
            <small>YA PROBASTE TUS 3 RECETAS GRATIS</small>
            <h2>¿Querés seguir disfrutando de nuevas ideas?</h2>
            <p>
              Pasate a Premium y creá recetas personalizadas sin límite,
              aprovechando mejor cada ingrediente que ya tenés.
            </p>
            <ul>
              <li>✓ Generaciones ilimitadas</li>
              <li>✓ Recetas detalladas paso a paso</li>
              <li>✓ Análisis de fotos e ingredientes</li>
            </ul>
            <div className="upgrade-price">
              <strong>$15.000</strong>
              <span>ARS por mes</span>
            </div>
            <button
              className="upgrade-pay"
              onClick={subscribe}
              disabled={loginLoading}
            >
              {loginLoading
                ? "Abriendo Mercado Pago…"
                : "Continuar con Mercado Pago"}
            </button>
            <button
              className="upgrade-later"
              onClick={() => setUpgradeOpen(false)}
            >
              Ahora no
            </button>
            <small className="upgrade-safe">
              Pago seguro procesado por Mercado Pago · Podés cancelar cuando
              quieras.
            </small>
          </article>
        </div>
      )}
      {selected && (
        <div
          className="backdrop detail-bg"
          onMouseDown={() => setSelected(null)}
        >
          <article className="detail" onMouseDown={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className="detail-hero">
              <span>{selected.emoji}</span>
              <div>
                <small>{selected.matchPercentage}% de coincidencia</small>
                <h2>{selected.name}</h2>
                <p>{selected.summary}</p>
              </div>
            </div>
            <div className="detail-meta">
              <span>
                ◷ <b>{selected.minutes} min</b>
              </span>
              <span>
                ◇ <b>{selected.difficulty}</b>
              </span>
              <span>
                ♙ <b>{selected.servings} porciones</b>
              </span>
            </div>
            {image && (
              <div className="detail-photo">
                <img src={image} alt={`Referencia para ${selected.name}`} />
                <small>Foto del plato que querés lograr</small>
              </div>
            )}
            <div className="columns">
              <List
                title="Lo que ya tenés"
                items={selected.availableIngredients}
                icon="✓"
              />
              <List
                title="Lo que te falta"
                items={selected.missingIngredients}
                icon="+"
                empty="¡No necesitás comprar nada!"
              />
            </div>
            {selected.substitutions.length > 0 && (
              <section className="subs">
                <h3>Cambios inteligentes</h3>
                {selected.substitutions.map((x) => (
                  <p key={x}>↻ {x}</p>
                ))}
              </section>
            )}
            <section className="steps">
              <h3>Paso a paso</h3>
              {selected.steps.map((x, i) => (
                <div key={x + i}>
                  <span>{i + 1}</span>
                  <p>{x}</p>
                </div>
              ))}
            </section>
            <div className="tip">
              <span>👨‍🍳</span>
              <p>
                <b>Consejo del chef</b>
                {selected.chefTip}
              </p>
            </div>
            {selected.safetyNote && (
              <p className="safety">⚠ {selected.safetyNote}</p>
            )}
          </article>
        </div>
      )}
    </main>
  );
}

function BrandIcon() {
  return (
    <img
      className="brand-mark"
      src="/app-icon-192.png"
      alt="Logo de ¿Qué Cocino Hoy?"
    />
  );
}
function Heading({
  n,
  icon,
  title,
  text,
}: {
  n: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="heading">
      <span>
        <img src={icon} alt="" />
        <b>{n}</b>
      </span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
function List({
  title,
  items,
  icon,
  empty,
}: {
  title: string;
  items: string[];
  icon: string;
  empty?: string;
}) {
  return (
    <section>
      <h3>{title}</h3>
      {items.length ? (
        <ul>
          {items.map((x) => (
            <li key={x}>
              {icon} <span>{x}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="allset">{empty}</p>
      )}
    </section>
  );
}
