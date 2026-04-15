import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer } from "@/components";
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
  title: "Game Diary - Your Personal Gaming Journal",
  description: "Keep track of your gaming journey with Game Diary. A modern, dark-themed app for your game notes and progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <Header />
        <main className="flex-1 bg-gradient-to-b from-slate-950 to-slate-900">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
