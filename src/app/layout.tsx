import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "Planning Perm — AI Planning Permission Companion",
  description:
    "Find out if your project will get planning permission before you apply. AI-powered feasibility assessments based on real planning data.",
  openGraph: {
    title: "Planning Perm",
    description:
      "AI-powered planning permission guidance for UK homeowners.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#1A1F2E]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
