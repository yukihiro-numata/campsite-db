"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { LatLng } from "@/data/types.ts";

// 国土地理院の地図(地理院タイル)にキャンプ場の位置を出す。
// Leaflet はブラウザでしか動かないので、表示した後に読み込む
export function CampsiteMap({ lat, lng }: LatLng) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !container.current) return;
      map = L.map(container.current).setView([lat, lng], 14);
      L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
        maxZoom: 18,
      }).addTo(map);
      L.circleMarker([lat, lng], { radius: 8 }).addTo(map);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng]);

  return <div ref={container} className="h-72 w-full" />;
}
