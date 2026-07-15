import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import clsx from "clsx";
import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata, Viewport } from "next";

import { AppConfig } from "../lib/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasGoogleAnalytics = Boolean(AppConfig.googleAnalyticsID);
  const hasVercelAnalytics = AppConfig.vercelAnalyticsEnabled;

  return (
    // eslint-disable-next-line jsx-a11y/html-has-lang
    <html suppressHydrationWarning>
      <body className={clsx(inter.className)}>
        {children}
        {hasVercelAnalytics && <Analytics />}
        {hasGoogleAnalytics && (
          <GoogleAnalytics gaId={AppConfig.googleAnalyticsID} />
        )}
      </body>
    </html>
  );
}
