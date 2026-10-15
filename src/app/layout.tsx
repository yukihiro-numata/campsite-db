import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "campsite-db",
  description: "キャンプ場のスペック検索・比較サービス",
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
            ▲ campsite-db
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
