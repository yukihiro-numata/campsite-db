import {
  distanceSource,
  known,
  notStated,
  travelSource,
  unchecked,
} from "../facts";
import type { Area, Campsite, CarAccess, Source } from "../types";

// リバーサイド長瀞オートキャンプ場
export default (() => {
  const checkedOn = "2026-09-28";
  const autocamp: Source = {
    kind: "official",
    url: "https://www.nagatoro-camp.com/autocamp/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/saitama/11007",
    checkedOn,
  };
  const checkedOn2 = "2026-10-04";
  const autocamp2: Source = { ...autocamp, checkedOn: checkedOn2 };
  // ペットは、公式はドッグサイト以外の可否を書いていないため、
  // なっぷの「オートサイトは全サイトOK」による
  const napPets: Source = { ...nap, checkedOn: checkedOn2 };
  // 全サイトが区画。公式は電源付きのサイトにだけ「AC電源付」と書いていて、
  // ほかのサイトに電源がないとは書いていないため不明にする
  const site = (
    name: string,
    area: Area | null,
    { carAccess = "inside" as CarAccess, power = false, dog = false } = {},
  ) => ({
    name,
    area: area ? known(area, autocamp) : unchecked,
    carAccess: known(carAccess, autocamp),
    layout: known("plot" as const, autocamp2),
    power: power ? known(true, autocamp2) : notStated(autocamp2),
    pets: known(true, dog ? autocamp2 : napPets),
  });
  const starry = { note: "車の駐車場所を除く" };

  return {
    id: 1,
    name: "リバーサイド長瀞オートキャンプ場",
    location: known(
      { lat: 36.105016, lng: 139.114251 },
      {
        kind: "official",
        url: "https://www.nagatoro-camp.com/access/",
        checkedOn,
      },
    ),
    prefecture: known("埼玉県", autocamp2),
    travelMinutes: known(85, travelSource(checkedOn)),
    quietHours: known({ start: "22:00", end: "06:00" }, autocamp),
    groupPolicy: known(
      { allowed: "no", note: "サイトの数に関わらず 5 名まで" },
      autocamp,
    ),
    distanceTo: {
      expressway: known(null, distanceSource(checkedOn)),
      nationalRoad: known(494, distanceSource(checkedOn)),
      railway: known(338, distanceSource(checkedOn)),
    },
    groundTypes: known(["土", "砂", "その他"], nap),
    toiletFeatures: known(["温水洗浄便座"], nap),
    totalSites: known(80, autocamp),
    bathing: known("shower", {
      kind: "official",
      url: "https://www.nagatoro-camp.com/amenity/",
      checkedOn: checkedOn2,
    }),
    rental: known(true, {
      kind: "official",
      url: "https://www.nagatoro-camp.com/cost/",
      checkedOn: checkedOn2,
    }),
    dayCamp: known(true, {
      kind: "official",
      url: "https://www.nagatoro-camp.com/daycamp/",
      checkedOn: checkedOn2,
    }),
    siteTypes: [
      site("V-ビューサイト レギュラー", { min: 100, max: 110 }),
      site("V-ビューサイト ワイド", { min: 140, max: 150 }),
      site("V-ソロサイト", { min: 85, max: 85 }),
      site("P-1 ガールズサイト", null, { power: true }),
      site("P-2 プレミアムサイト", { min: 225, max: 225 }),
      site("P-3 プレミアムサイト", { min: 160, max: 160 }),
      site("P-4 プレミアムサイト", { min: 336, max: 336 }),
      site(
        "P-5 プレミアムドッグノーリードサイト",
        { min: 312, max: 312 },
        { dog: true },
      ),
      site("P-6 プレミアムサイト", { min: 145, max: 145 }),
      site("P-ソロ プレミアムサイト", { min: 130, max: 130 }),
      site("A-青空サイト レギュラー", { min: 120, max: 120 }),
      site("A-青空サイト ワイド", { min: 160, max: 160 }),
      site("A-ソロサイト", { min: 75, max: 75 }),
      site("A-3サイト用", { min: 357, max: 357 }),
      site("H-ハンモックサイト", { min: 80, max: 90 }, { power: true }),
      site(
        "H-ハンモックサイト ワイド",
        { min: 130, max: 130 },
        { power: true },
      ),
      site(
        "S-星空サイト",
        { min: 60, max: 80, ...starry },
        { carAccess: "front" },
      ),
      site(
        "S-ソロサイト",
        { min: 60, max: 80, ...starry },
        { carAccess: "front" },
      ),
      // 電源付きと電源なしの区画がある
      site("M-森のサイト", { min: 100, max: 120 }, { power: true }),
      site("M-ソロサイト", { min: 65, max: 65 }),
      site("K-こもれ陽ソロサイト", { min: 100, max: 100 }),
      site(
        "D-ドッグフリーサイト",
        { min: 200, max: 250 },
        { power: true, dog: true },
      ),
    ],
  } satisfies Campsite;
})();
