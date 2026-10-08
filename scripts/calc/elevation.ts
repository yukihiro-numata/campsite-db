// キャンプ場の座標の標高(m)を、国土地理院の標高 API で求める。
// m に四捨五入する。海沿いなどで標高データがない座標は null

import type { LatLng } from "../../src/data/types.ts";

const ELEVATION_URL =
  "https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php";

export async function elevation({ lat, lng }: LatLng): Promise<number | null> {
  const res = await fetch(
    `${ELEVATION_URL}?lon=${lng}&lat=${lat}&outtype=JSON`,
  );
  if (!res.ok) throw new Error(`標高 API: ${res.status} ${await res.text()}`);
  // 値がないときは "-----" が返る
  const body = (await res.json()) as { elevation: number | string };
  return typeof body.elevation === "number" ? Math.round(body.elevation) : null;
}
