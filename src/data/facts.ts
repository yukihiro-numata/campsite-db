import type { Fact, Source } from "./types";

export function known<T>(value: T, source: Source): Fact<T> {
  return { status: "known", value, source };
}

export const unknown = { status: "unknown" } as const;

export const travelSource = (checkedOn: string): Source => ({
  kind: "calculated",
  url: "https://project-osrm.org/",
  note: "東京駅からキャンプ場の座標まで、OSRM(OpenStreetMap のデータ)で経路を計算した渋滞なしの目安",
  checkedOn,
});

export const distanceSource = (checkedOn: string): Source => ({
  kind: "calculated",
  url: "https://maps.gsi.go.jp/development/vt.html",
  note: "キャンプ場の座標から、国土地理院ベクトルタイルの道路・鉄道までの直線距離",
  checkedOn,
});
