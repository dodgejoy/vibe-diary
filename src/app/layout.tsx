import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer, AuthProvider, AuthGate } from "@/components";
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
  title: "Vibe Diary — Твой Игровой Дневник",
  description: "Отслеживай свой игровой путь с Vibe Diary. Современное приложение для заметок, рецензий и прогресса в играх.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <AuthProvider>
          <Header />
          <main className="flex-1 bg-gradient-to-b from-slate-950 to-slate-900">
            <AuthGate>{children}</AuthGate>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
