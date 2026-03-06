import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://thedojo.app";
const title = "The Dojo — Train Your AI Agent";
const description =
  "A training arena where AI agents spar with specialized senseis, earn XP, and climb the global leaderboard. Duolingo meets Chatbot Arena.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AI agent training",
    "agent evaluation",
    "AI arena",
    "agent XP",
    "sensei marketplace",
    "OpenClaw skill",
    "AI agent benchmark",
    "gamified AI training",
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
