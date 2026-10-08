import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// PICA富士西湖
export default (() => {
  const checkedOn = "2026-10-08";
  const siteIndex: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/saiko/stay/site/index.html",
    checkedOn,
  };
  const guidance: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/saiko/about/guidance.html",
    checkedOn,
  };
  const faq: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/saiko/faq/index.html",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/saiko/access/index.html",
    checkedOn,
  };
  const page = (name: string): Source => ({
    kind: "official",
    url: `https://www.pica-resort.jp/saiko/stay/site/${name}.html`,
    checkedOn,
  });
  const tentA = page("tent-a");
  const lakeview = page("tent-lakeview");
  const tenbaPlot = page("tenba-kukaku");
  const privateSite = page("private");
  const campingcar = page("campingcar");
  const skyfield = page("skyfield");
  const tenbaFree = page("tenba-free");
  const privateField = page("private_field");
  const yaeijyo = page("yaeijyo");
  const sqm = (m: number): { min: number; max: number; note: string } => ({
    min: m,
    max: m,
    note: `公式の表記は約${m}㎡`,
  });

  return {
    id: 21,
    name: "PICA富士西湖",
    // 地図の埋め込みの座標。同じページの住所に添えた「東経138°40′39″北緯35°29′26″」
    // とは約 500m ずれる
    location: known({ lat: 35.494441, lng: 138.675462 }, access),
    prefecture: known("山梨県", access),
    ...calculatedFacts(21),
    // 「夜10時以降、お静かに」とだけあり、終わりの時刻は書かれていない
    quietHours: known({ start: "22:00" }, guidance),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 回(1 泊)の利用が 6 棟(区画)を超えるグループは団体利用として扱い、問い合わせで受け付ける",
      },
      guidance,
    ),
    // よくある質問の「テントサイトの地面は」に「土又は砂利」とある
    groundTypes: known(["土", "砂利"], faq),
    // 予約サイトの「ウォッシュレット式トイレ」はコテージなどを含む施設全体の設備で、
    // テントサイトの値とは限らないため使わない
    toiletFeatures: notStated(guidance),
    // TENBA フリーサイトの数が「14～25サイト」と幅で書かれていて(スカイフィールドも
    // 「目安18サイト」)、全体の数は書かれていない
    totalSites: notStated(siteIndex),
    // 「場内の共同浴場は利用無料」
    bathing: known("bath", guidance),
    // テント・タープなどのレンタルの案内がある
    rental: known(true, faq),
    // 「当日に空きがありましたら、ご利用が出来る場合があります」(事前予約は不可)
    dayCamp: known(true, faq),
    // ペットは、よくある質問の「Fire base・TAKIBI」「Fire base・KAMADO」以外は同伴可による。
    // コテージ・パオ・トレーラー・グループキャビンは入れない
    siteTypes: [
      {
        name: "テントサイト 電源付き（A）",
        area: known(sqm(100), tentA),
        // 「車1台」。区画ロープ内に車・テント・タープを収める
        carAccess: known("inside", tentA),
        layout: known("plot", tentA),
        power: known(true, tentA),
        pets: known(true, faq),
      },
      {
        name: "テントサイト 電源付き（A）レイクビューサイト",
        area: known(sqm(100), lakeview),
        carAccess: known("inside", lakeview),
        layout: known("plot", lakeview),
        power: known(true, lakeview),
        pets: known(true, faq),
      },
      {
        name: "テントサイトTENBA・区画",
        area: known(sqm(100), tenbaPlot),
        carAccess: known("inside", tenbaPlot),
        layout: known("plot", tenbaPlot),
        power: known(true, tenbaPlot),
        pets: known(true, faq),
      },
      {
        name: "プライベートサイト",
        area: known(
          {
            min: 100,
            max: 100,
            note: "公式の表記は約100㎡(砂利敷 約70㎡＋自然地形 約30㎡)",
          },
          privateSite,
        ),
        // 「車の横付けOK」「車1台」
        carAccess: known("inside", privateSite),
        // 1 サイトだけの、区画ロープのあるサイト
        layout: known("plot", privateSite),
        // 「まだ電源はありませんが」
        power: known(false, privateSite),
        pets: known(true, faq),
      },
      {
        // よくある質問に「テント、タープ各1張り設営できます」とある。サイトのページは
        // 「テント・タープ数制限無し」と書いている
        name: "キャンピングカーサイト",
        area: known(sqm(100), campingcar),
        carAccess: known("inside", campingcar),
        layout: known("plot", campingcar),
        power: known(true, campingcar),
        pets: known(true, faq),
      },
      {
        name: "スカイフィールド フリーサイト（電源あり）",
        area: known(
          { min: 120, max: 120, note: "公式の表記は 1 サイトの目安 約120㎡" },
          skyfield,
        ),
        // 「車はサイトに乗り入れできますが、1サイト1台まで」
        carAccess: known("inside", skyfield),
        // 「区画を仕切る境界線はありません」
        layout: known("free", skyfield),
        power: known(true, skyfield),
        pets: known(true, faq),
      },
      {
        name: "テントサイト・TENBA フリーサイト",
        area: known(
          {
            min: 40,
            max: 80,
            note: "公式の表記は 1 サイトの目安で team 80㎡、solo・duo 40～50㎡",
          },
          tenbaFree,
        ),
        // 「サイト内にお車の乗り入れはできません」。専用駐車場に停める
        carAccess: known("none", tenbaFree),
        // 「区画を仕切る境界線はありません」
        layout: known("free", tenbaFree),
        // team は「利用可能 1組1,000Wまで」、solo・duo は共同電源
        power: known(true, tenbaFree),
        pets: known(true, faq),
      },
      {
        name: "プライベート フィールド",
        area: known(
          {
            min: 2500,
            max: 2500,
            note: "公式の表記は約50ｍ×50ｍ 2500㎡(1 日 1 組の貸し切り)",
          },
          privateField,
        ),
        // 「車の乗り入れは一切できません」。共同駐車場から荷物を運ぶ
        carAccess: known("none", privateField),
        // 「テント設営エリアは完全自由(フリーサイト)の森林サイト」
        layout: known("free", privateField),
        // 「電源はありません」
        power: known(false, privateField),
        pets: known(true, faq),
      },
      {
        name: "西湖 野営場",
        area: notStated(yaeijyo),
        // 「お車はサイト内に乗り入れできますが、1サイト1台まで」
        carAccess: known("inside", yaeijyo),
        // 「フリーサイト」
        layout: known("free", yaeijyo),
        // 「フリーサイト(電源はありません)」
        power: known(false, yaeijyo),
        pets: known(true, faq),
      },
    ],
  } satisfies Campsite;
})();
