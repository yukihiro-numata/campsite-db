import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// The CLIFF CAMP & BBQ
export default (() => {
  const checkedOn = "2026-10-08";
  const top: Source = {
    kind: "official",
    url: "https://www.the-cliff.jp/",
    checkedOn,
  };
  const auto: Source = {
    kind: "official",
    url: "https://www.the-cliff.jp/camp/145?id=358896",
    checkedOn,
  };
  const free: Source = {
    kind: "official",
    url: "https://www.the-cliff.jp/camp/151?id=358897",
    checkedOn,
  };
  const solo: Source = {
    kind: "official",
    url: "https://www.the-cliff.jp/camp/154?id=358897",
    checkedOn,
  };
  const faq: Source = {
    kind: "official",
    url: "https://www.the-cliff.jp/faq",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/kanagawa/14007",
    checkedOn,
  };

  return {
    id: 16,
    name: "The CLIFF CAMP & BBQ",
    // トップページのアクセスの地図(The CLIFF CAMP&BBQ)の座標
    location: known({ lat: 35.19194616869935, lng: 139.60586348261265 }, top),
    prefecture: known("神奈川県", top),
    ...calculatedFacts(16),
    // 各サイトのページに「サイレントタイム / 22:00(消火)～翌朝7:00」
    quietHours: known({ start: "22:00", end: "07:00" }, auto),
    // 人数の上限はサイトごとの定員だけ。同じフィールド内なら複数の区画を一度に
    // 申し込める。トップページから団体予約(公園の団体プラン)に案内している
    groupPolicy: known(
      {
        allowed: "yes",
        note: "定員はサイトごと(オート 6 名、AT14 は 4 名、AT21 は 10 名、フリー 6 名、ソロ 1 名)。同じフィールド内なら複数の区画を一度に申し込める",
      },
      faq,
    ),
    // オートは砂利と草地、フリーは芝地、ソロは草地。草地は芝として扱う
    groundTypes: known(["砂利", "芝"], auto),
    // 公式はトイレの場所だけを書いている。予約サイトの「ウォッシュレット式トイレ」は
    // グランピングコテージなども含む施設全体の設備で、サイト側のトイレとは限らないため使わない
    toiletFeatures: notStated(faq),
    // テントを張るサイトの合計(オート 21 + フリー 40 + ソロ 5)。
    // RV サイト(テント設営不可)とコテージ・バンガロー・キャビンは含まない。
    // 予約サイトはオートを全 20 区画と書いているが、公式を採る
    totalSites: known(66, auto),
    // 場内マップの WC/オアシスにシャワーがある。公園の温浴施設はお知らせにだけ
    // 書かれていて、キャンプ場の設備としての案内はないため風呂にしない
    bathing: known("shower", {
      kind: "official",
      url: "https://www.the-cliff.jp/map/297",
      checkedOn,
    }),
    // テント・タープ・寝袋・コンロなどを借りられる
    rental: known(true, faq),
    // 日帰りキャンプのページにオート・フリー・ソロなどの料金と時間がある
    dayCamp: known(true, {
      kind: "official",
      url: "https://www.the-cliff.jp/camp/829?id=",
      checkedOn,
    }),
    // グランピングコテージ・サンセットバンガロー・トレーラーキャビンと、
    // テントを張れない RV サイトは入れない
    siteTypes: [
      {
        name: "オートサイト",
        area: known({ min: 90, max: 90, note: "公式の表記は約90㎡" }, auto),
        // 「サイト内 1 台」(AT21 は 2 台)
        carAccess: known("inside", auto),
        layout: known("plot", auto),
        // 「電源：100V×2/電源容量15A（1,500W）まで」
        power: known(true, auto),
        // AT1〜10、AT21 は犬だけ連れて泊まれる
        pets: known(true, auto),
      },
      {
        name: "フリーサイト",
        area: known(
          { min: 64, max: 64, note: "公式の表記は 1 サイトあたり約64㎡" },
          free,
        ),
        // 「テントサイトへの車両乗り入れはできません」。専用駐車場から 50〜200m
        carAccess: known("none", free),
        // 公式はサイト数と広さだけを書いていて、区画かどうかは書かれていない。
        // 予約サイトの「全40サイト分/区画分けなし」による
        layout: known("free", nap),
        // 付帯設備は「芝地」だけで、電源は書かれていない
        power: notStated(free),
        pets: known(false, free),
      },
      {
        name: "ソロサイト",
        area: known(
          { min: 40, max: 40, note: "公式の表記は約40㎡(幅8m×奥行5m)" },
          solo,
        ),
        // サイト内に停められるのはバイク・自転車だけで、車は公園の一般駐車場
        carAccess: known("none", solo),
        layout: known("plot", solo),
        // SS1・SS3・SS5 だけ電源あり
        power: known(true, solo),
        pets: known(true, solo),
      },
    ],
  } satisfies Campsite;
})();
