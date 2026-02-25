import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header"; // <-- Ajoute cet import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ma Super App de Livres",
  description: "Découvre et gère tes lectures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header /> {/* <-- Ajoute le Header ici ! */}
        {children}
      </body>
    </html>
  );
}