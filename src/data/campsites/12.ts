import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Fact, Source } from "../types.ts";

// オートキャンプ・フルーツ村
export default (() => {
  const checkedOn = "2026-10-08";
  const plan: Source = {
    kind: "official",
    url: "http://www.fruitsvillage.com/plan1.html",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "http://www.fruitsvillage.com/access.html",
    checkedOn,
  };
  const rule: Source = {
    kind: "official",
    url: "http://www.fruitsvillage.com/fruitsvillage-rule.html",
    checkedOn,
  };
  const houseRules: Source = {
    kind: "official",
    url: "http://www.fruitsvillage.com/fruitsvillage-dust.html",
    checkedOn,
  };
  const pet: Source = {
    kind: "official",
    url: "http://www.fruitsvillage.com/fruitsvillage-pet.html",
    checkedOn,
  };
  const reserve: Source = {
    kind: "official",
    url: "http://www.fruitsvillage.com/fruitsvillage-yoyaku.html",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/chiba/11962",
    checkedOn,
  };
  // 広さは「オートキャンプサイトの1区画当たりの広さは平均8m×10m」(種類ごとではなく全体の平均)。
  // 全サイトが区画(「フリーサイトはございません。全てが区画されたサイト」)。
  // 車は公式に書かれていないため、予約サイトの「1サイトにつき1台まで乗り入れ可」による。
  // ペットは「ペット可のキャンプ場ですがペット連れ用の専用サイトは御座いません」(1 家族 1 匹まで)
  const site = (name: string, power: Fact<boolean>) => ({
    name,
    area: known(
      { min: 80, max: 80, note: "公式の表記は全サイトの平均8m×10m" },
      plan,
    ),
    carAccess: known("inside" as const, nap),
    layout: known("plot" as const, reserve),
    power,
    pets: known(true, pet),
  });

  return {
    id: 12,
    name: "オートキャンプ・フルーツ村",
    // アクセスページの地図(img/sp-google-map-1.js)のマーカーの座標。予約サイトの座標ともほぼ同じ
    location: known({ lat: 35.201798, lng: 140.019319 }, access),
    prefecture: known("千葉県", access),
    ...calculatedFacts(12),
    // 「夜10時以降はお静かに！ 消灯・就寝時間は夜10時です」とだけあり、終わりの時刻は書かれていない
    quietHours: known({ start: "22:00" }, houseRules),
    groupPolicy: known(
      {
        allowed: "no",
        note: "1 家族 1 サイトまで。複数グループ・複数サイトの申し込みと場内での合流を断っている。大人だけは 2 名まで",
      },
      rule,
    ),
    // 公式は「草地サイト」と「林間サイトは地盤が土」。予約サイトも「芝 / 土」
    groundTypes: known(["芝", "土"], plan),
    // 予約サイトのよくある質問に「ウォシュレットは付いていません」とある
    toiletFeatures: known([], {
      ...nap,
      note: "よくある質問の「トイレは和洋式どちらですか？ウォシュレットはありますか？」",
    }),
    // 公式・予約サイトとも全体のサイト数が書かれていない
    totalSites: notStated(plan),
    // コインシャワーだけ
    bathing: known("shower", houseRules),
    rental: known(true, {
      kind: "official",
      url: "http://www.fruitsvillage.com/fruitsvillage-item.html",
      checkedOn,
    }),
    // 「デーキャンプ(日帰りバーベキュー)におきましても2名様まで」とある。
    // 予約サイトのよくある質問にもデイキャンプの料金と時間がある
    dayCamp: known(true, rule),
    // バンガローは入れない
    siteTypes: [
      // 草地サイト・林間サイト・林間川沿いサイトがある。公式は電源の有無を書いていないため、
      // 予約サイトの料金の「電源なし」による
      site("オートサイト", known(false, nap)),
      site("AC電源付オートサイト", known(true, plan)),
    ],
  } satisfies Campsite;
})();
