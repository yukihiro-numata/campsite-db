import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// THE FARM 農園のなかのキャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const campsite: Source = {
    kind: "official",
    url: "https://www.thefarm.jp/stay/campsite/",
    checkedOn,
  };
  const faq: Source = {
    kind: "official",
    url: "https://www.thefarm.jp/faq/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/chiba/13847",
    checkedOn,
  };

  return {
    id: 13,
    name: "THE FARM 農園のなかのキャンプ場",
    // 公式のアクセスページの地図の座標は表示範囲の中心で、地図のピン(THE FARM)から
    // 約 300m 離れているため、予約サイトの座標を使う。予約サイトの座標も
    // キャンプ場ではなく THE FARM 全体を指す
    location: known({ lat: 35.7947744, lng: 140.5154386 }, nap),
    prefecture: known("千葉県", campsite),
    ...calculatedFacts(13),
    // 「22時以降はテント内にてお休み下さい」とだけあり、終わりの時刻は書かれていない
    quietHours: known({ start: "22:00" }, campsite),
    // 1 区画 8 名まではキャンプ場のページ、団体の条件はよくある質問から
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 区画 8 名まで(3 歳未満を除く)。10 名以上かつ 5 棟(区画)以上は事前に電話で問い合わせる",
      },
      faq,
    ),
    // 公式に記載がない。予約サイトの表記は THE FARM 全体(グランピング・コテージを
    // 含む)のもので、キャンプ場の値とは限らないため使わない
    groundTypes: notStated(campsite),
    // 公式はトイレの場所だけを書いている。予約サイトの「ウォッシュレット式トイレ」は
    // THE FARM 全体の設備で、キャンプ場のトイレとは限らないため使わない
    toiletFeatures: notStated(campsite),
    // 予約サイトの「全8区画限定のキャンプサイト」による。公式は全体の区画数を
    // 書いておらず、よくある質問に 1〜7 番区画の広さがある
    totalSites: known(8, nap),
    // 場内の「おふろcafé かりんの湯」(露天風呂付きの天然温泉)に滞在中は入り放題
    bathing: known("bath", campsite),
    rental: known(true, campsite),
    // 公式のキャンプ場のページに日帰りの利用は書かれていない。予約サイトの
    // 「日帰り・デイキャンプ」は園内の日帰り BBQ 場を指している可能性があるため使わない
    dayCamp: notStated(campsite),
    // 設営済みテントの手ぶらプランは入れない
    siteTypes: [
      {
        name: "テント持ち込み 区画サイト",
        area: known(
          {
            min: 120,
            max: 120,
            note: "公式の表記は約120㎡(約9〜10m×12〜13m、区画により変わる)",
          },
          campsite,
        ),
        // 1 区画 1 台の駐車場があるが「横付け不可、区画まで約10m～40m」
        carAccess: known("none", campsite),
        layout: known("plot", campsite),
        // 「AC100V電源(2口)1000Wまで」
        power: known(true, campsite),
        pets: known(false, campsite),
      },
    ],
  } satisfies Campsite;
})();
