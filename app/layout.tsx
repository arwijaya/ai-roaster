import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Roaster 💀 - Cek Seberapa Hancur Seleramu",
  description: "Berani upload fotomu? Biarkan AI menilai (dan menghina) seleramu dengan jujur dan pedas. Siapkan mental sebelum klik!",
  openGraph: {
    title: "AI Roaster 💀 - Berani Coba?",
    description: "Cek seberapa hancur seleramu menurut AI. Awas baper!",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
