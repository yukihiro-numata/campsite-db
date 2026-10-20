import type { MetadataRoute } from "next";
import { backgroundColor, siteDescription, siteName } from "@/lib/site.ts";

// ホーム画面に追加できるようにする(PWA)。つながらないときの画面は用意しない
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: siteDescription,
    lang: "ja",
    start_url: "/",
    display: "standalone",
    background_color: backgroundColor,
    theme_color: backgroundColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      // Android が丸や角丸に切り抜く用。四角いまま端まで塗る
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
