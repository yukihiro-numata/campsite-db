// 東京駅からキャンプ場の座標までの所要時間(分)を計算する。
// OSRM の公開サーバーの車の経路で、渋滞なしの値。秒を分に直して四捨五入する

import type { LatLng } from "./index";

const ORIGIN: LatLng = { lat: 35.6812, lng: 139.7671 }; // 東京駅
const URL = "https://router.project-osrm.org/route/v1/driving";

export async function travelMinutes({ lat, lng }: LatLng): Promise<number> {
  const coords = `${ORIGIN.lng},${ORIGIN.lat};${lng},${lat}`;
  const res = await fetch(`${URL}/${coords}?overview=false`);
  if (!res.ok) throw new Error(`OSRM: ${res.status} ${await res.text()}`);
  const body = (await res.json()) as { routes: { duration: number }[] };
  return Math.round(body.routes[0].duration / 60);
}
