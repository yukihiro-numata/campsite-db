import { distanceSource, known, travelSource, unknown } from "../facts";
import type { Area, Campsite, CarAccess, Source } from "../types";

// 有野実苑オートキャンプ場
export default (() => {
  const checkedOn = "2026-09-28";
  const autocamp: Source = {
    kind: "official",
    url: "https://arinomi.co.jp/autocamp/",
    checkedOn,
  };
  const faq: Source = {
    kind: "official",
    url: "https://arinomi.co.jp/faq/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/chiba/11966",
    checkedOn,
  };
  // 広さは各サイトのページの「約 縦×横 m」から求めた
  const site = (
    name: string,
    slug: string,
    size: [number, number] | null,
    carAccess: CarAccess = "inside",
  ) => {
    const source: Source = {
      kind: "official",
      url: `https://arinomi.co.jp/campsites/${encodeURIComponent(slug)}/`,
      checkedOn,
    };
    const area: Area | null = size && {
      min: size[0] * size[1],
      max: size[0] * size[1],
      note: `公式の表記は約${size[0]}×${size[1]}m`,
    };
    return {
      name,
      area: area ? known(area, source) : unknown,
      carAccess: known(carAccess, source),
    };
  };

  return {
    id: 3,
    name: "有野実苑オートキャンプ場",
    location: known(
      { lat: 35.674576, lng: 140.381809 },
      {
        kind: "official",
        url: "https://arinomi.co.jp/access/",
        checkedOn,
      },
    ),
    travelMinutes: known(67, travelSource(checkedOn)),
    quietHours: known({ start: "21:00", end: "06:30" }, faq),
    groupPolicy: known(
      {
        allowed: "no",
        note: "友人同士は 2 名まで。2 家族は 2 家族用サイトなどで可",
      },
      faq,
    ),
    distanceTo: {
      expressway: known(null, distanceSource(checkedOn)),
      nationalRoad: known(null, distanceSource(checkedOn)),
      railway: known(null, distanceSource(checkedOn)),
    },
    groundTypes: known(["土"], nap),
    toiletFeatures: known(["温水洗浄便座"], nap),
    totalSites: known(85, autocamp),
    siteTypes: [
      site("オートキャンプサイト", "オートキャンプサイト", [8, 8]),
      site("2家族用オートサイト", "2家族用オートサイト", null),
      site("テラスサイト", "テラスサイト", [12, 8]),
      site("ルーフサイト", "ルーフサイト", [8, 10]),
      site(
        "ウッドパーテーションサイト",
        "ウッドパーテーションサイト",
        [12, 12],
      ),
      site("JIKABIオートサイト", "jikabiオートサイト", [6, 6]),
      site("シェッドサイト", "シェッドサイト", [6, 6]),
      site("ソロサイト", "ソロサイト", [5, 5], "none"),
    ],
  } satisfies Campsite;
})();
