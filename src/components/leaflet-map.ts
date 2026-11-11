import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";

export const tileOrigin = "https://cyberjapandata.gsi.go.jp";

/**
 * 国土地理院の淡色地図(地理院タイル)を container に出し、setup で印などを足す。
 * 淡色地図は標準地図より画像が軽く、生成りの画面になじむ。
 * Leaflet はブラウザでしか動かないので、表示した後に読み込む。
 * 戻り値は片付けの関数で、useEffect からそのまま返せる
 */
export function mountMap(
  container: HTMLElement,
  setup: (L: typeof Leaflet, map: Leaflet.Map) => void,
): () => void {
  let map: Leaflet.Map | undefined;
  let cancelled = false;
  import("leaflet").then((L) => {
    if (cancelled) return;
    map = L.map(container);
    L.tileLayer(`${tileOrigin}/xyz/pale/{z}/{x}/{y}.png`, {
      attribution:
        '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
      maxZoom: 18,
    }).addTo(map);
    setup(L, map);
  });
  return () => {
    cancelled = true;
    map?.remove();
  };
}
