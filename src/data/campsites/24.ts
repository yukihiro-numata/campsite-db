import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// ほうれん坊の森キャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const top: Source = {
    kind: "official",
    url: "https://www.horenbo.com/",
    checkedOn,
  };
  const river: Source = {
    kind: "official",
    url: "https://www.horenbo.com/portfolio-item/autocamp-river/",
    checkedOn,
  };
  const wind: Source = {
    kind: "official",
    url: "https://www.horenbo.com/portfolio-item/autocamp-wind/",
    checkedOn,
  };
  const tent: Source = {
    kind: "official",
    url: "https://www.horenbo.com/portfolio-item/river-tent-site/",
    checkedOn,
  };
  const charge: Source = {
    kind: "official",
    url: "https://www.horenbo.com/charge/",
    checkedOn,
  };
  const guide: Source = {
    kind: "official",
    url: "https://www.horenbo.com/guide/",
    checkedOn,
  };
  const faq: Source = {
    kind: "official",
    url: "https://www.horenbo.com/faq/",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://www.horenbo.com/access/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/yamanashi/11356",
    checkedOn,
  };

  return {
    id: 24,
    name: "ほうれん坊の森キャンプ場",
    // アクセスページの地図の !2d/!3d は表示範囲の中心で、ピンから約 130m 離れているため、
    // 同じ地図の埋め込みページにあるピン(東部森林公園 ほうれんぼうの森キャンプ場)の座標を使う。
    // 予約サイトの座標ともほぼ同じ
    location: known({ lat: 35.7601472, lng: 138.9759575 }, access),
    prefecture: known("山梨県", access),
    ...calculatedFacts(24),
    // 「夜21:00以降はお静かに」とだけあり、終わりの時刻は書かれていない
    quietHours: known({ start: "21:00" }, guide),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "レギュラー・トップシーズンのグループキャンプは 2 サイト(棟)まで。ゾーンの全区画の貸し切りや 20 名以上などは問い合わせる。バリューシーズンの 3 グループ以上は事前に連絡する",
      },
      guide,
    ),
    // 公式に記載がないため予約サイトから。施設全体の表記だが、バンガロー・キャビンには
    // 地面の値がないため、テントサイトの地面と読む(芦ノ湖キャンプ村と同じ扱い)
    groundTypes: known(["土", "砂"], nap),
    // 公式はキャビンの「ウォシュレット付きトイレ」だけを書いている。予約サイトの
    // 場内共有設備に「屋外水洗トイレ（和式・洋式・ウォシュレット）」とある
    toiletFeatures: known(["温水洗浄便座"], nap),
    // テントを張るサイトの合計(川のオート 4 + 風のオート 4 + 川のテント 2 + 森のテント 2)。
    // トップページの区画数による。川のオートサイトのページは「風の７区画」と書くが、
    // 風のオートサイトのページと利用ガイドには No.5〜8 しかない
    totalSites: known(12, top),
    // 「浴槽はございません」。無料のシャワーが川のゾーン・森のゾーンにある
    bathing: known("shower", faq),
    rental: known(true, charge),
    // 公式に日帰りの案内がなく、予約サイトの利用タイプも「宿泊」だけ
    dayCamp: notStated(charge),
    // キャビン・バンガローと常設テントは入れない。電源はどのサイトにも書かれていない
    // (予約サイトの「AC電源」はバンガロー・キャビンのプランにだけ付いている)
    siteTypes: [
      {
        name: "川のオートサイト",
        area: known(
          {
            min: 70,
            max: 70,
            note: "公式の表記は 1〜4 番 約70㎡。サイトごとに形は異なる",
          },
          river,
        ),
        // 「オートサイトは車をサイト内に停めていただけます」
        carAccess: known("inside", river),
        layout: known("plot", river),
        power: notStated(river),
        // 「ペット 2頭まで」
        pets: known(true, river),
      },
      {
        name: "風のオートサイト",
        area: known(
          {
            min: 105,
            max: 144,
            note: "公式の表記は No.5 7〜9m×15m・No.6〜8 9m×16m。予約サイトは No.5 を台形の 8m～7m×15m と書いている",
          },
          wind,
        ),
        carAccess: known("inside", wind),
        // 区画の境に木や柵などの仕切りはない
        layout: known("plot", wind),
        power: notStated(wind),
        // 「ペット：3匹まで」
        pets: known(true, wind),
      },
      {
        name: "川・森のテントサイト",
        area: known({ min: 25, max: 25, note: "公式の表記は約25㎡" }, tent),
        // 「サイト内駐車不可」。駐車場はサイトから歩いて 5 分ほど
        carAccess: known("none", tent),
        layout: known("plot", tent),
        power: notStated(tent),
        // 「ペット 2頭まで」
        pets: known(true, tent),
      },
    ],
  } satisfies Campsite;
})();
