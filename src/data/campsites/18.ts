import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// 芦ノ湖キャンプ村
export default (() => {
  const checkedOn = "2026-10-08";
  const autocamp: Source = {
    kind: "official",
    url: "https://campmura.com/stay/autocamp/",
    checkedOn,
  };
  const campsite: Source = {
    kind: "official",
    url: "https://campmura.com/stay/campsite/",
    checkedOn,
  };
  const price: Source = {
    kind: "official",
    url: "https://campmura.com/price/",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://campmura.com/access/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/kanagawa/11664",
    checkedOn,
  };

  return {
    id: 18,
    name: "芦ノ湖キャンプ村",
    // アクセスページの 1 つ目の地図(ピンは「Fun Space芦ノ湖キャンプ村 レイクサイドヴィラ」)の座標
    location: known({ lat: 35.2394175, lng: 138.9889389 }, access),
    prefecture: known("神奈川県", access),
    ...calculatedFacts(18),
    // 「21:00以降は他のお客様のご迷惑とならないようお静かにお過ごしください」とだけあり、
    // 終わりの時刻は書かれていない
    quietHours: known({ start: "21:00" }, campsite),
    // オート・テントサイトのページの「ご予約方法」から
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "団体(4 区画以上)で利用したいときは別途相談する",
      },
      campsite,
    ),
    // 公式にサイトの地面の記載がない。予約サイトの「サイトの地面:土 / 砂」による
    groundTypes: known(["土", "砂"], nap),
    // 公式はトイレについて書いていない。予約サイトの「ウォッシュレット式トイレ」は
    // 浴室付きのケビン棟を含む施設全体の設備で、サイトの利用者が使うトイレとは
    // 限らないため使わない
    toiletFeatures: notStated(campsite),
    // オートキャンプサイト 25 + テントキャンプサイト 20。ケビン棟は含まない
    totalSites: known(45, autocamp),
    // 共同浴場(温泉ではない、不定期営業、有料)
    bathing: known("bath", {
      kind: "official",
      url: "https://campmura.com/enjoy/shared_facilities/",
      checkedOn,
    }),
    // 調理用品・寝具などを借りられる。テントなどキャンプ用品の貸し出しはない
    rental: known(true, {
      kind: "official",
      url: "https://campmura.com/price/rental/",
      checkedOn,
    }),
    // 料金ページのオート・テントキャンプサイトに「日帰り利用料金について(11:00~17:00)」がある
    dayCamp: known(true, price),
    // ケビン棟(独立・連立)は入れない
    siteTypes: [
      {
        name: "オートキャンプサイト",
        area: known(
          {
            min: 56,
            max: 56,
            note: "公式の表記は約7m×8m(区画内に車 1 台を停める)",
          },
          autocamp,
        ),
        // 「区画内にお車(1台)も停めていただきます」
        carAccess: known("inside", {
          kind: "official",
          url: "https://campmura.com/qa/",
          checkedOn,
        }),
        layout: known("plot", autocamp),
        // 「25区画(うち電源付4区画)」
        power: known(true, autocamp),
        pets: known(false, autocamp),
      },
      {
        name: "テントキャンプサイト",
        area: known(
          {
            min: 25,
            max: 25,
            note: "サイト紹介とよくある質問の表記は約5m×5m。料金ページは約4.5m×4.5m",
          },
          campsite,
        ),
        // 料金ページに「テントサイトへの車の乗り入れはできません」。よくある質問では
        // 駐車場からテントサイトエリアまで約250m
        carAccess: known("none", price),
        layout: known("plot", campsite),
        // 設備は共同炊事場だけが書かれていて、電源の有無は書かれていない
        power: notStated(campsite),
        pets: known(false, campsite),
      },
    ],
  } satisfies Campsite;
})();
