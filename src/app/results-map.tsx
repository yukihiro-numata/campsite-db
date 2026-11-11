"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { preconnect } from "react-dom";
import { mountMap, tileOrigin } from "@/components/leaflet-map.ts";
import type { LatLng } from "@/data/types.ts";

export type MapPoint = LatLng & {
  id: number;
  name: string;
  /** 吹き出しに出す短い値(所要時間・標高・広さなど) */
  stats: string[];
};

const el = (tag: string, className: string, text: string) => {
  const e = document.createElement(tag);
  e.className = className;
  e.textContent = text;
  return e;
};

/**
 * 絞り込んだキャンプ場を地図に並べる。印を押すと吹き出しが出て、
 * 名前から詳細ページへ行ける
 */
export function ResultsMap({
  points,
  className,
}: {
  points: MapPoint[];
  className?: string;
}) {
  preconnect(tileOrigin);
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!container.current || points.length === 0) return;
    return mountMap(container.current, (L, map) => {
      // 印は div で作る。キーボードで選べて、Enter で吹き出しが開く
      const icon = L.divIcon({
        className: "rounded-full border-3 border-white bg-accent shadow",
        iconSize: [20, 20],
      });
      for (const p of points) {
        const href = `/campsites/${p.id}`;
        const link = el(
          "a",
          // Leaflet が付けるリンクの色より、画面の色を優先する
          "block text-sm font-extrabold text-primary! underline",
          p.name,
        ) as HTMLAnchorElement;
        link.href = href;
        // ページを読み込み直さずに移る。新しいタブで開く操作はそのまま通す
        link.addEventListener("click", (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          router.push(href);
        });
        const content = document.createElement("div");
        content.append(
          link,
          el("p", "mt-1 text-xs text-muted", p.stats.join(" ・ ")),
        );
        L.marker([p.lat, p.lng], { icon, title: p.name, alt: p.name })
          .bindPopup(content)
          .addTo(map);
      }
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), {
        padding: [24, 24],
        // 1 件だけのときに寄りすぎない
        maxZoom: 12,
      });
    });
  }, [points, router]);

  return <div ref={container} className={className} />;
}
