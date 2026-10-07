import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// 長瀞キャンプヴィレッジ
export default (() => {
  const checkedOn = "2026-10-07";
  const autocamp: Source = {
    kind: "official",
    url: "https://www.nagatoro-campvillage.com/autocamp/",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://www.nagatoro-campvillage.com/access/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/saitama/11008",
    checkedOn,
  };
  // 広さは「約 縦×横 m ※サイトによって前後します」から求めた。
  // 全サイトが区画(「全て区画サイトですが、サイトの場所は指定しておりません」)、
  // 電源付きのサイトはない(「電源付きサイトはございません」)、ペット可。
  // 車は 1 サイト 1 台までで、2 台目からは別の駐車場
  const site = (name: string, size: [number, number]) => ({
    name,
    area: known(
      {
        min: size[0] * size[1],
        max: size[0] * size[1],
        note: `公式の表記は約${size[0]}×約${size[1]}m。サイトによって前後する`,
      },
      autocamp,
    ),
    carAccess: known("inside" as const, autocamp),
    layout: known("plot" as const, autocamp),
    power: known(false, autocamp),
    pets: known(true, autocamp),
  });

  return {
    id: 8,
    name: "長瀞キャンプヴィレッジ",
    location: known({ lat: 36.127513, lng: 139.121129 }, access),
    prefecture: known("埼玉県", access),
    ...calculatedFacts(8),
    // 「22時以降サイレントタイム」とだけあり、終わりの時刻が書かれていない
    quietHours: known({ start: "22:00" }, autocamp),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 サイト 5 名まで。グループは子ども連れの 3 家族・3 サイト・15 名まで。大人だけは 6 名まで",
      },
      autocamp,
    ),
    groundTypes: known(["土", "砂"], nap),
    // 予約サイトの場内設備に温水洗浄便座の記載がない
    toiletFeatures: notStated(nap),
    // 公式の表記は「約80サイト」
    totalSites: known(80, autocamp),
    // 宿泊者は温泉大浴場を無料で使える
    bathing: known("bath", {
      kind: "official",
      url: "https://www.nagatoro-campvillage.com/hotspring/",
      checkedOn,
    }),
    // テント・タープなどの大物はないが、調理器具・ランタン・焚火台などを借りられる
    rental: known(true, {
      kind: "official",
      url: "https://www.nagatoro-campvillage.com/charge/",
      checkedOn,
    }),
    dayCamp: known(true, {
      kind: "official",
      url: "https://www.nagatoro-campvillage.com/daycamp/",
      checkedOn,
    }),
    siteTypes: [
      site("オートサイト", [8, 10]),
      site("オートサイト ソロ", [4, 7]),
    ],
  } satisfies Campsite;
})();
