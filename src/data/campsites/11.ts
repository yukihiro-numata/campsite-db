import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Area, Campsite, CarAccess, Fact, Source } from "../types.ts";

// キャンプマナビス
export default (() => {
  const checkedOn = "2026-10-08";
  const forest: Source = {
    kind: "official",
    url: "https://campmanavis.com/facility/forest",
    checkedOn,
  };
  const ocean: Source = {
    kind: "official",
    url: "https://campmanavis.com/facility/ocean",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://campmanavis.com/access",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/chiba/14281",
    checkedOn,
  };
  // 全サイトに AC 電源がある(「全サイトAC電源付」)。公式の説明に区画かどうかの
  // 記載がないため、予約サイトのプランの「区画サイト」による。
  // ペットは、サイト名に「愛犬可」とあるフェンス付きのサイトのほかは書かれていない
  const site = (
    name: string,
    area: Area,
    source: Source,
    {
      carAccess = known("inside", source),
      pets = notStated(source),
    }: { carAccess?: Fact<CarAccess>; pets?: Fact<boolean> } = {},
  ) => ({
    name,
    area: known(area, source),
    carAccess,
    layout: known("plot" as const, nap),
    power: known(true, source),
    pets,
  });
  const sqm = (m: number, note?: string): Area => ({ min: m, max: m, note });

  return {
    id: 11,
    name: "キャンプマナビス",
    location: known({ lat: 34.915808, lng: 139.827755 }, access),
    prefecture: known("千葉県", access),
    ...calculatedFacts(11),
    // 「22時～翌朝7時はログハウス・テント内でお静かに」
    quietHours: known({ start: "22:00", end: "07:00" }, forest),
    groupPolicy: known(
      {
        allowed: "no",
        note: "家族と日常的に接している知人など 3 名以下だけ。友人・知人など 4 名以上のグループは禁止。家族同士は 2 家族まで。4 サイトまたは 20 名以上の団体は事前に問い合わせる",
      },
      forest,
    ),
    // 公式のサイト名・説明の地面は芝生・瓦チップ・砂利。瓦チップ(瓦を砕いたもの)は
    // 「その他」にした。予約サイトは「芝 / その他」だが、公式を採る
    groundTypes: known(["芝", "砂利", "その他"], forest),
    // 公式はトイレがあるとだけ書いていて、予約サイトの場内設備に「ウォッシュレット式トイレ」がある
    toiletFeatures: known(["温水洗浄便座"], nap),
    // テントを張るサイトの合計(森エリア 39 + 海エリア 12)。
    // ドームハウスとログハウスは含まない
    totalSites: known(51, forest),
    // センターハウス 3 階の源泉かけ流しの露天風呂(有料)
    bathing: known("bath", {
      kind: "official",
      url: "https://campmanavis.com/facility/centerhouse",
      checkedOn,
    }),
    rental: known(true, {
      kind: "official",
      url: "https://campmanavis.com/rental",
      checkedOn,
    }),
    // 公式に日帰りの案内がなく、予約サイトの利用タイプも「宿泊」だけ
    dayCamp: notStated(nap),
    // 海展望・ドームハウス(設置済みのドーム型の小屋)とログハウスは入れない
    siteTypes: [
      // 「芝生エリアへの車の乗り入れは御遠慮ください」とあり、車を停める場所は
      // 書かれていない。予約サイトは「車両乗り入れOK」だが使わない
      site("芝生・Mサイト", sqm(100), forest, {
        carAccess: notStated(forest),
      }),
      // 「愛犬以外のペット同伴の場合はお問い合わせください」とあるが、
      // 愛犬を連れて泊まれるとは書かれていない
      site("瓦チップ・Mサイト", sqm(100, "公式の表記は100㎡以上"), forest),
      // 芝生 2 サイトと瓦チップ 4 サイト
      site("オーシャンビューサイト", sqm(100, "公式の表記は100㎡以上"), forest),
      site(
        "ファミリー瓦チップサイト",
        sqm(220, "料金表は220㎡。説明文には「広々約234㎡」とある"),
        forest,
      ),
      site(
        "瓦チップ・フェンス付サイト(愛犬可)",
        sqm(100, "公式の表記は100㎡以上"),
        forest,
        { pets: known(true, forest) },
      ),
      // M・L・砂利L ウッドデッキテラスの 3 つの広さがある
      site(
        "森の砂利・ウッドデッキテラス(Lサイト)",
        {
          min: 100,
          max: 150,
          note: "公式の表記は M 100㎡以上・L 130㎡以上・ウッドデッキテラス 150㎡",
        },
        forest,
      ),
      site("海展望・瓦チップLサイト", sqm(160), forest),
      // 車の置き場所が書かれていない。予約サイトの「車両乗り入れOK」は、公式が
      // 乗り入れを断っている芝生・Mサイトにも付いているため使わない
      site(
        "森の芝生・Lサイト(ウッドデッキテラス)",
        sqm(145, "公式の表記は145㎡〜。約35㎡のウッドデッキテラス付き"),
        forest,
        { carAccess: notStated(forest) },
      ),
      site("瓦チップ・Mサイト(海側)", sqm(120, "公式の表記は平均120㎡"), ocean),
      // 公式はペットについて「愛犬以外のペット同伴の場合はお問い合わせください」と
      // だけ書いていて、予約サイトのプラン名に「愛犬可」とある
      site(
        "瓦チップ・Lサイト(フェンス付き)",
        sqm(150, "公式の表記は平均150㎡。予約サイトは150㎡以上"),
        ocean,
        { pets: known(true, nap) },
      ),
    ],
  } satisfies Campsite;
})();
