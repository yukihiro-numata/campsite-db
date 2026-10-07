import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// PICA秩父
export default (() => {
  const checkedOn = "2026-10-07";
  const tentsite: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/chichibu/stay/site/tentsite_free.html",
    checkedOn,
  };
  const guidance: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/chichibu/about/guidance.html",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/chichibu/access.html",
    checkedOn,
  };

  return {
    id: 10,
    name: "PICA秩父",
    // 地図の座標はフロントのあたりを指す。テントサイトはフロントから約 600m 離れた
    // ミューズパーク内の芝生広場にある
    location: known({ lat: 35.98772, lng: 139.045995 }, access),
    prefecture: known("埼玉県", access),
    ...calculatedFacts(10),
    // 「夜10時以降、お静かに」とだけあり、終わりの時刻は書かれていない
    quietHours: notStated(guidance),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 回(1 泊)の利用が 6 棟(区画)を超えるグループは団体利用として扱い、問い合わせで受け付ける",
      },
      {
        kind: "official",
        url: "https://www.pica-resort.jp/chichibu/stay/group.html",
        checkedOn,
      },
    ),
    // 予約サイトに掲載がないため公式から。テントサイトは「芝生広場」を使う
    groundTypes: known(["芝"], tentsite),
    // 公式はトイレがあるとだけ書いていて、予約サイトに掲載はない
    toiletFeatures: notStated(tentsite),
    // テントサイトの数。コテージは含めない
    totalSites: known(15, tentsite),
    // 場内の日帰り入浴施設「樹音の湯」(大浴場・サウナ)
    bathing: known("bath", {
      kind: "official",
      url: "https://www.pica-resort.jp/chichibu/about/spa.html",
      checkedOn,
    }),
    rental: known(true, tentsite),
    // 日帰り BBQ サイトに「食材なし場所のみ利用」のデイキャンプ料金がある
    dayCamp: known(true, {
      kind: "official",
      url: "https://www.pica-resort.jp/chichibu/stay/site/day_bbq.html",
      checkedOn,
    }),
    siteTypes: [
      {
        name: "PARK&CAMPサイト(電源無しフリーサイト)",
        area: known({ min: 80, max: 80, note: "公式の表記は約80㎡" }, tentsite),
        // エリア内の専用パーキングに停めて荷物を運ぶ
        carAccess: known("none", tentsite),
        layout: known("free", tentsite),
        power: known(false, tentsite),
        pets: known(true, tentsite),
      },
    ],
  } satisfies Campsite;
})();
