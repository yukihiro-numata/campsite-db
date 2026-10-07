import { calculatedFacts, known, unchecked } from "../facts.ts";
import type { Area, Campsite, CarAccess, Source } from "../types.ts";

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
  const checkedOn2 = "2026-10-04";
  // 広さは各サイトのページの「約 縦×横 m」から求めた。
  // 全サイトが区画型(「キャンプサイトは木々で仕切られた区画型」)
  const site = (
    name: string,
    slug: string,
    size: [number, number] | null,
    { power = false, pets = true, carAccess = "inside" as CarAccess } = {},
  ) => {
    const source: Source = {
      kind: "official",
      url: `https://arinomi.co.jp/campsites/${encodeURIComponent(slug)}/`,
      checkedOn,
    };
    const source2: Source = { ...source, checkedOn: checkedOn2 };
    const area: Area | null = size && {
      min: size[0] * size[1],
      max: size[0] * size[1],
      note: `公式の表記は約${size[0]}×${size[1]}m`,
    };
    return {
      name,
      area: area ? known(area, source) : unchecked,
      carAccess: known(carAccess, source),
      layout: known("plot" as const, { ...autocamp, checkedOn: checkedOn2 }),
      power: known(power, source2),
      pets: known(pets, source2),
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
    prefecture: known("千葉県", {
      kind: "official",
      url: "https://arinomi.co.jp/access/",
      checkedOn: checkedOn2,
    }),
    ...calculatedFacts(3),
    quietHours: known({ start: "21:00", end: "06:30" }, faq),
    groupPolicy: known(
      {
        allowed: "no",
        note: "友人同士は 2 名まで。2 家族は 2 家族用サイトなどで可",
      },
      faq,
    ),
    groundTypes: known(["土"], nap),
    toiletFeatures: known(["温水洗浄便座"], nap),
    totalSites: known(85, autocamp),
    // 予約サイトには「風呂」とあるが、公式はシャワーだけを案内しているので公式を採る
    bathing: known("shower", { ...autocamp, checkedOn: checkedOn2 }),
    rental: known(true, {
      kind: "official",
      url: "https://arinomi.co.jp/rental/",
      checkedOn: checkedOn2,
    }),
    dayCamp: known(true, { ...autocamp, checkedOn: checkedOn2 }),
    // 電源は有料オプションで、使えるのは一部の区画だけ
    siteTypes: [
      site("オートキャンプサイト", "オートキャンプサイト", [8, 8], {
        power: true,
      }),
      site("2家族用オートサイト", "2家族用オートサイト", null, {
        power: true,
      }),
      site("テラスサイト", "テラスサイト", [12, 8]),
      site("ルーフサイト", "ルーフサイト", [8, 10], { power: true }),
      site(
        "ウッドパーテーションサイト",
        "ウッドパーテーションサイト",
        [12, 12],
      ),
      site("JIKABIオートサイト", "jikabiオートサイト", [6, 6]),
      site("シェッドサイト", "シェッドサイト", [6, 6], { pets: false }),
      site("ソロサイト", "ソロサイト", [5, 5], { carAccess: "none" }),
    ],
  } satisfies Campsite;
})();
