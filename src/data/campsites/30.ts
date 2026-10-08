import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// 榛名湖オートキャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const page = (name: string): Source => ({
    kind: "official",
    url: `https://www.harunakocamp.jp/${name}`,
    checkedOn,
  });
  const top = page("");
  const about = page("about.html");
  const site1 = page("about_site01.html");
  const site2 = page("about_site02.html");
  const site3 = page("about_site03.html");
  const daycamp = page("about_site_daycamp.html");
  const information = page("information.html");
  const notes = page("information2.html");
  const rental = page("information_rental.html");
  const guideline = page("guideline.html");
  const map = page("map.html");
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/gunma/10757",
    checkedOn,
  };
  const sqm100 = {
    min: 100,
    max: 100,
    note: "公式の表記は10m×10m",
  };

  return {
    id: 30,
    name: "榛名湖オートキャンプ場",
    // アクセスページに地図がないため、周辺施設の地図(メニューからはリンクが外れている)の
    // 「榛名湖オートキャンプ場」の座標を使う。予約サイトの座標とほぼ同じ
    location: known({ lat: 36.479535, lng: 138.889096 }, map),
    prefecture: known("群馬県", top),
    ...calculatedFacts(30),
    // 「粛静時間は22時〜7時です」
    quietHours: known({ start: "22:00", end: "07:00" }, guideline),
    // 1 区画(1 棟)の人数の上限のほかに、グループの数や人数の制限は書かれていない。
    // 飲酒を伴う宴会と宴会前提の申し込みは断っている
    groupPolicy: known(
      {
        allowed: "yes",
        note: "1 区画 6 名まで(日帰りで合流する人を含む)。飲酒を伴う宴会前提の申し込みは受け付けない",
      },
      notes,
    ),
    // 公式はテントサイト III の「草地と砂地の混在サイト」だけを書いていて、
    // テントサイト I・II の地面は書かれていない。予約サイトは「芝 / 土」
    groundTypes: known(["芝", "砂"], site3),
    // 公式はトイレの種類を書いていない。予約サイトの紹介文に「ウォッシュレット式トイレ」
    // とある。バンガローの中にトイレはないため、テントサイトが使う共同のトイレと読む
    toiletFeatures: known(["温水洗浄便座"], nap),
    // テントを張るサイトの合計(I 17 + II 31 + III 22)。バンガローは含まない
    totalSites: known(70, about),
    // センターハウスのシャワー室(有料)。入浴施設は場外の温泉
    bathing: known("shower", information),
    rental: known(true, rental),
    // デイキャンプ(4 時間、最長 8 時間)の案内がある
    dayCamp: known(true, daycamp),
    // ペットは「ＯＫです」(3 匹まで)。センターハウス・バンガロー・サニタリー棟には入れない。
    // バンガローと、ページ上で非表示のトレーラーハウスは入れない
    siteTypes: [
      {
        name: "テントサイト I（電源付区画型）",
        area: known(sqm100, site1),
        // No.1〜10 は外周道路とフラットでキャンピングカーも利用できる。
        // No.11〜18 は段差があり「駐車スペースのみ駐車可能」
        carAccess: known("inside", site1),
        layout: known("plot", site1),
        // 「AC電源付(100V15A)」
        power: known(true, site1),
        pets: known(true, information),
      },
      {
        name: "テントサイト II（電源なし区画型）",
        area: known(sqm100, site2),
        // どの区画も「外周道路と区画に段差あり。駐車スペースのみ駐車可能」。
        // 駐車スペースは 1 区画 1 台分
        carAccess: known("front", site2),
        layout: known("plot", site2),
        power: known(false, site2),
        pets: known(true, information),
      },
      {
        name: "テントサイト III（フリーサイト・区画なし）",
        area: notStated(site3),
        // 「サイト内に車の乗り入れはできません(周回道路に縦列駐車)」
        carAccess: known("front", site3),
        // 「フリーサイト・区画なし」
        layout: known("free", site3),
        // サイト No.51〜54 は「電源付サイト」
        power: known(true, site3),
        pets: known(true, information),
      },
    ],
  } satisfies Campsite;
})();
