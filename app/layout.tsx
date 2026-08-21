import type { Metadata } from "next";
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
  metadataBase: new URL("https://entrena-udea-medellin.yeisonmauro.chatgpt.site"),
  title: "Entrena UdeA | Simulacro y curso de habilidades",
  description:
    "Simulador y curso interactivo de razonamiento lógico y comprensión lectora para preparar la prueba de admisión de la Universidad de Antioquia.",
  openGraph: {
    title: "Entrena UdeA",
    description: "Simulacro + curso de habilidades en razonamiento lógico y comprensión lectora.",
    type: "website",
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Entrena UdeA: simulacro y curso de habilidades" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Entrena UdeA",
    description: "Simulacro + curso de habilidades en razonamiento lógico y comprensión lectora.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
