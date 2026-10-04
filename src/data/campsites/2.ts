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
  const checkedOn2 = "2026-10-04";
  const tent2: Source = { ...tent, checkedOn: checkedOn2 };
  // 区画・電源・ペットは各サイトの詳細ページ(fcNNNN)から。全サイトが区画
  const site = (
    name: string,
    area: Area,
    page: string | null,
    { carAccess = "inside" as CarAccess | null, power = true } = {},
  ) => {
    const detail: Source | null =
      page === null
        ? null
        : {
            kind: "official",
            url: `https://sweetgrass.jp/facilities/${page}`,
            checkedOn: checkedOn2,
          };
    return {
      name,
      area: known(area, tent),
      carAccess: carAccess ? known(carAccess, tent) : unknown,
      layout: detail ? known("plot" as const, detail) : unknown,
      power: detail ? known(power, detail) : unknown,
      pets: detail ? known(true, detail) : unknown,
    };
  };
  const sqm = (m: number, note?: string): Area => ({ min: m, max: m, note });
  const plus40 = "公式の表記は約80+40㎡で、+40㎡の内訳は書かれていない";

  return {
    id: 2,
    name: "北軽井沢スウィートグラス",
    location: known({ lat: 36.459958, lng: 138.576395 }, nap),
    prefecture: known("群馬県", tent2),
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
    // 予約制の貸切風呂
    bathing: known("bath", {
      kind: "official",
      url: "https://sweetgrass.jp/pr/bld/bath/",
      checkedOn: checkedOn2,
    }),
    rental: known(true, {
      kind: "official",
      url: "https://sweetgrass.jp/rentals/",
      checkedOn: checkedOn2,
    }),
    staffedOvernight: unknown,
    dayCamp: known(true, {
      kind: "official",
      url: "https://sweetgrass.jp/guidance/oneday.html",
      checkedOn: checkedOn2,
    }),
    siteTypes: [
      site("木立サイト80", sqm(80), "fc1059"),
      site("木立パークサイト", sqm(80, "別に駐車スペース約40㎡"), "fc1061"),
      site("木立サイト", sqm(120), "fc1076"),
      site("ハンモックサイト", sqm(80, plus40), "fc1060"),
      site("デビューサイト", sqm(120), "fc1064"),
      site("陽だまりガーデンサイト", sqm(80, plus40), "fc1089"),
      site("陽だまりサイト80", sqm(80), "fc1088"),
      site(
        "ポリンポリンサイト",
        sqm(120, "別にトランポリンスペース約40㎡"),
        "fc1062",
      ),
      site("フリードッグサイト", sqm(128), "fc1066"),
      site("狼煙サイト", sqm(100), "fc1070"),
      site("陽だまり広々サイト", sqm(160), "fc1067"),
      site("林間広々サイト", sqm(150), "fc1069"),
      site("林間せせらぎサイト", sqm(150), "fc1071"),
      site("ソロサイト", sqm(25), "fc1063", {
        carAccess: "front",
        power: false,
      }),
      site("林間サイト", sqm(100), "fc1068", { power: false }),
      site("浅間ビューサイト", sqm(120), "fc1072", { power: false }),
      site("大空サイト", sqm(160), "fc1073", { power: false }),
      // 公式に詳細ページが見つからない
      site("浅間ビューソロサイト", sqm(60), null, { carAccess: null }),
    ],
  } satisfies Campsite;
})();
