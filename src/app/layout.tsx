import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanningPerm — Know Before You Build",
  description:
    "Real approval odds for your property based on your council's actual decision history. 20 site checks, AI-drafted documents, free in under 2 minutes.",
  openGraph: {
    title: "PlanningPerm — Know Before You Build",
    description: "AI-powered planning permission guidance for UK homeowners.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Privacy-friendly analytics by Plausible */}
        <script async src="https://plausible.io/js/pa-Qdczfs_XyMHR9ouVXG2b5.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()` }} />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#1A1F2E]">
        {children}
      </body>
    </html>
  );
}
