import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const BASE_URL = "https://planningperm.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PlanningPerm — Free UK Planning Permission Checker",
    template: "%s — PlanningPerm",
  },
  description:
    "Find out in 2 minutes whether your extension, loft conversion or outbuilding needs planning permission. Free approval score, 20 automated site checks, and ready-to-submit planning documents — based on your council's real decision data.",
  keywords: [
    "do I need planning permission",
    "planning permission checker UK",
    "planning permission UK",
    "permitted development rights",
    "householder planning permission",
    "planning permission extension",
    "planning permission loft conversion",
    "planning permission cost UK",
    "planning application UK",
    "conservation area planning permission",
    "planning permission outbuilding",
    "free planning permission check",
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
    title: "PlanningPerm — Free UK Planning Permission Checker",
    description:
      "Find out in 2 minutes whether your project needs planning permission. Free approval score, 20 site checks, and AI-drafted documents — based on your council's real decisions.",
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
    title: "PlanningPerm — Free UK Planning Permission Checker",
    description:
      "Find out in 2 minutes whether your extension or loft needs planning permission. Free score + AI-drafted documents based on real council decisions.",
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
