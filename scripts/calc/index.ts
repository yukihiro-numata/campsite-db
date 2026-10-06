// 計算して埋める値を、すべてのキャンプ場について計算し直し、
// src/data/calculated.ts に書き出す。座標が分かっていないキャンプ場は飛ばす。
// 計算を足すときは、CalculatedValues と calculate() に足す。
//
// 使い方: pnpm calc

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { campsites } from "../../src/data/campsites/index.ts";
import type { CalculatedValues } from "../../src/data/types.ts";
import { distances } from "./distance.ts";
import { travelMinutes } from "./travel.ts";

export type LatLng = { lat: number; lng: number };

const OUT = "src/data/calculated.ts";

async function calculate(location: LatLng): Promise<CalculatedValues> {
  return {
    travelMinutes: await travelMinutes(location),
    distanceTo: await distances(location),
  };
}

async function main() {
  // 日本時間の今日を、出典の「調べた日」と同じ YYYY-MM-DD で出す。
  // スウェーデン(sv-SE)の書き方がちょうどこの形になるため使っている。
  // toISOString() は世界標準時なので、日本時間の朝 9 時前だと前の日になる
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  });
  const values: Record<number, CalculatedValues> = {};
  for (const c of campsites) {
    if (c.location.status !== "known") {
      console.log(`${c.id} ${c.name}: 座標がないため飛ばす`);
      continue;
    }
    values[c.id] = await calculate(c.location.value);
    console.log(`${c.id} ${c.name}: ${JSON.stringify(values[c.id])}`);
  }

  const entries = Object.entries(values)
    .map(([id, v]) => `${id}: ${JSON.stringify(v)},`)
    .join("\n");
  writeFileSync(
    OUT,
    [
      "// scripts/calc が書き出すファイル。手で直さない(pnpm calc で作り直す)",
      'import type { CalculatedValues } from "./types.ts";',
      "",
      `export const calculatedOn = "${today}";`,
      "",
      `export const calculatedValues: Record<number, CalculatedValues> = {\n${entries}\n};`,
      "",
    ].join("\n"),
  );
  execFileSync("pnpm", ["exec", "biome", "format", "--write", OUT], {
    stdio: "ignore",
  });
  console.log(`${OUT} に書き出した(${today})`);
}

main();
