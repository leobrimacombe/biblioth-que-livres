import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "BookApp | Next-Gen",
  description: "Ton hub littéraire intelligent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      {/* Un fond très clair (slate-50) qui fait ressortir le blanc et les couleurs */}
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-slate-50 text-slate-900 min-h-screen selection:bg-indigo-500 selection:text-white`}>
        <Header />
        {children}
      </body>
    </html>
  );
}