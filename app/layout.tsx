import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "¿Qué Cocino Hoy?",
  description: "Generá recetas usando una foto y los ingredientes que tenés.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/app-icon-64.png?v=20260816", type: "image/png", sizes: "64x64" },
    ],
    shortcut: "/app-icon-64.png?v=20260816",
    apple: [
      {
        url: "/app-icon-192.png?v=20260816",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};
export const viewport: Viewport = {
  themeColor: "#f15a3a",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
