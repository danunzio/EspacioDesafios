import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Espacio Desafíos",
    template: "%s | Espacio Desafíos",
  },
  description: "Sistema de gestión para clínicas terapéuticas - Registro de sesiones, liquidaciones y administración",
  keywords: ["psicomotricidad", "terapia", "clínica", "gestión", "sesiones", "liquidaciones"],
  authors: [{ name: "Espacio Desafíos" }],
  creator: "Espacio Desafíos",
  publisher: "Espacio Desafíos",
  manifest: "/manifest.json",
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://espacio-desafios.vercel.app"),
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Espacio Desafíos",
    title: "Espacio Desafíos - Sistema de Gestión Terapéutica",
    description: "Plataforma de gestión para clínicas terapéuticas",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Espacio Desafíos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Espacio Desafíos",
    description: "Sistema de gestión para clínicas terapéuticas",
    images: ["/icons/icon-512x512.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Espacio Desafíos",
    startupImage: [
      {
        url: "/icons/apple-splash.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#A38EC3" },
    { media: "(prefers-color-scheme: dark)", color: "#A38EC3" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Desafíos" />
        <meta name="application-name" content="Espacio Desafíos" />
        <meta name="msapplication-TileColor" content="#A38EC3" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F8F7FF]`}
      >
        {children}
      </body>
    </html>
  );
}
