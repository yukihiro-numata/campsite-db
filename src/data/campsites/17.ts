import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// PICAさがみ湖
export default (() => {
  const checkedOn = "2026-10-08";
  const siteIndex: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/sagamiko/stay/site/index.html",
    checkedOn,
  };
  const guidance: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/sagamiko/about/guidance.html",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://www.pica-resort.jp/sagamiko/access/index.html",
    checkedOn,
  };
  const page = (name: string): Source => ({
    kind: "official",
    url: `https://www.pica-resort.jp/sagamiko/stay/site/${name}.html`,
    checkedOn,
  });
  const auto = page("auto_power");
  const privateSite = page("tent_private");
  const gokuraku = page("tent_gokuraku");
  const takibi = page("tent_takibi");
  const vista = page("tent_vista");
  const freak = page("wild_camp_site_freak");
  const free = page("wild_camp_site_free");
  const sqm = (m: number): { min: number; max: number; note: string } => ({
    min: m,
    max: m,
    note: `公式の表記は約${m}平米`,
  });

  return {
    id: 17,
    name: "PICAさがみ湖",
    location: known({ lat: 35.60431, lng: 139.207862 }, access),
    prefecture: known("神奈川県", access),
    ...calculatedFacts(17),
    // 公式に静粛時間の記載がない。宿泊約款の「門限 夜10時(開門は翌朝7時)」は
    // 出入りの時間のため使わない
    quietHours: notStated(guidance),
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "1 回(1 泊)の利用が 6 棟(区画)を超えるグループは団体利用として扱い、問い合わせで受け付ける",
      },
      guidance,
    ),
    // テントサイトの説明に「地面は草地・土」とある
    groundTypes: known(["芝", "土"], siteIndex),
    toiletFeatures: notStated(guidance),
    // テントを張るサイトの合計(オート 19 + Freak 3 + PRIVATE 1 + Gokuraku base 1 +
    // TAKIBI 6 + VISTA 2 + FREE 17)。コテージ・キャビン・設営済みテントなどは含まない
    totalSites: known(49, siteIndex),
    // 「場内の共同シャワーは利用無料」。温泉「うるり」は遊園地に隣接する別の施設として
    // 宿泊者割引の案内があるだけのため、場内の入浴設備にしない
    bathing: known("shower", guidance),
    rental: known(true, {
      kind: "official",
      url: "https://www.pica-resort.jp/sagamiko/stay/option/index.html",
      checkedOn,
    }),
    // 日帰りの案内はワイルドクッキングガーデン(BBQ 場)だけで、テントサイトの
    // 日帰り利用は書かれていない
    dayCamp: notStated({
      kind: "official",
      url: "https://www.pica-resort.jp/sagamiko/about/index.html",
      checkedOn,
    }),
    // ペットは、宿泊施設一覧の「ワンちゃん連れOK」の絞り込みに入るサイトだけ可にした。
    // 入っていないサイトは不可とも書かれていないため不明。
    // 広さが数値で書かれていないサイトは、サイト MAP の画像に辺の長さだけがある
    // (形が不規則なため面積にしない)。キャビン・トレーラー・設営済みテントは入れない
    siteTypes: [
      {
        name: "電源付きオートキャンプサイト",
        area: known(sqm(100), auto),
        // 「サイトへの車の進入・駐車が可能」
        carAccess: known("inside", auto),
        // 「区画ロープ内に収まれば、テント・タープは複数設営いただけます」
        layout: known("plot", auto),
        power: known(true, auto),
        pets: known(true, siteIndex),
      },
      {
        name: "WILD CAMP SITE・Freak",
        area: notStated(freak),
        carAccess: known("inside", freak),
        // Freak Base1〜3 を選んで予約する
        layout: known("plot", freak),
        // 「※電源はありません」
        power: known(false, freak),
        pets: known(true, siteIndex),
      },
      {
        name: "WILD CAMP SITE・PRIVATE（電源付き）",
        area: known(sqm(160), privateSite),
        // 「サイトへの車の乗り入れはできません(併設の専用駐車場をご利用ください)」
        carAccess: known("front", privateSite),
        // 1 サイトだけの貸し切りのサイト
        layout: known("plot", privateSite),
        power: known(true, privateSite),
        pets: notStated(privateSite),
      },
      {
        name: "WILD CAMP SITE・Gokuraku base",
        area: known(sqm(160), gokuraku),
        // 「サイト内へ乗り入れ可」
        carAccess: known("inside", gokuraku),
        // 1 サイトだけの貸し切りのサイト
        layout: known("plot", gokuraku),
        power: notStated(gokuraku),
        pets: notStated(gokuraku),
      },
      {
        name: "WILD CAMP SITE・TAKIBI",
        area: notStated(takibi),
        carAccess: known("inside", takibi),
        // TAKIBI Base 1〜6 を選んで予約する
        layout: known("plot", takibi),
        power: notStated(takibi),
        pets: notStated(takibi),
      },
      {
        name: "WILD CAMP SITE・VISTA",
        area: notStated(vista),
        carAccess: known("inside", vista),
        // VISTA Base1・2 を選んで予約する
        layout: known("plot", vista),
        // 「電源：15A・1,500Wご利用頂けます」
        power: known(true, vista),
        pets: notStated(vista),
      },
      {
        name: "WILD CAMP SITE FREE",
        area: notStated(free),
        // 「サイトへの車の進入・駐車が可能です」
        carAccess: known("inside", free),
        // 説明文に「フリーテントサイト」とある
        layout: known("free", free),
        // 「電源はありません」
        power: known(false, free),
        pets: known(true, siteIndex),
      },
    ],
  } satisfies Campsite;
})();
