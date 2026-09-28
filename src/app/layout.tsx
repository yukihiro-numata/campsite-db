import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "campsite-db",
  description: "キャンプ場のスペック検索・比較サービス",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
