import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// 橘ふれあい公園キャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const camp: Source = {
    kind: "official",
    url: "https://www.tachibana-park.jp/facility-guide/camp/",
    checkedOn,
  };
  const about: Source = {
    kind: "official",
    url: "https://www.tachibana-park.jp/about/",
    checkedOn,
  };
  const faq: Source = {
    kind: "official",
    url: "https://www.tachibana-park.jp/faq/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/chiba/15060",
    checkedOn,
  };
  // 全サイトが区画(料金表に区画数がある)。ペットは公式のキャンプのページに書かれて
  // いないため予約サイトから。どのサイトの種類にも「ペット同伴が可能なサイトもあります」とある
  const site = (
    name: string,
    sqm: number,
    carAccess: "front" | "none",
    power: boolean,
  ) => ({
    name,
    area: known({ min: sqm, max: sqm, note: `公式の表記は約${sqm}㎡` }, camp),
    carAccess: known(carAccess, camp),
    layout: known("plot" as const, camp),
    power: known(power, camp),
    pets: known(true, nap),
  });

  return {
    id: 14,
    name: "橘ふれあい公園キャンプ場",
    // トップページの地図の座標。公園の住所を指す
    location: known(
      { lat: 35.8101401, lng: 140.587747 },
      {
        kind: "official",
        url: "https://www.tachibana-park.jp/",
        checkedOn,
      },
    ),
    prefecture: known("千葉県", camp),
    ...calculatedFacts(14),
    // 「消灯時間は」「22時です。…お静かにお過ごしください」とだけあり、終わりの時刻は書かれていない
    quietHours: known({ start: "22:00" }, faq),
    // 人数の上限は区画ごとにだけ書かれている。予約サイトは広々サイトを「大勢で楽しみたい」方向けと案内
    groupPolicy: known(
      {
        allowed: "yes",
        note: "1 区画 6 名まで。広々サイトは 10 名まで",
      },
      camp,
    ),
    groundTypes: known(["土"], nap),
    // 予約サイトの場内設備に「ウォッシュレット式トイレ」とある
    toiletFeatures: known(["温水洗浄便座"], nap),
    // キャンプサイト 32 + 広々 5 + オートキャンプサイト 20
    totalSites: known(57, camp),
    // 園内の体験学習施設に予約制のシャワールームがある。風呂の案内はない
    bathing: known("shower", about),
    // 「レンタル品はございません」。BBQ 場の貸し出しはキャンプ場とは別
    rental: known(false, faq),
    // キャンプ場の日帰り利用の案内はない(BBQ 場は別の施設)
    dayCamp: notStated(camp),
    siteTypes: [
      // サイト MAP では車は専用駐車場に停め、区画のあいだの通路は全車両進入禁止
      site("キャンプサイト", 100, "none", false),
      site("キャンプサイト 広々", 160, "none", false),
      // サイト MAP では区画の脇に駐車スペースがある。予約サイトも「車の横づけが可能」
      site("オートキャンプサイト", 100, "front", true),
    ],
  } satisfies Campsite;
})();
