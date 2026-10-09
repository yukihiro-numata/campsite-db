// キャンプ場の座標から、一番近いコンビニ・スーパーまでの直線距離(m)を計算する。
//
// 1. キャンプ場のまわりの地図タイルを、OpenFreeMap から取る
// 2. タイルからコンビニ・スーパーの点を取り出す
// 3. キャンプ場から一番近い点までの距離を測る
//
// 地図は OpenFreeMap のベクトルタイル(OpenStreetMap のデータ、ズーム 14)。
// 5km より遠ければ null

import { pointToTile } from "@mapbox/tilebelt";
import { VectorTile } from "@mapbox/vector-tile";
import { distance } from "@turf/distance";
import { point } from "@turf/helpers";
import { PbfReader } from "pbf";
import type { LatLng } from "../../src/data/types.ts";

const RADIUS = 5000;
const ZOOM = 14;
// ズーム 14 のタイルは 1 枚が約 2km 四方。まわり 3 枚ずつ取れば、
// キャンプ場がタイルのどこにあっても半径 5km を覆える
const AROUND = 3;
const TILEJSON_URL = "https://tiles.openfreemap.org/planet";
// 地図タイルの poi レイヤーの分類(subclass)
const STORE_SUBCLASSES = ["convenience", "supermarket"];

export async function storeDistanceFrom(
  campsite: LatLng,
): Promise<number | null> {
  const tileUrl = await currentTileUrl();
  const stores = (
    await Promise.all(
      tilesAround(campsite).map(([x, y]) => storesInTile(tileUrl, x, y)),
    )
  ).flat();

  const here = point([campsite.lng, campsite.lat]);
  const meters = stores.map((s) => distance(here, s, { units: "meters" }));
  const min = Math.min(...meters); // 店がなければ Infinity
  return min <= RADIUS ? Math.round(min) : null;
}

/** タイルの URL の形。データの更新で URL が変わるため、毎回 TileJSON から取る */
async function currentTileUrl(): Promise<string> {
  const res = await fetch(TILEJSON_URL);
  if (!res.ok) throw new Error(`OpenFreeMap: ${res.status}`);
  const body = (await res.json()) as { tiles: string[] };
  return body.tiles[0];
}

/** キャンプ場のタイルと、そのまわり AROUND 枚ずつのタイルの番号 [x, y] */
function tilesAround(campsite: LatLng): [number, number][] {
  const [cx, cy] = pointToTile(campsite.lng, campsite.lat, ZOOM);
  const offsets = Array.from({ length: AROUND * 2 + 1 }, (_, i) => i - AROUND);
  return offsets.flatMap((dx) =>
    offsets.map((dy): [number, number] => [cx + dx, cy + dy]),
  );
}

/** タイルの中の、コンビニ・スーパーの点 */
async function storesInTile(tileUrl: string, x: number, y: number) {
  const url = tileUrl
    .replace("{z}", String(ZOOM))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
  const res = await fetch(url);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`OpenFreeMap: ${res.status} ${x}/${y}`);
  const layer = new VectorTile(
    new PbfReader(new Uint8Array(await res.arrayBuffer())),
  ).layers.poi;
  if (!layer) return [];
  return Array.from({ length: layer.length }, (_, i) => layer.feature(i))
    .filter((f) => STORE_SUBCLASSES.includes(String(f.properties.subclass)))
    .map((f) => {
      const { geometry } = f.toGeoJSON(x, y, ZOOM);
      if (geometry.type !== "Point") throw new Error("poi が点ではない");
      return point(geometry.coordinates);
    });
}
