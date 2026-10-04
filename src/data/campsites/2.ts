import { distanceSource, known, travelSource, unknown } from "../facts";
import type { Area, Campsite, CarAccess, Source } from "../types";

// 北軽井沢スウィートグラス
export default (() => {
  const checkedOn = "2026-09-28";
  const tent: Source = {
    kind: "official",
    url: "https://sweetgrass.jp/facilities/tent.html",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/gunma/10744",
    checkedOn,
  };
  const site = (
    name: string,
    area: Area,
    carAccess: CarAccess | null = "inside",
  ) => ({
    name,
    area: known(area, tent),
    carAccess: carAccess ? known(carAccess, tent) : unknown,
    layout: unknown,
    power: unknown,
    pets: unknown,
  });
  const sqm = (m: number, note?: string): Area => ({ min: m, max: m, note });
  const plus40 = "公式の表記は約80+40㎡で、+40㎡の内訳は書かれていない";

  return {
    id: 2,
    name: "北軽井沢スウィートグラス",
    location: known({ lat: 36.459958, lng: 138.576395 }, nap),
    prefecture: unknown,
    travelMinutes: known(161, travelSource(checkedOn)),
    quietHours: known(
      { start: "22:00", end: "06:00" },
      {
        kind: "official",
        url: "https://sweetgrass.jp/guidance/rule.html",
        checkedOn,
      },
    ),
    groupPolicy: known(
      {
        allowed: "yes",
        note: "1 区画 5 名まで。広々サイトは 10 名・2 張まででグループ向け",
      },
      tent,
    ),
    distanceTo: {
      expressway: known(null, distanceSource(checkedOn)),
      nationalRoad: known(838, distanceSource(checkedOn)),
      railway: known(null, distanceSource(checkedOn)),
    },
    groundTypes: known(["芝", "土", "砂"], nap),
    toiletFeatures: known(["温水洗浄便座"], nap),
    totalSites: unknown,
    bathing: unknown,
    rental: unknown,
    staffedOvernight: unknown,
    dayCamp: unknown,
    siteTypes: [
      site("木立サイト80", sqm(80)),
      site("木立パークサイト", sqm(80, "別に駐車スペース約40㎡")),
      site("木立サイト", sqm(120)),
      site("ハンモックサイト", sqm(80, plus40)),
      site("デビューサイト", sqm(120)),
      site("陽だまりガーデンサイト", sqm(80, plus40)),
      site("陽だまりサイト80", sqm(80)),
      site("ポリンポリンサイト", sqm(120, "別にトランポリンスペース約40㎡")),
      site("フリードッグサイト", sqm(128)),
      site("狼煙サイト", sqm(100)),
      site("陽だまり広々サイト", sqm(160)),
      site("林間広々サイト", sqm(150)),
      site("林間せせらぎサイト", sqm(150)),
      site("ソロサイト", sqm(25), "front"),
      site("林間サイト", sqm(100)),
      site("浅間ビューサイト", sqm(120)),
      site("大空サイト", sqm(160)),
      site("浅間ビューソロサイト", sqm(60), null),
    ],
  } satisfies Campsite;
})();
