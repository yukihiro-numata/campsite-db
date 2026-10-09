import { calculatedFacts, known } from "../facts.ts";
import type { Area, Campsite, Source } from "../types.ts";

// ウッドルーフ奥秩父オートキャンプ場
export default (() => {
  const checkedOn = "2026-10-07";
  const sisetu: Source = {
    kind: "official",
    url: "https://www.woodroof.jp/sisetu/",
    checkedOn,
  };
  const fee: Source = {
    kind: "official",
    url: "https://www.woodroof.jp/fee/",
    checkedOn,
  };
  const annai: Source = {
    kind: "official",
    url: "https://www.woodroof.jp/annai/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/saitama/11028",
    checkedOn,
  };
  const napSites: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/saitama/11028/topics_dtl?campsite_topics_id=21743",
    note: "公式に記載がないため、予約サイトにキャンプ場が載せている案内の「おおよそ 縦×横 m」から計算",
    checkedOn,
  };
  // 全サイトが区画で、車を横付けできる(「すべてのサイトで車を横付けできます」)。
  // どのサイトの種類にも AC 電源付きの区画がある。ペットは入場できない
  const site = (name: string, area: Area) => ({
    name,
    area: known(area, napSites),
    carAccess: known("inside" as const, sisetu),
    layout: known("plot" as const, sisetu),
    power: known(true, sisetu),
    pets: known(false, annai),
  });

  return {
    id: 6,
    name: "ウッドルーフ奥秩父オートキャンプ場",
    location: known(
      { lat: 35.944867, lng: 138.9255093 },
      {
        kind: "official",
        url: "https://www.woodroof.jp/access/",
        checkedOn,
      },
    ),
    prefecture: known("埼玉県", {
      kind: "official",
      url: "https://www.woodroof.jp/",
      checkedOn,
    }),
    ...calculatedFacts(6),
    // 「夜9時以降は静かに」とあるが、終わりの時刻は書かれていない
    quietHours: known({ start: "21:00" }, annai),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 区画 1 家族まで。週末などは大人のみのグループと 3 区画以上を断り、2 区画は合計 8 名まで。学生グループは不可",
      },
      annai,
    ),
    groundTypes: known(["芝", "砂", "その他"], nap),
    // 多目的トイレに「ウォシュレット付」とある
    toiletFeatures: known(["温水洗浄便座"], sisetu),
    // テントを張るサイトの合計(オート 16 + 林間 8 + ウッドデッキ 11)。
    // バンガロー・アティックルームは含まない
    totalSites: known(35, sisetu),
    // シャワー・トイレ棟の有料のコインシャワー。風呂の案内はない
    bathing: known("shower", sisetu),
    rental: known(true, fee),
    dayCamp: known(true, fee),
    siteTypes: [
      site("オートキャンプサイト", {
        min: 64,
        max: 72,
        note: "予約サイトの表記はおおよそ8×8m(電源付きは8×9m)。駐車スペースを含む",
      }),
      site("林間サイト", {
        min: 72,
        max: 72,
        note: "予約サイトの表記はおおよそ8×9m。駐車スペースを含まない",
      }),
      site("ウッドデッキサイト", {
        min: 72,
        max: 72,
        note: "予約サイトの表記は8×9m(駐車スペースを含む)。別にウッドデッキ部分3×9m",
      }),
    ],
  } satisfies Campsite;
})();
