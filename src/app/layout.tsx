import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";

// Rethink Sans — humanist geometric sans, works at all sizes
const rethink = Rethink_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlanningPerm — Know Before You Build",
  description:
    "Real approval odds for your property based on your council's actual decision history. 20 site checks, AI-drafted documents, free in under 2 minutes.",
  openGraph: {
    title: "Planning Perm",
    description: "AI-powered planning permission guidance for UK homeowners.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${rethink.variable} h-full antialiased`}
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
        {/* Privacy-friendly analytics by Plausible */}
        <script async src="https://plausible.io/js/pa-Qdczfs_XyMHR9ouVXG2b5.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()` }} />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#1A1F2E]" style={{ fontFamily: "var(--font-sans)" }}>
        {children}
      </body>
    </html>
  );
}
