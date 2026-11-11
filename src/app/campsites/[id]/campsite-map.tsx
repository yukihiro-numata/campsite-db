"use client";

import { useEffect, useRef } from "react";
import { preconnect } from "react-dom";
import { mountMap, tileOrigin } from "@/components/leaflet-map.ts";
import type { LatLng } from "@/data/types.ts";

/** キャンプ場の位置を地図に出す */
export function CampsiteMap({
  lat,
  lng,
  className,
}: LatLng & { className?: string }) {
  // Leaflet を読み込むあいだに、タイルの配信元とつないでおく
  preconnect(tileOrigin);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    return mountMap(el, (L, map) => {
      map.setView([lat, lng], 14);
      L.circleMarker([lat, lng], {
        radius: 8,
        color: "white",
        weight: 3,
        // 差し色(globals.css の accent)に合わせる
        fillColor: getComputedStyle(el).getPropertyValue("--color-accent"),
        fillOpacity: 1,
      }).addTo(map);
    });
  }, [lat, lng]);

  return <div ref={container} className={className} />;
}
