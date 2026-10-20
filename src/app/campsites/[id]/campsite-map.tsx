"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { preconnect } from "react-dom";
import type { LatLng } from "@/data/types.ts";

const tileOrigin = "https://cyberjapandata.gsi.go.jp";

// 国土地理院の淡色地図(地理院タイル)にキャンプ場の位置を出す。標準地図より画像が軽く、
// 生成りの画面になじむ。
// Leaflet はブラウザでしか動かないので、表示した後に読み込む
export function CampsiteMap({
  lat,
  lng,
  className,
}: LatLng & { className?: string }) {
  // Leaflet を読み込むあいだに、タイルの配信元とつないでおく
  preconnect(tileOrigin);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !container.current) return;
      map = L.map(container.current).setView([lat, lng], 14);
      L.tileLayer(`${tileOrigin}/xyz/pale/{z}/{x}/{y}.png`, {
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
        maxZoom: 18,
      }).addTo(map);
      L.circleMarker([lat, lng], {
        radius: 8,
        color: "white",
        weight: 3,
        // 差し色(globals.css の accent)に合わせる
        fillColor: getComputedStyle(container.current).getPropertyValue(
          "--color-accent",
        ),
        fillOpacity: 1,
      }).addTo(map);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng]);

  return <div ref={container} className={className} />;
}
