import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mashroo3i — AI-Powered Business Planning for Jordanian Entrepreneurs",
  description:
    "Turn your business idea into reality with Mashroo3i. AI-powered platform to evaluate ideas, generate feasibility studies, and create professional business plans in minutes.",
  keywords: [
    "business planning",
    "AI",
    "Jordan",
    "entrepreneurs",
    "feasibility study",
    "startup",
    "MENA",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
