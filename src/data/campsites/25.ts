import { calculatedFacts, known } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// おいしいキャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const page = (path: string): Source => ({
    kind: "official",
    url: `https://oic-camp.com/${path}`,
    checkedOn,
  });
  const map = page("service/map/");
  const allweather = page("service/allweather/");
  const autoL = page("service/auto-l/");
  const autoW = page("service/auto-w/");
  const autoM = page("service/auto-m/");
  const autoS = page("service/auto-s/");
  const solo = page("service/solo/");
  const utility = page("service/utility/");
  const precaution = page("price/precaution/");
  const googleMap = page("access/google-map/");
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/yamanashi/13774",
    checkedOn,
  };
  const sqm = (w: number, d: number, note?: string) => ({
    min: w * d,
    max: w * d,
    note: note ?? `公式の表記は${w}m×${d}m`,
  });
  // 利用の注意に「ロープなどで区画された中でお過ごしください」「1区画につきお車は1台のみ」。
  // よくある質問に「普通の乗用車でサイトに乗り入れられますか?」「全く問題ありません」
  const auto = (name: string, area: ReturnType<typeof sqm>, src: Source) => ({
    name,
    area: known(area, src),
    carAccess: known("inside" as const, page("faq/")),
    layout: known("plot" as const, precaution),
    power: known(true, src),
    pets: known(true, src),
  });

  return {
    id: 25,
    name: "おいしいキャンプ場",
    // 交通案内(Google マップ)のページの地図の座標
    location: known(
      { lat: 35.404275580259906, lng: 138.6062046152513 },
      googleMap,
    ),
    prefecture: known("山梨県", googleMap),
    ...calculatedFacts(25),
    // 「夜10時以降はおやすみタイム」とあり、終わりの時刻は書かれていない
    quietHours: known({ start: "22:00" }, precaution),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "同日に複数サイトを予約するときは 3 サイト・3 家族まで。複数サイトの予約は電話で受け付ける。団体・貸し切りは問い合わせ",
      },
      page("price/reserve/"),
    ),
    // 利用の注意に「ほとんどのサイトがウッドチップ敷き、または草地」。ウッドチップと
    // 全天候型のウッドデッキ・コンクリート敷きの BBQ スペースは「その他」にした。
    // 予約サイトは「土」だが、公式を採る
    groundTypes: known(["芝", "その他"], precaution),
    // 男性用・女性用トイレに「ウォシュレットが付いています」
    toiletFeatures: known(["温水洗浄便座"], utility),
    // 場内マップの区画番号の合計(全天候ウッドデッキサイト WD-7〜12 の 6 + L 3 + W 2 +
    // M 26 + S 2 + ソロ A-33 の 1)。常設テント付きの全天候ウッドデッキサイト
    // (富士山側、WD-1〜6)は設営済みテントのため含まない
    totalSites: known(40, map),
    // 有料のシャワー室。風呂の案内はない
    bathing: known("shower", utility),
    rental: known(true, page("price/rental/")),
    // 公式に日帰りの案内はないが、予約サイトの利用タイプに日帰り・デイキャンプがある
    dayCamp: known(true, nap),
    // 常設テント付きの全天候ウッドデッキサイト(富士山側)は入れない
    siteTypes: [
      {
        name: "全天候ウッドデッキサイト",
        area: known(
          sqm(
            6,
            5,
            "公式の表記はウッドデッキ6m×5m。別に前にコンクリート敷きの BBQ スペース6m×5mがある",
          ),
          allweather,
        ),
        // 「駐車場はサイト脇屋外の指定場所にお願いします」
        carAccess: known("front", allweather),
        // WD-7〜12 の番号付きで、サイト間にパーテーションがある
        layout: known("plot", map),
        power: known(true, allweather),
        pets: known(false, allweather),
      },
      // 電源付き 1 区画・電源なし 2 区画
      auto("オートキャンプサイトL", sqm(20, 10), autoL),
      auto("オートキャンプサイトW", sqm(15, 8), autoW),
      auto("オートキャンプサイトM", sqm(8, 8), autoM),
      // サイト紹介の一覧には「駐車場別途有」とあるが、S サイトのページの
      // 「駐車はサイト内にお願いします」を採る
      auto("オートキャンプサイトS", sqm(7, 7), autoS),
      {
        name: "ソロキャンプサイト",
        area: known(sqm(3, 3, "公式の表記は3m×3m目安(定員 1 名)"), solo),
        // 「サイト内へバイクなどの乗り入れは出来ませんが、設営・撤収時は入口近くまで
        // 乗り入れ可能」。駐車は指定場所
        carAccess: known("none", solo),
        // 説明文に「1～2人用までのテントを張ることができるフリーサイト」とある
        layout: known("free", solo),
        power: known(false, solo),
        pets: known(false, solo),
      },
    ],
  } satisfies Campsite;
})();
