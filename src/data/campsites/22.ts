import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// ほったらかしキャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const page = (path: string): Source => ({
    kind: "official",
    url: `https://hottarakashicamp.com/${path}`,
    checkedOn,
  });
  const top = page("");
  const div = page("facility/div");
  const hanare = page("facility/hanare");
  const dainoji = page("facility/dainoji");
  const yokohama = page("yokohama");
  const deck = page("siba");
  const summit = page("top");
  const botti = page("botti-saito");
  const rates = page("rates");
  const usage = page("usage_guide");
  const faq = page("hcfaq");
  const access = page("company/access");

  return {
    id: 22,
    name: "ほったらかしキャンプ場",
    // アクセスページの Google マップの座標
    location: known({ lat: 35.7086604, lng: 138.6483679 }, access),
    prefecture: known("山梨県", access),
    ...calculatedFacts(22),
    // 利用規約に静粛時間の記載はない(22:00 以降のゲート施錠は防犯のためで、静粛時間ではない)
    quietHours: notStated(usage),
    // 人数などの制限は書かれていない。よくある質問では、友人グループが隣り合うサイトを
    // 使うときはサイトごとに予約するよう案内している
    groupPolicy: known(
      {
        allowed: "yes",
        note: "複数のサイトはサイトごとに予約する。ぼっち＆ぼっちは団体での利用を控えるよう書かれている",
      },
      faq,
    ),
    // 各サイトに「最大約4cmの砂利」。デッキサイトは木のデッキで「その他」。
    // ほったらかしサイトは「砂利は敷いてありません」とだけあり、地面の種類は書かれていない
    groundTypes: known(["砂利", "その他"], div),
    // 公式・予約サイトとも、キャンプサイトの利用者が使うトイレの設備は書かれていない
    toiletFeatures: notStated(faq),
    // 温泉(徒歩 3〜4 分)は場外の別施設。シャワーは小屋・トレーラーの室内にだけある
    bathing: notStated(top),
    // ダイノジ 10 + ほったらかし 2 + 区画 9 + ハナレ 12 + ぼっち＆ぼっち 13 + 横浜 1 +
    // デッキ 3 + 頂上 2。小屋付きサイト・小屋サイト・トレーラーハウスは入れない
    totalSites: known(52, rates),
    // テント・寝袋・焚火台などを借りられる
    rental: known(true, page("facility/option")),
    // 「デイキャンプのご利用時間は11:30～16:00」(小屋付きサイトは対象外)
    dayCamp: known(true, rates),
    // 小屋付きサイト・小屋サイト・トレーラーハウスは「特別な一棟」として建物を案内し、
    // テントは横に張ることもできるという扱いのため入れない。
    // 電源はよくある質問の「ぼっちサイト以外の全サイト、電源ボックスをご用意」(有料)による。
    // ペットはよくある質問の「同伴でご入場いただくことが可能」による
    siteTypes: [
      {
        name: "区画サイト",
        area: known({ min: 63, max: 63, note: "公式の表記は約7m×9m" }, div),
        // 「区画サイトのスペースには、車やテント、タープが入る大きさです」
        carAccess: known("inside", div),
        layout: known("plot", div),
        power: known(true, faq),
        pets: known(true, faq),
      },
      {
        name: "ハナレサイト",
        area: known(
          { min: 63, max: 63, note: "公式の表記はおよそ7m×9m" },
          hanare,
        ),
        // サイトのページに書かれておらず、よくある質問の「車両の乗り入れは全サイトで可能」による
        carAccess: known("inside", faq),
        layout: known("plot", hanare),
        power: known(true, faq),
        pets: known(true, faq),
      },
      {
        name: "ダイノジサイト",
        area: notStated(dainoji),
        // 「2台分の車、テント、タープが入る大きさです」
        carAccess: known("inside", dainoji),
        layout: known("plot", dainoji),
        power: known(true, faq),
        pets: known(true, faq),
      },
      // 柵付きのサイト。①は車の乗り入れ可、②は乗り入れ不可(サイトの隣に駐車)
      {
        name: "ほったらかしサイト",
        area: notStated(dainoji),
        carAccess: known("inside", dainoji),
        layout: known("plot", dainoji),
        power: known(true, faq),
        // 「柵付きサイトなのでペットも安心して遊べます」
        pets: known(true, dainoji),
      },
      {
        name: "横浜サイト",
        area: known(
          { min: 120, max: 120, note: "公式の表記は約120㎡" },
          yokohama,
        ),
        // 「2台分の車、テント、タープが入る大きさです」
        carAccess: known("inside", yokohama),
        layout: known("plot", yokohama),
        power: known(true, faq),
        pets: known(true, faq),
      },
      {
        name: "デッキサイト",
        area: known(
          {
            min: 30,
            max: 30,
            note: "デッキの広さ(約5m×6m)。区画全体の広さは書かれていない。デッキの奥に焚き火用の幅 1.5m のスペースがある",
          },
          deck,
        ),
        // 「デッキサイズ:約5m×6m(隣に駐車スペースあり)」
        carAccess: known("front", deck),
        layout: known("plot", deck),
        power: known(true, faq),
        pets: known(true, faq),
      },
      {
        name: "頂上サイト",
        area: known(
          { min: 104, max: 104, note: "公式の表記は約8m×13m" },
          summit,
        ),
        // 「2台分の車、テント、タープが入る大きさです」
        carAccess: known("inside", summit),
        layout: known("plot", summit),
        power: known(true, faq),
        pets: known(true, faq),
      },
      // 大人 2 名までのサイト(中学生以上)。サイトの間に目隠しのフェンスがある
      {
        name: "ぼっち＆ぼっち",
        area: known(
          { min: 60, max: 60, note: "公式の表記は約5m×12m(駐車場込み)" },
          botti,
        ),
        carAccess: known("inside", botti),
        layout: known("plot", botti),
        // よくある質問で電源ボックスのあるサイトから除かれている
        power: known(false, faq),
        pets: known(true, faq),
      },
    ],
  } satisfies Campsite;
})();
