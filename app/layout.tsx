import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Aryan Hussain — Software Engineer",
  description:
    "Aryan Hussain is a Toronto software engineer building intelligent products and the systems behind them.",
  applicationName: "Aryan Hussain Portfolio",
  authors: [{ name: "Aryan Hussain", url: "https://hussainaryan.com" }],
  keywords: [
    "Aryan Hussain",
    "software engineer",
    "University of Toronto",
    "computer engineering",
    "Toronto",
    "portfolio",
  ],
  openGraph: {
    type: "website",
    locale: "en_CA",
    title: "Aryan Hussain — Software Engineer",
    description: "Building intelligent products and the systems behind them.",
    siteName: "Aryan Hussain",
  },
  twitter: {
    card: "summary",
    title: "Aryan Hussain — Software Engineer",
    description: "Building intelligent products and the systems behind them.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#020711",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
