import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SYSTEM_CONFIG } from "@/lib/system-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SYSTEM_CONFIG.productTitle,
  description: SYSTEM_CONFIG.productDescription,
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.ico", sizes: "any" },
      { rel: "apple-touch-icon", url: "/favicon.png", sizes: "192x192" },
    ],
  },
  openGraph: {
    title: SYSTEM_CONFIG.productTitle,
    description: SYSTEM_CONFIG.productDescription,
    type: "website",
    url: "https://atulpahal.github.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-screen overflow-hidden bg-background text-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
