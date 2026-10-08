import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Area, Campsite, CarAccess, Fact, Source } from "../types.ts";

// トントゥなんもく村キャンプ場(旧名 なんもく村自然公園キャンプ場)
export default (() => {
  const checkedOn = "2026-10-08";
  const page = (path: string): Source => ({
    kind: "official",
    url: `https://kashi-kiri.jp/nanmoku-camp/${path}`,
    checkedOn,
  });
  const home = page("home");
  const tent = page("facilities/tentsite");
  const faq = page("faq");
  const terms = page("terms");
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/gunma/10729",
    checkedOn,
  };
  const area = (min: number, max: number): Area => ({
    min,
    max,
    note:
      min === max
        ? `公式の表記は${min}㎡程度`
        : `公式の表記は${min}〜${max}㎡程度`,
  });
  // 電源は公式のテントサイトのページに書かれていない。
  // ペットは利用ルールに「ペットの同伴は可能です」(屋外ではリードを付ける)
  const site = (
    name: string,
    a: Area,
    carAccess: Fact<CarAccess>,
    layoutSource: Source,
  ) => ({
    name,
    area: known(a, tent),
    carAccess,
    layout: known("plot" as const, layoutSource),
    power: notStated(tent),
    pets: known(true, terms),
  });

  return {
    id: 29,
    name: "トントゥなんもく村キャンプ場",
    // 公式のアクセスの欄は住所だけで地図がないため、予約サイトの座標を使う
    location: known({ lat: 36.1514818, lng: 138.601416 }, nap),
    prefecture: known("群馬県", home),
    ...calculatedFacts(29),
    // 「22時以降は森の音を楽しむ時間となります。お静かにお過ごしください」とあり、
    // 終わりの時刻は書かれていない
    quietHours: known({ start: "22:00" }, terms),
    // 人数などの制限は書かれておらず、広々サイトを大人数のグループ向けとして案内している
    groupPolicy: known(
      {
        allowed: "yes",
        note: "広々サイトは大人数のグループ向けの 1 区画限定の貸切サイト(最大 12 名)。トップページの紹介では最大 14 名",
      },
      tent,
    ),
    // 公式の地面は「芝 or 小砂利」「林間土(草 or 土)」「芝」「芝 or 土」。草は芝、
    // 小砂利は砂利として扱う。予約サイトは「芝 / 土」だが、公式を採る
    groundTypes: known(["芝", "砂利", "土"], tent),
    // 快適サイトの説明に「屋外トイレ(洋式ウォシュレット)」
    toiletFeatures: known(["温水洗浄便座"], tent),
    // テントサイトの区画数の合計(展望オート 5 + ファミリーオート 5 + 林間(大) 2 +
    // 林間(小) 7 + 広々 1 + 快適 6)。コテージ・バンガローは入れない
    totalSites: known(26, tent),
    // 宿泊者は無料で使える展望大浴場(天然湧水)がある
    bathing: known("bath", terms),
    // 焚き火台・BBQ コンロを借りられる。予約サイトは「レンタル可能用品 なし」だが、公式を採る
    rental: known(true, faq),
    // 公式に日帰りの案内はない(展望大浴場の日帰り入浴は「不可」)。予約サイトの
    // 利用タイプに日帰り・デイキャンプがあるが、コテージ・バンガローも含む施設全体の
    // 表記で、日帰りのプランもないため使わない
    dayCamp: notStated(home),
    // コテージ・バンガローは入れない
    siteTypes: [
      // 展望オート・ファミリーオート・林間(小)は、公式の説明に区画かどうかの記載がない
      // ため、予約サイトの施設タイプ(テントサイトは「区画サイト」だけ)による。
      // 「サイト内に車を停められます」
      site("展望オートサイト", area(60, 60), known("inside", tent), nap),
      site("ファミリーオートサイト", area(60, 60), known("inside", tent), nap),
      // 林間・快適は車の乗り入れ「不可」。荷物の搬入・搬出のときだけサイトの近くまで
      // 入れて、駐車場は別。林間(大)・快適は「2区画ご予約ください」とある
      site("林間サイト(大)", area(40, 80), known("none", tent), tent),
      site("林間サイト(小)", area(20, 30), known("none", tent), nap),
      // 車の乗り入れは「不可」だが、「サイトの隣に駐車場がございます」。
      // 「1区画限定の貸切サイト」
      site("広々サイト", area(80, 100), known("front", tent), tent),
      site("快適サイト", area(25, 30), known("none", tent), tent),
    ],
  } satisfies Campsite;
})();
