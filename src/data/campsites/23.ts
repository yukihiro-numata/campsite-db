import { calculatedFacts, known } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// 清里中央オートキャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const top: Source = {
    kind: "official",
    url: "https://autocamp.co.jp/",
    checkedOn,
  };
  const stay: Source = {
    kind: "official",
    url: "https://autocamp.co.jp/stay",
    checkedOn,
  };
  const features: Source = {
    kind: "official",
    url: "https://autocamp.co.jp/features",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://autocamp.co.jp/access",
    checkedOn,
  };
  const napPlan = (id: number): Source => ({
    kind: "booking",
    url: `https://www.nap-camp.com/yamanashi/11340/plans/${id}`,
    checkedOn,
  });

  return {
    id: 23,
    name: "清里中央オートキャンプ場",
    // アクセスページの地図の !2d/!3d は表示範囲の中心(トップページの地図とは経度が違う)のため、
    // 同じ地図の埋め込みページにあるピンの座標を使う。予約サイトの座標との差は約 60m
    location: known({ lat: 35.898926, lng: 138.449011 }, access),
    prefecture: known("山梨県", access),
    ...calculatedFacts(23),
    // 「22時から朝7時までは静かな環境作りをお願い致します」
    quietHours: known({ start: "22:00", end: "07:00" }, features),
    // 予約ページの「グループでのご利用について」から
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "グループは 2 家族・2 サイトまで。3 グループ以上は過去の利用実績から問題ないと判断した場合だけで、予約前に電話で相談する",
      },
      {
        kind: "official",
        url: "https://autocamp.co.jp/reserve",
        checkedOn,
      },
    ),
    // 公式に記載がない。予約サイトのテントサイトの 3 プランとも地面は「土,砂,その他」
    groundTypes: known(["土", "砂", "その他"], napPlan(20025270)),
    // 水洗トイレは男女とも「ウォシュレット、便座ヒーター付き」
    toiletFeatures: known(["温水洗浄便座"], features),
    // 「オートキャンプ 100サイト」。予約サイトの料金情報は電源なし 46 + 電源なし(大)3 +
    // 電源付き 36 = 85 サイトだが、公式を採る。ログケビン・トレーラーハウス・手ぶらキャンプは含まない
    totalSites: known(100, stay),
    // コインシャワー(男女各 4 室)だけ。温泉は周辺施設の案内
    bathing: known("shower", features),
    rental: known(true, {
      kind: "official",
      url: "https://autocamp.co.jp/rental",
      checkedOn,
    }),
    // 「デイキャンプ ご利用時間 AM10:00～17:00」
    dayCamp: known(true, stay),
    // ログケビン・トレーラーハウス・手ぶらキャンプ(設営済みのドームテント)は入れない。
    // バイク・自転車・徒歩プランは電源なしサイトを使う料金プランのため、別の種類にしない。
    // 車は区画内に停める(「お車は必ずサイト内に駐車してください」)。区画はロープで区切られている。
    // ペットはトップページの「全オートサイトで…ペット可」による
    siteTypes: [
      {
        name: "電源付きサイト",
        area: known(
          {
            min: 64,
            max: 64,
            note: "公式の表記は約8m×8m(駐車スペース込み)。サイトによって多少の差がある",
          },
          stay,
        ),
        carAccess: known("inside", features),
        layout: known("plot", features),
        // 「1500ｗ、15Ａ/1サイト」
        power: known(true, stay),
        pets: known(true, top),
      },
      {
        name: "電源なしサイト",
        area: known(
          {
            min: 64,
            max: 64,
            note: "公式の表記は約8m×8m(駐車スペース込み)。サイトによって多少の差がある",
          },
          stay,
        ),
        carAccess: known("inside", features),
        layout: known("plot", features),
        // サイト・料金ページが「電源なしサイト」と書いている。トップページの
        // 「全オートサイトでAC電源」より、サイト・料金ページを採る
        power: known(false, stay),
        pets: known(true, top),
      },
      // 通常サイトの 2 区画分ほどの広さで、3 区画
      {
        name: "電源なしサイト(大)",
        area: known(
          {
            min: 128,
            max: 128,
            note: "公式の表記は約8m×16m(駐車スペース込み)。サイトによって多少の差がある",
          },
          stay,
        ),
        carAccess: known("inside", features),
        layout: known("plot", features),
        power: known(false, stay),
        pets: known(true, top),
      },
    ],
  } satisfies Campsite;
})();
