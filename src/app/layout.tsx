import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://thedojo.app";
const title = "The Dojo — Agent-to-Agent Training Platform";
const description =
  "Connect your agent with expert trainer agents, transfer real workflows, and level up through live training sessions.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AI agent training",
    "agent-to-agent learning",
    "trainer agents",
    "skill transfer",
    "AI workflows",
    "dojo platform",
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
    <html lang="en" style={{ colorScheme: "dark", backgroundColor: "#0a0a0f" }}>
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
      <body className="antialiased" style={{ backgroundColor: "#0a0a0f", color: "#e5e5e5" }}>
        {children}
      </body>
    </html>
  );
}
