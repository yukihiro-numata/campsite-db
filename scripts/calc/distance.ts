// キャンプ場の座標から、高速道路・国道・鉄道までの直線距離(m)を計算する。
//
// 1. キャンプ場のまわり(半径 1,500m)を覆う地図タイルを、国土地理院から取る
// 2. タイルから高速道路・国道・鉄道の線を取り出す
// 3. 種類ごとに、キャンプ場から一番近い線までの距離を測る
//
// 地図は国土地理院ベクトルタイル(experimental_bvmap、ズーム 16)。1,500m より遠ければ null

import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import type { CalculatedValues } from "../../src/data/types.ts";
import type { LatLng } from "./index.ts";

type Kind = keyof CalculatedValues["distanceTo"];
/** 線。点を順につないだもの */
type Line = LatLng[];

const RADIUS = 1500;
const ZOOM = 16;
const TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap";

export async function distances(
  campsite: LatLng,
): Promise<CalculatedValues["distanceTo"]> {
  const lines: Record<Kind, Line[]> = {
    expressway: [],
    nationalRoad: [],
    railway: [],
  };
  for (const tile of tilesAround(campsite)) {
    for (const { kind, line } of await linesInTile(tile)) {
      lines[kind].push(line);
    }
  }
  return {
    expressway: nearest(campsite, lines.expressway),
    nationalRoad: nearest(campsite, lines.nationalRoad),
    railway: nearest(campsite, lines.railway),
  };
}

// ---- 1. タイルを取る ----

type Tile = { x: number; y: number };

/** 座標を中心に、半径 RADIUS を覆うタイルの一覧 */
function tilesAround(center: LatLng): Tile[] {
  const { x, y } = latLngToTile(center);
  const tileMeters =
    (40075016.686 * Math.cos(toRadians(center.lat))) / 2 ** ZOOM;
  const r = Math.ceil(RADIUS / tileMeters) + 1;
  const tiles: Tile[] = [];
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      tiles.push({ x: Math.floor(x) + dx, y: Math.floor(y) + dy });
    }
  }
  return tiles;
}

// ---- 2. 線を取り出す ----

/** タイルの中の、高速道路・国道・鉄道の線 */
async function linesInTile(tile: Tile): Promise<{ kind: Kind; line: Line }[]> {
  const res = await fetch(`${TILE_URL}/${ZOOM}/${tile.x}/${tile.y}.pbf`);
  if (res.status === 404) return []; // 海などでタイルがない
  if (!res.ok)
    throw new Error(`地理院タイル: ${res.status} ${tile.x}/${tile.y}`);
  const { layers } = new VectorTile(
    new PbfReader(new Uint8Array(await res.arrayBuffer())),
  );

  const result: { kind: Kind; line: Line }[] = [];
  for (const layerName of ["road", "railway"]) {
    const layer = layers[layerName];
    if (!layer) continue;
    for (let i = 0; i < layer.length; i++) {
      const feature = layer.feature(i);
      const kind = kindOf(layerName, feature.properties);
      if (!kind) continue;
      // 点の位置はタイルの中の目盛り(0〜extent)なので、緯度・経度に直す
      for (const points of feature.loadGeometry()) {
        const line = points.map((p) =>
          tileToLatLng({
            x: tile.x + p.x / feature.extent,
            y: tile.y + p.y / feature.extent,
          }),
        );
        result.push({ kind, line });
      }
    }
  }
  return result;
}

/** 線の種類。道路は rdCtg(0=国道、3=高速)、鉄道は ftCode 8201(普通鉄道) */
function kindOf(
  layerName: string,
  props: Record<string, unknown>,
): Kind | null {
  if (layerName === "road" && props.rdCtg === 0) return "nationalRoad";
  if (layerName === "road" && props.rdCtg === 3) return "expressway";
  if (layerName === "railway" && props.ftCode === 8201) return "railway";
  return null;
}

// ---- 3. 距離を測る ----

/** 一番近い線までの距離(m、四捨五入)。RADIUS より遠ければ null */
function nearest(from: LatLng, lines: Line[]): number | null {
  let min = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    for (let i = 0; i + 1 < line.length; i++) {
      min = Math.min(min, distanceToSegment(from, line[i], line[i + 1]));
    }
  }
  return min <= RADIUS ? Math.round(min) : null;
}

/**
 * 点から線分 a-b までの距離(m)。
 * 狭い範囲なので、点のまわりを平面とみなし、緯度・経度の差を m に直して測る
 */
function distanceToSegment(from: LatLng, a: LatLng, b: LatLng): number {
  const toMeters = (p: LatLng) => ({
    x: (p.lng - from.lng) * 111320 * Math.cos(toRadians(from.lat)),
    y: (p.lat - from.lat) * 110540,
  });
  const p = toMeters(a);
  const q = toMeters(b);
  // 線分上で原点(from)に一番近い点を求める
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len2 = dx * dx + dy * dy;
  const t =
    len2 === 0 ? 0 : Math.max(0, Math.min(1, -(p.x * dx + p.y * dy) / len2));
  return Math.hypot(p.x + t * dx, p.y + t * dy);
}

// ---- 座標の変換(地図タイルの決まった式) ----

function latLngToTile({ lat, lng }: LatLng): Tile {
  const n = 2 ** ZOOM;
  const r = toRadians(lat);
  return {
    x: ((lng + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n,
  };
}

function tileToLatLng({ x, y }: Tile): LatLng {
  const n = 2 ** ZOOM;
  return {
    lat: toDegrees(Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)))),
    lng: (x / n) * 360 - 180,
  };
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}
