import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Area, Campsite, CarAccess, Source } from "../types.ts";

// 赤城山オートキャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const official = (path: string): Source => ({
    kind: "official",
    url: `https://autocamp-akagi.com/${path}`,
    checkedOn,
  });
  const equipment = official("equipment/index.html");
  const guide = official("information/index.html");
  const price = official("information/price.html");
  const access = official("information/access.html");
  const qanda = official("information/qanda.html");
  const reserve = official("information/reserve.html");

  // サイトの種類ごとの個別ページ。地面はすべて「砂利」、区画数・電源・区画ごとの
  // 「区画面積:約○㎡」(駐車場を含む)・駐車場はここに書かれている
  const site = (
    name: string,
    page: string,
    area: Area | null,
    carAccess: CarAccess,
    power: boolean,
  ): Campsite["siteTypes"][number] => {
    const source = official(`camp/site_${page}.html`);
    return {
      name,
      area: area ? known(area, source) : notStated(source),
      carAccess: known(carAccess, source),
      layout: known("plot", source),
      power: known(power, source),
      // 「ペットの入場は可能でございます。また無料でご案内しております」。
      // サイトごとの制限は書かれていない
      pets: known(true, qanda),
    };
  };

  return {
    id: 26,
    name: "赤城山オートキャンプ場",
    // アクセスページの地図の !2d/!3d は表示範囲の中心で、ピンから約 60m 離れているため、
    // 同じ地図の埋め込みページにあるピン(赤城山オートキャンプ場)の座標を使う
    location: known({ lat: 36.4824767, lng: 139.1807545 }, access),
    // ページ下の住所「群馬県前橋市三夜沢町４２５−１」
    prefecture: known("群馬県", access),
    ...calculatedFacts(26),
    // 「消灯時間は22時です」とだけあり、終わりの時刻は書かれていない
    quietHours: known({ start: "22:00" }, guide),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 家族 1 サイトで、複数家族は 3 家族サイト・ツインサイトなどの多家族サイトか宿泊施設を使う。ハイシーズンは大人だけ 3 名以上で利用できない(家族利用を除く)。ヒルズソロなどのソログループキャンプはできる",
      },
      reserve,
    ),
    // Q&A に「当キャンプ場は全て砂利サイトとなります」。各サイトのページも「砂利」
    groundTypes: known(["砂利"], qanda),
    // 「麓の誰でもトイレ」に「ウォシュレットも付いてます」
    toiletFeatures: known(["温水洗浄便座"], equipment),
    // テントサイトの区画数の合計(ブルー 6 + 2家族 3 + 3家族 4 + ツイン 2 + プレイ 3 +
    // ロング 5 + グリーン 8 + グリーン電源なし 5 + ワイルド 4 + ヒルズソロ 6 +
    // ヒルズソロ グループ用 5 + スカイソロ 6 + スカイソロマルチ 1)。各ページの「区画数」と
    // 料金表の区画による。キャビン・バンガローは入れない
    totalSites: known(58, price),
    // 無料のシャワールーム(麓・中腹)だけで、風呂の案内はない
    bathing: known("shower", equipment),
    // 料金表に「コールマンテントセット」などのレンタル品の料金がある
    rental: known(true, price),
    // 「デイキャンプはレギュラーシーズンのみご案内しております」
    dayCamp: known(true, price),
    // キャビン・バンガローは入れない。サイト紹介ページの区分ごとに 1 種類にした
    siteTypes: [
      site("ブルー区画サイト", "blue", { min: 90, max: 117 }, "inside", true),
      site("2家族サイト", "2f", { min: 118, max: 118 }, "inside", true),
      site("3家族サイト", "3f", { min: 167, max: 260 }, "inside", true),
      // T1 は区画内に 1 台、T2 は「区画脇に2台」
      site("ツインサイト", "twin", { min: 82, max: 117 }, "inside", true),
      site("プレイサイト", "play", { min: 62, max: 68 }, "inside", true),
      site(
        "ロングサイト",
        "long",
        { min: 67, max: 93, note: "L2 の区画面積は「-」で書かれていない" },
        "inside",
        true,
      ),
      // 電源は G1〜G6 が 500W、G7・G8 が 1000W
      site("グリーン区画サイト", "green", { min: 58, max: 90 }, "inside", true),
      site(
        "グリーン区画サイト(電源なし)",
        "green_not",
        { min: 35, max: 49 },
        "inside",
        false,
      ),
      site("ワイルドサイト", "wild", { min: 51, max: 75 }, "inside", true),
      // 駐車場は「区画外に1台」。Q&A に「10～50mほど離れた駐車場に駐車」とある。
      // H1 は料金表から外れていて「区画数 6」のため、広さは H2〜H7 の値
      site("ヒルズソロ", "hills", { min: 15, max: 28 }, "none", false),
      // 「車の横付けOK」。区画内に 2〜4 台
      site(
        "ヒルズソロ(グループ用)",
        "hills_group",
        { min: 92, max: 247 },
        "inside",
        true,
      ),
      // S1〜S4・ST(スカイツイン)・Y1(スカイソロオート)の 6 区画。電源は「あり/なし」。
      // 区画内に停められるのは Y1 だけで、スカイソロサイトは Q&A に「10～50mほど離れた
      // 駐車場に駐車」とある。広さが表示されているのは Y1(約16㎡)だけで、
      // 種類全体の広さとは言えないため不明にする
      site("スカイソロ", "sky", null, "inside", true),
      site(
        "スカイソロマルチ",
        "sky_multi",
        { min: 155, max: 155 },
        "inside",
        false,
      ),
    ],
  } satisfies Campsite;
})();
