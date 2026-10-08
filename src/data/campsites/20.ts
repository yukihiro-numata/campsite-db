import { calculatedFacts, known } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// スターフォレストキャンプ葉山
export default (() => {
  const checkedOn = "2026-10-08";
  const top: Source = {
    kind: "official",
    url: "https://www.hayama-rvsite.info/",
    checkedOn,
  };
  const tent: Source = {
    kind: "official",
    url: "https://www.hayama-rvsite.info/tent-site",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/kanagawa/14771",
    checkedOn,
  };
  const napPlan = (id: number): Source => ({
    kind: "booking",
    url: `https://www.nap-camp.com/kanagawa/14771/plans/${id}`,
    checkedOn,
  });

  return {
    id: 20,
    name: "スターフォレストキャンプ葉山",
    // トップページの地図のピンの座標。予約サイトの座標も同じ
    location: known({ lat: 35.2664512, lng: 139.6027842 }, top),
    prefecture: known("神奈川県", top),
    ...calculatedFacts(20),
    // 「午後10時には就寝を心がけてください」とだけあり、終わりの時刻は書かれていない
    quietHours: known({ start: "22:00" }, tent),
    // 予約サイトは「団体・貸切OK」だが、公式を採る
    groupPolicy: known(
      {
        allowed: "no",
        note: "グループキャンプは受け付けていない(グループで申し込むときは電話で相談する)。テントサイトは 1 張り 5 名まで",
      },
      tent,
    ),
    // 公式のテントサイトの地面はウッドデッキ・ウッドチップで、「その他」にした。
    // ウッドフェンスサイトの地面は公式に書かれていない。予約サイトは「芝 / 土 / その他」
    // だが、公式を採る
    groundTypes: known(["その他"], tent),
    // 「屋内の男女別ウォシュレット付き トイレ」
    toiletFeatures: known(["温水洗浄便座"], top),
    // テントサイトの区画数の合計(ウッドデッキ 1 + ウッドチップ 3 + ウッドフェンス 2 +
    // 森林デッキ 3)。車中泊用の RV サイトは入れない
    totalSites: known(9, tent),
    // 無料の温水シャワーだけ。貸切サウナはあるが、風呂の案内はない
    bathing: known("shower", top),
    // 「レンタルでのAC電源は￥550です」。予約サイトにはチェア・テーブル・焚火台のレンタルもある
    rental: known(true, tent),
    // 「デイキャンププランのご用意がございません。1泊プランでお申し込みください」とあり、
    // 森林デッキは「デイキャンプなど、日中利用にもどうぞ」と案内している
    dayCamp: known(true, tent),
    // 手ぶらキャンププラン(設営済み)と、車中泊用の RV サイトは入れない。RV サイトは
    // 公式がテントについて書いておらず、広さもデッキ部分(約 11〜16㎡)しか分からない
    siteTypes: [
      // 車は「テントサイト内へ乗り入れ不可」で、駐車場から階段を下りる(予約サイト)。
      // 電源は公式の「レンタルでのAC電源は￥550」がどのサイトのことか書かれていないため、
      // 予約サイトの「AC電源あり ※有料(貸出)」による
      {
        name: "ウッドデッキサイト",
        area: known(
          { min: 79.2, max: 79.2, note: "公式の表記は約7.2×11m" },
          tent,
        ),
        carAccess: known("none", nap),
        layout: known("plot", tent),
        power: known(true, napPlan(20017469)),
        // 「ペットはリードを着用してください」
        pets: known(true, tent),
      },
      {
        name: "ウッドチップサイト",
        area: known(
          { min: 60, max: 72, note: "公式の表記は9×8m・10×6m(指定不可)" },
          tent,
        ),
        carAccess: known("none", nap),
        layout: known("plot", tent),
        power: known(true, napPlan(20017470)),
        pets: known(true, tent),
      },
      // ドッグランを兼ねる、リード無しで犬と泊まれるサイト。電源は「AC電源常設」
      {
        name: "ウッドフェンスサイト",
        area: known(
          {
            min: 100,
            max: 100,
            note: "公式の表記は約10×10m。ドッグランのページでは約10m×9〜10m",
          },
          tent,
        ),
        carAccess: known("none", nap),
        layout: known("plot", tent),
        power: known(true, tent),
        pets: known(true, tent),
      },
      // 裏山のデッキ。第 2 駐車場から階段を上がる(予約サイト)。電源は「AC電源(常設)」。
      // ペットは公式に書かれておらず、予約サイトの「ペット不可」による
      {
        name: "森林デッキサイト",
        area: known(
          {
            min: 20,
            max: 25,
            note: "公式の表記は A 約4×5m・B 約5×5m・C 約6×4m。変形のデッキでサイズは目安",
          },
          tent,
        ),
        carAccess: known("none", nap),
        layout: known("plot", tent),
        power: known(true, tent),
        pets: known(false, napPlan(20017472)),
      },
    ],
  } satisfies Campsite;
})();
