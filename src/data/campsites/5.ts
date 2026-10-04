import { distanceSource, known, travelSource, unknown } from "../facts";
import type { Campsite, Source } from "../types";

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
    prefecture: unknown,
    travelMinutes: known(95, travelSource(checkedOn)),
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
    distanceTo: {
      expressway: known(null, distanceSource(checkedOn)),
      nationalRoad: known(null, distanceSource(checkedOn)),
      railway: known(null, distanceSource(checkedOn)),
    },
    groundTypes: known(["土", "砂"], nap),
    toiletFeatures: known(["温水洗浄便座"], nap),
    totalSites: unknown,
    bathing: unknown,
    rental: unknown,
    staffedOvernight: unknown,
    dayCamp: unknown,
    siteTypes: [
      {
        name: "キャンプサイト(宿泊)",
        area: known(
          { min: 95, max: 95, note: "公式の表記は95㎡前後" },
          questions,
        ),
        carAccess: known("inside", questions),
        layout: unknown,
        power: unknown,
        pets: unknown,
      },
    ],
  } satisfies Campsite;
})();
