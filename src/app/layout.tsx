import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

// ─── Font ─────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "InfraMind is an AI-powered civic infrastructure reporting platform. " +
    "Report potholes, water leaks, broken streetlights, and more. " +
    "Powered by Gemini AI and Google Maps.",
  keywords: [
    "civic infrastructure",
    "pothole reporting",
    "smart city",
    "AI reporting platform",
    "citizen engagement",
    "urban issues",
    "InfraMind",
  ],
  authors: [{ name: "InfraMind Team" }],
  creator: "InfraMind",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description:
      "AI-powered civic infrastructure reporting. Report issues, track resolution, build better cities.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description:
      "AI-powered civic infrastructure reporting platform for Indian cities.",
    creator: "@inframind",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1221" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Layout ───────────────────────────────────────────────────────────────────

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
