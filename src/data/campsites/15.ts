import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// 勝浦つるんつるん温泉直営オートキャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const camp: Source = {
    kind: "official",
    url: "http://katuuraonsen.com/camp/camp.html",
    checkedOn,
  };
  const faq: Source = {
    kind: "official",
    url: "http://katuuraonsen.com/faq/faq.html",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/chiba/11976",
    checkedOn,
  };

  return {
    id: 15,
    name: "勝浦つるんつるん温泉直営オートキャンプ場",
    // 公式のアクセスページに地図がないため、予約サイトの座標を使う
    location: known({ lat: 35.2037625, lng: 140.280768 }, nap),
    prefecture: known("千葉県", {
      kind: "official",
      url: "http://katuuraonsen.com/index.html",
      checkedOn,
    }),
    ...calculatedFacts(15),
    // 打ち上げ花火の時刻(PM 8時30分まで)はあるが、静かにする時刻は書かれていない
    quietHours: notStated(camp),
    // グループや人数の制限は書かれていない(料金は人数ではなくサイト単位)。
    // GroupPolicy の区切りでは、制限が書かれていなければ yes
    groupPolicy: known({ allowed: "yes" }, camp),
    // 公式の表記は「芝・草地」。草地は芝として扱う(オートキャンプ・フルーツ村と同じ)
    groundTypes: known(["芝"], camp),
    // 公式は「水洗トイレ」とだけ書いていて、予約サイトの場内設備にも
    // 温水洗浄便座の記載がない
    toiletFeatures: notStated(camp),
    // サイトの数は書かれていない
    totalSites: notStated(camp),
    // 「温泉: 勝浦温泉(場内)」(有料)。ほかに無料の温水シャワーがある
    bathing: known("bath", camp),
    // バーベキューセット・調理用品などを借りられる
    rental: known(true, camp),
    // 公式に日帰りの案内はないが、予約サイトの利用タイプに日帰り・デイキャンプがある
    dayCamp: known(true, nap),
    // ログキャビン・ロッジは入れない
    siteTypes: [
      {
        name: "テントサイト",
        area: known(
          {
            min: 49,
            max: 49,
            note: "公式の表記は「7m×7m位」。よくある質問では「約7m × 7m」",
          },
          camp,
        ),
        // よくある質問の「車で入れますか？」に「入れます」
        carAccess: known("inside", faq),
        // 「区画は約7mx7mです」
        layout: known("plot", camp),
        // 料金に「AC電源付6,000円」がある
        power: known(true, camp),
        pets: known(true, camp),
      },
    ],
  } satisfies Campsite;
})();
