import { distanceSource, known, travelSource, unknown } from "../facts";
import type { Campsite, Source } from "../types";

// 成田ゆめ牧場ファミリーオートキャンプ場
export default (() => {
  const checkedOn = "2026-09-28";
  const camp: Source = {
    kind: "official",
    url: "https://www.yumebokujo.com/camp.html",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/chiba/11980",
    checkedOn,
  };
  const checkedOn2 = "2026-10-04";
  const camp2: Source = { ...camp, checkedOn: checkedOn2 };

  return {
    id: 4,
    name: "成田ゆめ牧場ファミリーオートキャンプ場",
    // 公式のアクセスページの地図は牧場の本体を指すため、なっぷの座標を使う
    location: known({ lat: 35.869383, lng: 140.39667 }, nap),
    prefecture: known("千葉県", {
      kind: "official",
      url: "https://www.yumebokujo.com/access.html",
      checkedOn: checkedOn2,
    }),
    travelMinutes: known(69, travelSource(checkedOn)),
    quietHours: known({ start: "22:00", end: "06:00" }, camp),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 サイトずつ各自で予約する。20 名以上は事前に相談",
      },
      camp,
    ),
    distanceTo: {
      expressway: known(572, distanceSource(checkedOn)),
      nationalRoad: known(null, distanceSource(checkedOn)),
      railway: known(null, distanceSource(checkedOn)),
    },
    groundTypes: known(["芝"], nap),
    toiletFeatures: known(["温水洗浄便座"], nap),
    totalSites: unknown,
    // 有料のコインシャワーで、湯船はない
    bathing: known("shower", camp2),
    rental: known(true, camp2),
    // 「夜間等、営業時間外はスタッフは不在」
    staffedOvernight: known(false, camp2),
    dayCamp: known(true, camp2),
    siteTypes: [
      {
        name: "一般サイト(D〜G)",
        area: unknown,
        carAccess: known("inside", camp),
        layout: known("free", camp2),
        // 電源が付くのは電源サイトだけ
        power: known(false, camp2),
        pets: known(true, camp2),
      },
      {
        name: "電源サイト(A〜C)",
        area: known(
          {
            min: 81,
            max: 81,
            note: "公式の表記は約9×9m。正方形でない区画もある",
          },
          camp,
        ),
        carAccess: known("inside", camp),
        layout: known("plot", camp2),
        power: known(true, camp2),
        pets: known(true, camp2),
      },
    ],
  } satisfies Campsite;
})();
