import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnChat Sync",
  description: "Chat en tiempo real de nivel profesional",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#020617] text-white antialiased`}>
        {/* Contenedor principal ajustado para evitar bloqueos de scroll vertical en móvil */}
        <main className="min-h-screen max-w-[1920px] mx-auto overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}