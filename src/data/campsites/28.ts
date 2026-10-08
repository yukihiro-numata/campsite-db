import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// オートキャンパーズエリア ならまた
export default (() => {
  const checkedOn = "2026-10-08";
  const top: Source = {
    kind: "official",
    url: "https://norn.co.jp/camp/",
    checkedOn,
  };
  const facility: Source = {
    kind: "official",
    url: "https://norn.co.jp/camp/facility/",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://norn.co.jp/camp/access/",
    checkedOn,
  };
  const faq: Source = {
    kind: "official",
    url: "https://norn.co.jp/camp/faq/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/gunma/10781",
    checkedOn,
  };
  const napPlan = (id: number): Source => ({
    kind: "booking",
    url: `https://www.nap-camp.com/gunma/10781/plans/${id}`,
    checkedOn,
  });

  // 「サイト内に駐車していただきます」。料金表もどのサイトも「車1台」などを含む
  const carInside = known("inside" as const, faq);

  return {
    id: 28,
    name: "オートキャンパーズエリア ならまた",
    // アクセスページの地図の !2d/!3d は表示範囲の中心で、ピンから約 200m 離れているため、
    // 同じ地図の埋め込みページにあるピン(オートキャンパーズエリアならまた)の座標を使う。
    // 予約サイトの座標とは約 100m の差
    location: known({ lat: 36.8861093, lng: 139.0900883 }, access),
    prefecture: known("群馬県", access),
    ...calculatedFacts(28),
    // 「夜21時から翌朝7時までは…お静かにお願いいたします。（22時消灯）」。FAQ も同じ
    quietHours: known({ start: "21:00", end: "07:00" }, facility),
    // 人数の上限などの制限は書かれておらず、ファミリー・スカウトサイトをグループ向けとして
    // 案内している
    groupPolicy: known(
      {
        allowed: "yes",
        note: "複数組で予約すると隣同士になるとは限らないため、できるだけファミリーサイト(4 家族)・スカウトサイト(6 家族)を使うよう案内している",
      },
      faq,
    ),
    // 「全サイト気持ちの良い芝生サイト」。予約サイトは「芝 / 土 / その他」だが、公式を採る
    groundTypes: known(["芝"], top),
    // 公式は「水洗トイレ」とだけ書いている。予約サイトの場内共有設備に、管理棟と
    // サニタリー棟のトイレとも「洋式は全てシャワートイレ」とある
    toiletFeatures: known(["温水洗浄便座"], nap),
    // 料金表のサイト数の合計(電源付 E 10 + 電源付 BIG 5 + 芝生 A 7 + B 11 + C 17 +
    // F 19 + ほたる BIG D 6 + 大空フリー芝生 G 35 + 電源付きペット 7 + BIG 芝生 7 +
    // ファミリー 9 + スカウト 1)。ソロキャンサイトはサイト数が書かれておらず入れない
    totalSites: known(134, facility),
    // 管理棟に男女別のコインシャワーだけ。風呂は近くの温泉施設を案内している
    bathing: known("shower", faq),
    rental: known(true, facility),
    // 料金表に「DAYキャンプ」(11 時〜16 時)がある
    dayCamp: known(true, facility),
    // トレーラーキャビンは入れない。区画かフリーかは公式の説明文に書かれておらず、
    // 予約サイトのプランの種別による。電源なし・ペット不可も予約サイトのプランによる
    // (公式 FAQ は「一部ご利用いただけないサイトがございます」とだけ書いている)
    siteTypes: [
      {
        name: "電源付サイト(E)",
        area: known(
          { min: 100, max: 100, note: "公式の表記は約100㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20000946)),
        // 「AC電源付」
        power: known(true, facility),
        pets: known(false, napPlan(20000946)),
      },
      // 予約サイトの説明では 4 サイト
      {
        name: "電源付BIGサイト",
        area: known(
          { min: 200, max: 200, note: "公式の表記は約200㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20002217)),
        power: known(true, facility),
        pets: known(false, napPlan(20002217)),
      },
      {
        name: "芝生サイト(A)",
        area: known(
          { min: 100, max: 100, note: "公式の表記は約100㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20000947)),
        power: known(false, napPlan(20000947)),
        // 「ペット連れでの利用も可能」
        pets: known(true, facility),
      },
      {
        name: "芝生サイト(B)",
        area: known(
          { min: 100, max: 100, note: "公式の表記は約100㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20000948)),
        power: known(false, napPlan(20000948)),
        pets: known(false, napPlan(20000948)),
      },
      {
        name: "芝生サイト(C)",
        area: known(
          { min: 100, max: 100, note: "公式の表記は約100㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20000949)),
        power: known(false, napPlan(20000949)),
        pets: known(false, napPlan(20000949)),
      },
      {
        name: "芝生サイト(F)",
        area: known(
          { min: 100, max: 100, note: "公式の表記は約100㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20000951)),
        power: known(false, napPlan(20000951)),
        pets: known(false, napPlan(20000951)),
      },
      {
        name: "ほたるBIGサイト(D)",
        area: known(
          { min: 200, max: 200, note: "公式の表記は約200㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20014916)),
        power: known(false, napPlan(20014916)),
        pets: known(false, napPlan(20014916)),
      },
      // 公式の説明文に区画かフリーかは書かれていない。予約サイトのプランの種別は
      // フリーサイトで、説明に「一部区画されています」とある
      {
        name: "大空フリー芝生サイト(G)",
        area: known(
          { min: 100, max: 100, note: "公式の表記は約100㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("free", napPlan(20000952)),
        power: known(false, napPlan(20000952)),
        pets: known(true, napPlan(20000952)),
      },
      {
        name: "電源付きペットサイト",
        area: known(
          { min: 100, max: 100, note: "公式の表記は約100㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20003828)),
        // 「電源付きのサイトでペット利用可能」
        power: known(true, facility),
        pets: known(true, facility),
      },
      // 予約サイトに同じ名前のプランがなく(BIG H サイトなどがどれに当たるか分からない)、
      // 区画かフリーか・電源・ペットは不明
      {
        name: "BIG芝生サイト",
        area: known(
          { min: 180, max: 180, note: "公式の表記は180㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: notStated(facility),
        power: notStated(facility),
        pets: notStated(facility),
      },
      {
        name: "ファミリーサイト",
        area: known(
          {
            min: 300,
            max: 400,
            note: "公式の表記は約300～400㎡。予約サイトは 250-400㎡",
          },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20002184)),
        power: known(false, napPlan(20002184)),
        pets: known(false, napPlan(20002184)),
      },
      {
        name: "スカウトサイト",
        area: known(
          { min: 500, max: 500, note: "公式の表記は約500㎡" },
          facility,
        ),
        carAccess: carInside,
        layout: known("plot", napPlan(20002218)),
        power: known(false, napPlan(20002218)),
        pets: known(false, napPlan(20002218)),
      },
      // お一人様専用。公式に広さがなく、予約サイトのソロ＆デュオプラン(種別はフリーサイト)の
      // 「約50㎡」による
      {
        name: "ソロキャンサイト",
        area: known(
          { min: 50, max: 50, note: "予約サイトの表記は約50㎡" },
          napPlan(20000992),
        ),
        carAccess: carInside,
        layout: known("free", napPlan(20000992)),
        power: known(false, napPlan(20000992)),
        pets: known(true, napPlan(20000992)),
      },
    ],
  } satisfies Campsite;
})();
