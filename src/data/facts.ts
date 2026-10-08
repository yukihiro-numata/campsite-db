import { calculatedOn, calculatedValues } from "./calculated.ts";
import type { Campsite, Fact, Source } from "./types.ts";

export function known<T>(value: T, source: Source): Fact<T> {
  return { status: "known", value, source };
}

/** 不明。調べたが、出典に書かれていなかった */
export function notStated(source: Source) {
  return { status: "notStated", source } as const;
}

/** 未調査。まだ調べていない */
export const unchecked = { status: "unchecked" } as const;

const travelSource = (checkedOn: string): Source => ({
  kind: "calculated",
  url: "https://project-osrm.org/",
  note: "東京駅からキャンプ場の座標まで、OSRM(OpenStreetMap のデータ)で経路を計算した渋滞なしの目安",
  checkedOn,
});

const distanceSource = (checkedOn: string): Source => ({
  kind: "calculated",
  url: "https://maps.gsi.go.jp/development/vt.html",
  note: "キャンプ場の座標から、国土地理院ベクトルタイルの道路・鉄道までの直線距離",
  checkedOn,
});

const elevationSource = (checkedOn: string, note: string): Source => ({
  kind: "calculated",
  url: "https://maps.gsi.go.jp/development/elevation_s.html",
  note,
  checkedOn,
});

/** 計算スクリプトで出した値。計算していないキャンプ場は未調査 */
export function calculatedFacts(
  id: number,
): Pick<Campsite, "travelMinutes" | "elevation" | "distanceTo"> {
  const v = calculatedValues[id];
  if (!v) {
    return {
      travelMinutes: unchecked,
      elevation: unchecked,
      distanceTo: {
        expressway: unchecked,
        nationalRoad: unchecked,
        railway: unchecked,
      },
    };
  }
  const travel = travelSource(calculatedOn);
  const distance = distanceSource(calculatedOn);
  return {
    travelMinutes: known(v.travelMinutes, travel),
    elevation:
      v.elevation === null
        ? notStated(
            elevationSource(
              calculatedOn,
              "キャンプ場の座標では、国土地理院の標高 API が値を返さなかった",
            ),
          )
        : known(
            v.elevation,
            elevationSource(
              calculatedOn,
              "キャンプ場の座標の標高を、国土地理院の標高 API で求めた",
            ),
          ),
    distanceTo: {
      expressway: known(v.distanceTo.expressway, distance),
      nationalRoad: known(v.distanceTo.nationalRoad, distance),
      railway: known(v.distanceTo.railway, distance),
    },
  };
}
