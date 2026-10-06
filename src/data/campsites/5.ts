import { calculatedFacts, known, unchecked } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// ウェルキャンプ西丹沢
export default (() => {
  const checkedOn = "2026-09-28";
  const questions: Source = {
    kind: "official",
    url: "https://well-camp.com/questions/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/kanagawa/11677",
    checkedOn,
  };
  const checkedOn2 = "2026-10-04";
  const questions2: Source = { ...questions, checkedOn: checkedOn2 };
  const price: Source = {
    kind: "official",
    url: "https://well-camp.com/price/",
    checkedOn: checkedOn2,
  };

  return {
    id: 5,
    name: "ウェルキャンプ西丹沢",
    location: known(
      { lat: 35.47223, lng: 139.061948 },
      {
        kind: "official",
        url: "https://well-camp.com/access/",
        checkedOn,
      },
    ),
    prefecture: known("神奈川県", {
      kind: "official",
      url: "https://well-camp.com/",
      checkedOn: checkedOn2,
    }),
    ...calculatedFacts(5),
    quietHours: known(
      { start: "22:00", end: "06:00" },
      {
        kind: "official",
        url: "https://well-camp.com/promise/promise2/",
        checkedOn,
      },
    ),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 サイト 5 名まで。Web 予約は 1 日程 5 サイトまでで、6 サイト以上は電話",
      },
      {
        kind: "official",
        url: "https://well-camp.com/promise/terms/",
        checkedOn,
      },
    ),
    groundTypes: known(["土", "砂"], nap),
    toiletFeatures: known(["温水洗浄便座"], nap),
    totalSites: unchecked,
    bathing: known("bath", {
      kind: "official",
      url: "https://well-camp.com/facility/bath/",
      checkedOn: checkedOn2,
    }),
    rental: known(true, {
      kind: "official",
      url: "https://well-camp.com/facility/rental/",
      checkedOn: checkedOn2,
    }),
    dayCamp: known(true, price),
    siteTypes: [
      {
        name: "キャンプサイト(宿泊)",
        area: known(
          { min: 95, max: 95, note: "公式の表記は95㎡前後" },
          questions,
        ),
        carAccess: known("inside", questions),
        layout: known("plot", questions2),
        // 電源付きと電源なしの区画がある
        power: known(true, price),
        // コテージ以外はペットと入れる
        pets: known(true, questions2),
      },
    ],
  } satisfies Campsite;
})();
