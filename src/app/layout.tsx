import type { Metadata, Viewport } from "next";
import Link from "next/link";
import {
  backgroundColor,
  siteDescription,
  siteName,
  siteUrl,
  tagline,
} from "@/lib/site.ts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${siteName} | ${tagline}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    siteName,
    locale: "ja_JP",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: backgroundColor,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <header className="mx-auto w-full max-w-5xl px-5 pt-5">
          <Link
            href="/"
            className="text-base font-extrabold tracking-wide text-primary"
          >
            ▲ {siteName}
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
