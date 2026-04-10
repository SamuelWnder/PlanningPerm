import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const BASE_URL = "https://planningperm.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PlanningPerm — Know Before You Build",
    template: "%s — PlanningPerm",
  },
  description:
    "Check if your home improvement needs planning permission. Real approval odds from your council's decision history, 20 automated site checks, and AI-drafted planning documents. Free in under 2 minutes.",
  keywords: [
    "planning permission",
    "do I need planning permission",
    "planning permission UK",
    "permitted development",
    "planning permission checker",
    "planning application UK",
    "planning permission cost",
    "householder planning permission",
  ],
  authors: [{ name: "PlanningPerm", url: BASE_URL }],
  creator: "PlanningPerm",
  publisher: "PlanningPerm",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: BASE_URL,
    siteName: "PlanningPerm",
    title: "PlanningPerm — Know Before You Build",
    description:
      "Check if your home improvement needs planning permission. Real approval odds, 20 site checks, and AI-drafted documents — free in under 2 minutes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PlanningPerm — UK Planning Permission Checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlanningPerm — Know Before You Build",
    description:
      "Check if your home improvement needs planning permission. Real approval odds, 20 site checks, free in under 2 minutes.",
    images: ["/og-image.png"],
    creator: "@planningperm",
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#1A1F2E]">
        {children}
        {/* Plausible analytics — afterInteractive prevents load errors reaching window.onerror */}
        <Script
          src="https://plausible.io/js/pa-Qdczfs_XyMHR9ouVXG2b5.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
