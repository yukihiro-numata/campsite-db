// 座標から高速道路・国道・鉄道までの直線距離(m)を計算する。
// 国土地理院ベクトルタイル(experimental_bvmap、ズーム 16)の road レイヤー
// (rdCtg 0=国道、3=高速)と railway レイヤー(ftCode 8201)を使う。
// 座標のまわりを平面に近似して線分までの最短距離を出し、m に四捨五入する。
// 半径 1,500m 以内にないものは null

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VectorTile, type VectorTileFeature } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import type { CalculatedValues } from "../../src/data/types";
import type { LatLng } from "./index";

type Distances = CalculatedValues["distanceTo"];

const Z = 16;
const RADIUS = 1500;
const TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap";
const CACHE = join(tmpdir(), "campsite-db-bvmap");

function toTile({ lat, lng }: LatLng) {
  const n = 2 ** Z;
  const r = (lat * Math.PI) / 180;
  return {
    x: ((lng + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n,
  };
}

function toLatLng(x: number, y: number): LatLng {
  const n = 2 ** Z;
  return {
    lat: (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI,
    lng: (x / n) * 360 - 180,
  };
}

/** タイルを取る。海などでタイルがなければ null */
async function fetchTile(tx: number, ty: number): Promise<VectorTile | null> {
  await mkdir(CACHE, { recursive: true });
  const path = join(CACHE, `${Z}_${tx}_${ty}.pbf`);
  let data: Uint8Array;
  try {
    data = await readFile(path);
  } catch {
    const res = await fetch(`${TILE_URL}/${Z}/${tx}/${ty}.pbf`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`地理院タイル: ${res.status} ${tx}/${ty}`);
    data = new Uint8Array(await res.arrayBuffer());
    await writeFile(path, data);
  }
  return new VectorTile(new PbfReader(data));
}

function category(
  layer: string,
  ft: VectorTileFeature,
): keyof Distances | null {
  const p = ft.properties;
  if (layer === "road") {
    if (p.rdCtg === 0) return "nationalRoad";
    if (p.rdCtg === 3) return "expressway";
  }
  if (layer === "railway" && p.ftCode === 8201) return "railway";
  return null;
}

export async function distances(origin: LatLng): Promise<Distances> {
  const { x, y } = toTile(origin);
  // 座標のまわりを平面(m)に近似する
  const kx = 111320 * Math.cos((origin.lat * Math.PI) / 180);
  const ky = 110540;
  const tileM =
    (40075016.686 * Math.cos((origin.lat * Math.PI) / 180)) / 2 ** Z;
  const r = Math.ceil(RADIUS / tileM) + 1;

  const best: Record<keyof Distances, number | null> = {
    expressway: null,
    nationalRoad: null,
    railway: null,
  };
  for (let tx = Math.floor(x) - r; tx <= Math.floor(x) + r; tx++) {
    for (let ty = Math.floor(y) - r; ty <= Math.floor(y) + r; ty++) {
      const tile = await fetchTile(tx, ty);
      if (!tile) continue;
      for (const name of ["road", "railway"]) {
        const layer = tile.layers[name];
        if (!layer) continue;
        for (let i = 0; i < layer.length; i++) {
          const ft = layer.feature(i);
          const key = category(name, ft);
          if (!key) continue;
          for (const line of ft.loadGeometry()) {
            const pts = line.map((p) => {
              const ll = toLatLng(tx + p.x / ft.extent, ty + p.y / ft.extent);
              return {
                x: (ll.lng - origin.lng) * kx,
                y: (ll.lat - origin.lat) * ky,
              };
            });
            for (let j = 0; j + 1 < pts.length; j++) {
              const d = distanceToSegment(pts[j], pts[j + 1]);
              const b = best[key];
              if (b === null || d < b) best[key] = d;
            }
          }
        }
      }
    }
  }
  const result = (d: number | null) =>
    d !== null && d <= RADIUS ? Math.round(d) : null;
  return {
    expressway: result(best.expressway),
    nationalRoad: result(best.nationalRoad),
    railway: result(best.railway),
  };
}

/** 原点から線分 a-b までの距離 */
function distanceToSegment(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  const t =
    l2 === 0 ? 0 : Math.max(0, Math.min(1, -(a.x * dx + a.y * dy) / l2));
  return Math.hypot(a.x + t * dx, a.y + t * dy);
}
