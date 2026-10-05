// キャンプ場の座標から、高速道路・国道・鉄道までの直線距離(m)を計算する。
//
// 1. キャンプ場のまわりの地図タイルを、国土地理院から取る
// 2. タイルから高速道路・国道・鉄道の線を取り出す
// 3. 種類ごとに、キャンプ場から一番近い線までの距離を測る
//
// 地図は国土地理院ベクトルタイル(experimental_bvmap、ズーム 16)。1,500m より遠ければ null

import { pointToTile } from "@mapbox/tilebelt";
import { VectorTile, type VectorTileLayer } from "@mapbox/vector-tile";
import { lineString, point } from "@turf/helpers";
import { pointToLineDistance } from "@turf/point-to-line-distance";
import { PbfReader } from "pbf";
import type { CalculatedValues } from "../../src/data/types.ts";
import type { LatLng } from "./index.ts";

type Kind = keyof CalculatedValues["distanceTo"];
type Line = { kind: Kind; geometry: ReturnType<typeof lineString> };

const RADIUS = 1500;
const ZOOM = 16;
// ズーム 16 のタイルは 1 枚が約 500m 四方。まわり 5 枚ずつ取れば、
// キャンプ場がタイルのどこにあっても半径 1,500m を覆える
const AROUND = 5;
const TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap";

export async function distances(
  campsite: LatLng,
): Promise<CalculatedValues["distanceTo"]> {
  const lines: Line[] = [];
  for (const [x, y] of tilesAround(campsite)) {
    lines.push(...(await linesInTile(x, y)));
  }

  const here = point([campsite.lng, campsite.lat]);
  const nearest = (kind: Kind) => {
    const meters = lines
      .filter((line) => line.kind === kind)
      .map((line) =>
        pointToLineDistance(here, line.geometry, { units: "meters" }),
      );
    const min = Math.min(...meters); // 線がなければ Infinity
    return min <= RADIUS ? Math.round(min) : null;
  };
  return {
    expressway: nearest("expressway"),
    nationalRoad: nearest("nationalRoad"),
    railway: nearest("railway"),
  };
}

/** キャンプ場のタイルと、そのまわり AROUND 枚ずつのタイルの番号 [x, y] */
function tilesAround(campsite: LatLng): [number, number][] {
  const [cx, cy] = pointToTile(campsite.lng, campsite.lat, ZOOM);
  const offsets = Array.from({ length: AROUND * 2 + 1 }, (_, i) => i - AROUND);
  return offsets.flatMap((dx) =>
    offsets.map((dy): [number, number] => [cx + dx, cy + dy]),
  );
}

/** タイルの中の、高速道路・国道・鉄道の線 */
async function linesInTile(x: number, y: number): Promise<Line[]> {
  const res = await fetch(`${TILE_URL}/${ZOOM}/${x}/${y}.pbf`);
  if (res.status === 404) return []; // 海などでタイルがない
  if (!res.ok) throw new Error(`地理院タイル: ${res.status} ${x}/${y}`);
  const { layers } = new VectorTile(
    new PbfReader(new Uint8Array(await res.arrayBuffer())),
  );

  return [
    ...featuresOf(layers.road).map((f) => ({
      f,
      kind: roadKind(f.properties),
    })),
    ...featuresOf(layers.railway).map((f) => ({
      f,
      kind: railKind(f.properties),
    })),
  ].flatMap(({ f, kind }) => {
    if (!kind) return [];
    // 線を緯度・経度で受け取る。1 つの地物が複数の線を持つこともある
    const { geometry } = f.toGeoJSON(x, y, ZOOM);
    const coords =
      geometry.type === "LineString"
        ? [geometry.coordinates]
        : geometry.type === "MultiLineString"
          ? geometry.coordinates
          : [];
    return coords
      .filter((c) => c.length >= 2)
      .map((c) => ({ kind, geometry: lineString(c) }));
  });
}

function featuresOf(layer: VectorTileLayer | undefined) {
  if (!layer) return [];
  return Array.from({ length: layer.length }, (_, i) => layer.feature(i));
}

/** 道路の種類。rdCtg 0=国道、3=高速道路 */
function roadKind(props: Record<string, unknown>): Kind | null {
  if (props.rdCtg === 0) return "nationalRoad";
  if (props.rdCtg === 3) return "expressway";
  return null;
}

/** 鉄道の種類。ftCode 8201=普通鉄道 */
function railKind(props: Record<string, unknown>): Kind | null {
  return props.ftCode === 8201 ? "railway" : null;
}
