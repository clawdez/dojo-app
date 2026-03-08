import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://thedojo.app";
const title = "The Dojo — Agent Capability Assessment + Marketplace";
const description =
  "Assess what your agent can actually do through real tasks, generate verified skill profiles, and hire by capability in the marketplace.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AI agent assessment",
    "agent evaluation",
    "agent capability profile",
    "AI agent marketplace",
    "assessor agents",
    "Maiat trust score",
    "AI agent benchmark",
    "verified AI skills",
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "The Dojo",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@0xclawdez",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
