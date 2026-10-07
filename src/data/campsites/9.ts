import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Area, Campsite, CarAccess, Source } from "../types.ts";

// ケニーズ・ファミリー・ビレッジ
export default (() => {
  const checkedOn = "2026-10-07";
  const sites: Source = {
    kind: "official",
    url: "https://www.kfv.co.jp/facility/facility/",
    checkedOn,
  };
  const rules: Source = {
    kind: "official",
    url: "https://www.kfv.co.jp/attention/rules/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/saitama/11037",
    checkedOn,
  };
  // 広さ・車・区画・電源はサイト紹介ページから。全サイトの説明に「区画」とある。
  // ペットは利用規約の「ペットの同伴は可能です」(1 サイト 2 匹まで)による
  const site = (
    name: string,
    area: Area,
    { carAccess = "inside" as CarAccess } = {},
  ) => ({
    name,
    area: known(area, sites),
    carAccess: known(carAccess, sites),
    layout: known("plot" as const, sites),
    power: known(true, sites),
    pets: known(true, rules),
  });
  const sqm = (m: number, note?: string): Area => ({ min: m, max: m, note });

  return {
    id: 9,
    name: "ケニーズ・ファミリー・ビレッジ",
    // 公式のアクセスページの地図の座標は表示範囲の中心で、キャンプ場から数 km
    // 離れているため、予約サイトの座標を使う
    location: known({ lat: 35.8798907, lng: 139.1830578 }, nap),
    prefecture: known("埼玉県", {
      kind: "official",
      url: "https://www.kfv.co.jp/access/",
      checkedOn,
    }),
    ...calculatedFacts(9),
    quietHours: known({ start: "22:00", end: "06:00" }, rules),
    // 団体利用のページ(https://www.kfv.co.jp/attention/group/)には、
    // 3 サイト以上での宿泊の予約を受けていないとも書かれている
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "大人だけのグループ(3 名以上)は全員 25 歳以上なら泊まれる",
      },
      sites,
    ),
    // 公式のサイト紹介の地面の表記は「小砂利」「整備された河原石」。
    // 予約サイトは「土 / 砂 / その他」だが、公式を採る
    groundTypes: known(["砂利", "河原石"], sites),
    // 管理棟のトイレがウォシュレット
    toiletFeatures: known(["温水洗浄便座"], {
      kind: "official",
      url: "https://www.kfv.co.jp/facility/%e5%85%b1%e6%9c%89%e8%a8%ad%e5%82%99/",
      checkedOn,
    }),
    // サイトの数が「2〜5サイト」「17〜23サイト」のように幅で書かれていて、
    // 全体の数は書かれていない
    totalSites: notStated(sites),
    // 有料のシャワー室だけ。予約サイトには「お風呂」とあるが、公式を採る
    bathing: known("shower", {
      kind: "official",
      url: "https://www.kfv.co.jp/facility/%e5%85%b1%e6%9c%89%e8%a8%ad%e5%82%99/",
      checkedOn,
    }),
    rental: known(true, {
      kind: "official",
      url: "https://www.kfv.co.jp/charge/rental/",
      checkedOn,
    }),
    // 基本料金にテントサイトの日帰りの料金がある
    dayCamp: known(true, {
      kind: "official",
      url: "https://www.kfv.co.jp/charge/charge/",
      checkedOn,
    }),
    // 常設テントサイト(テント設営済み)・屋根付きバーベキューサイト(日帰り専用)・
    // ログハウスは入れない
    siteTypes: [
      site("一般サイト", sqm(75)),
      // 説明は「電源付きのコンパクトなオートサイト」
      site("一般サイト ミニ", sqm(45)),
      // 電源付きと電源なしの区画がある
      site("河原サイト", sqm(70, "よくある質問では「サイトのサイズが60㎡程」")),
      site("河原ソロ・デュオ専用サイト", sqm(70)),
      // 車は柵の外、サイトのすぐ隣に停める
      site("柵付ドッグフリーサイト", sqm(80), { carAccess: "front" }),
    ],
  } satisfies Campsite;
})();
