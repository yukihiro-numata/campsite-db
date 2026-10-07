import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// フォレストサンズ長瀞
export default (() => {
  const checkedOn = "2026-10-07";
  const tentSite: Source = {
    kind: "official",
    url: "https://forestsons.jp/product/tent-site/",
    checkedOn,
  };
  const freeSite: Source = {
    kind: "official",
    url: "https://forestsons.jp/product/bushcraft/",
    checkedOn,
  };
  const guide: Source = {
    kind: "official",
    url: "https://forestsons.jp/guide/",
    checkedOn,
  };
  const faq: Source = {
    kind: "official",
    url: "https://forestsons.jp/faq/",
    checkedOn,
  };

  return {
    id: 7,
    name: "フォレストサンズ長瀞",
    location: known(
      { lat: 36.109857, lng: 139.11394 },
      {
        kind: "official",
        url: "https://forestsons.jp/access/",
        checkedOn,
      },
    ),
    prefecture: known("埼玉県", {
      kind: "official",
      url: "https://forestsons.jp/access/",
      checkedOn,
    }),
    ...calculatedFacts(7),
    // 「21:30以降はお静かに」とあり、消灯時間は特に設けていないとも書かれている。
    // 終わりの時刻は書かれていない
    quietHours: known(
      { start: "21:00" },
      {
        kind: "official",
        url: "https://forestsons.jp/dear-customer/",
        checkedOn,
      },
    ),
    // テントサイトは 1 区画 4 名まで(テントサイトのページ)。
    // ソロ&デュオフリーサイトは 2 名ずつ代表者を分けて予約する(フリーサイトのページ)
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "テントサイトは 1 区画 4 名まで。5 棟以上・30 名以上などの団体はデポジットが必要",
      },
      faq,
    ),
    // テントサイトは「レンガ砂利」、ソロ&デュオフリーサイトは「赤砂利」
    groundTypes: known(["砂利"], tentSite),
    // 「洋式水洗 ウォシュレット付き」
    toiletFeatures: known(["温水洗浄便座"], tentSite),
    // テントサイトの区画数。ソロ&デュオフリーサイトは区画数ではなく先着 25 名まで
    totalSites: known(17, tentSite),
    // 男女別のコインシャワー。トレーラー・コテージの室内のシャワーと、
    // 場外の関連施設の温泉は数えない
    bathing: known("shower", tentSite),
    rental: known(true, guide),
    // 日帰りのプランはなく、日帰りでも 1 泊の予約と料金になる
    dayCamp: known(false, faq),
    siteTypes: [
      {
        name: "テントサイト(No.1〜17)",
        area: known(
          {
            min: 72,
            max: 171,
            note: "各区画の図の「AREA≒」の値。区画ごとに形が違う",
          },
          tentSite,
        ),
        // サイト内への乗り入れは不可で、駐車スペースはサイトの隣
        carAccess: known("front", tentSite),
        layout: known("plot", tentSite),
        // 全区画に AC 電源
        power: known(true, tentSite),
        pets: known(true, faq),
      },
      {
        name: "ソロ&デュオフリーサイト",
        // 「大きさは大中小それぞれ」とだけあり、広さは書かれていない
        area: notStated(freeSite),
        // 駐車場はサイトから 25m 離れていて、サイト内に車は入れない
        carAccess: known("none", freeSite),
        // 「フリーサイト」と説明する一方で「1区画1人～2人」「大きさは大中小」とも
        // 書かれていて、区画かフリーかが説明文から決められない
        layout: notStated(freeSite),
        // FAQ の「ブッシュクラフトエリアには電源はございません」による
        power: known(false, faq),
        pets: known(true, faq),
      },
    ],
  } satisfies Campsite;
})();
