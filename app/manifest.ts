import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "¿Qué Cocino Hoy?",
    short_name: "Qué Cocino",
    description: "Recetas personalizadas con lo que tenés en casa",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf4",
    theme_color: "#f15a3a",
    icons: [
      {
        src: "/app-icon-192.png?v=20260816",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/app-icon-512.png?v=20260816",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
