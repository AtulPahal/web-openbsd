import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SYSTEM_CONFIG } from "@/lib/system-config";

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
    url: SYSTEM_CONFIG.website,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
      suppressHydrationWarning
    >
      <body
        className="h-full min-h-[100dvh] w-full overflow-hidden bg-background text-foreground font-mono select-none touch-manipulation"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
