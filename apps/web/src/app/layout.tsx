import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import ThemeProvider from "../components/theme/ThemeProvider";
import ToastProvider from "../components/ui/ToastProvider";
import PublicNavbar from "../components/layout/PublicNavbar";
import Footer from "../components/layout/Footer";
import { SentryInitializer } from "../components/SentryInitializer";

import { constructMetadata } from "../lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <SocketProvider>
                <PublicNavbar />
                <main className="app-surface">{children}</main>
                <Footer />
                <Analytics />
                <SentryInitializer />
              </SocketProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
