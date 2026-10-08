import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// 青野原 野呂ロッジキャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const tent: Source = {
    kind: "official",
    url: "https://norolodge.com/stay/tent/",
    checkedOn,
  };
  const rules: Source = {
    kind: "official",
    url: "https://norolodge.com/rules/",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://norolodge.com/access/",
    checkedOn,
  };
  const sanitary: Source = {
    kind: "official",
    url: "https://norolodge.com/facility/%e7%82%8a%e4%ba%8b%e5%a0%b4%e3%83%bb%e3%82%b7%e3%83%a3%e3%83%af%e3%83%bc%e3%83%bb%e3%81%8a%e6%89%8b%e6%b4%97%e3%81%84%e3%81%aa%e3%81%a9%e3%81%ae%e3%81%94%e6%a1%88%e5%86%85/",
    checkedOn,
  };
  // テントサイトのプラン(スタンダード料金日)の詳細
  const napPlan: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/kanagawa/14164/plans/20033628",
    checkedOn,
  };

  return {
    id: 19,
    name: "青野原 野呂ロッジキャンプ場",
    // 埋め込み地図の !2d/!3d は表示範囲の中心で、ピンから約 700m 離れているため、
    // 同じアクセスページの「マップで野呂ロッジを表示」のリンクにあるピンの座標を使う。
    // 予約サイトの座標ともほぼ同じ
    location: known({ lat: 35.569368, lng: 139.199427 }, access),
    prefecture: known("神奈川県", access),
    ...calculatedFacts(19),
    // 「夜22時から翌7時までサイレントタイム」
    quietHours: known({ start: "22:00", end: "07:00" }, rules),
    // 1 区画の人数と 1 泊の区画数はテントサイトのページ、グループの条件は同じページの予約の案内
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 区画 5 名・車 1 台まで。1 泊 2 区画まで。宿泊は 2 グループ(2 家族)まで。ほかのグループとの合流は不可",
      },
      tent,
    ),
    // 公式に記載がない。予約サイトのテントサイトのプランの地面は「砂,その他」
    // (施設全体の表記は「土 / 砂」だが、テントサイトの値ではないため使わない)
    groundTypes: known(["砂", "その他"], napPlan),
    // 公式は「温水便座付き洋式タイプ」とだけ書いていて、洗浄機能は書かれていない。
    // 予約サイトの「ウォッシュレット式トイレ」はバンガロー・トレーラーハウスを含む
    // 施設全体の設備で、テントサイトの値とは限らないため使わない
    toiletFeatures: notStated(sanitary),
    // 公式・予約サイトともテントサイトの区画数が書かれていない
    totalSites: notStated(tent),
    // コインシャワー(5分300円)だけ。温泉は周辺施設の案内
    bathing: known("shower", sanitary),
    rental: known(true, {
      kind: "official",
      url: "https://norolodge.com/facility/rental/",
      checkedOn,
    }),
    dayCamp: known(true, {
      kind: "official",
      url: "https://norolodge.com/daycamp/",
      checkedOn,
    }),
    // バンガロー・トレーラーハウスは入れない。ソロ・デュオキャンププランは同じ
    // テントサイトの区画を使う料金プランのため、別の種類にしない
    siteTypes: [
      {
        name: "テントサイト",
        area: known({ min: 48, max: 48, note: "公式の表記は約8x6m" }, tent),
        // 「サイトの中にお車・タープ・テントを収めてのご利用」
        carAccess: known("inside", tent),
        layout: known("plot", tent),
        // 公式に記載がない。予約サイトのプランの「AC電源 なし」による
        power: known(false, napPlan),
        // 公式の場内ルールはリードの装着だけを書いている。予約サイトのプランの
        // 「ペット同伴 可」による(バイクソロのプランだけ「不可」)
        pets: known(true, napPlan),
      },
    ],
  } satisfies Campsite;
})();
