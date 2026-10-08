import { calculatedFacts, known, notStated } from "../facts.ts";
import type { Campsite, Source } from "../types.ts";

// 無印良品カンパーニャ嬬恋キャンプ場
export default (() => {
  const checkedOn = "2026-10-08";
  const about: Source = {
    kind: "official",
    url: "https://camp.muji.com/tsumagoi/about/",
    checkedOn,
  };
  const stay: Source = {
    kind: "official",
    url: "https://camp.muji.com/tsumagoi/stay/",
    checkedOn,
  };
  const access: Source = {
    kind: "official",
    url: "https://camp.muji.com/tsumagoi/access/",
    checkedOn,
  };
  const facility: Source = {
    kind: "official",
    url: "https://camp.muji.com/tsumagoi/facility/",
    checkedOn,
  };
  const rental: Source = {
    kind: "official",
    url: "https://camp.muji.com/tsumagoi/rental/",
    checkedOn,
  };
  const precaution: Source = {
    kind: "official",
    url: "https://camp.muji.com/notes/precaution/",
    checkedOn,
  };
  const nap: Source = {
    kind: "booking",
    url: "https://www.nap-camp.com/gunma/10748",
    checkedOn,
  };

  return {
    id: 27,
    name: "無印良品カンパーニャ嬬恋キャンプ場",
    // アクセスページの地図の !2d/!3d は表示範囲の中心で、ピンから約 250m 離れているため、
    // 同じ地図の埋め込みページにあるピンの座標を使う。予約サイトの座標とも同じ
    location: known({ lat: 36.541217, lng: 138.476947 }, access),
    prefecture: known("群馬県", access),
    ...calculatedFacts(27),
    // 「21時以降は、お静かにお願いいたします」とだけあり、終わりの時刻は書かれていない。
    // 設備ページの「消灯時間 22時」はサニタリー棟の消灯
    quietHours: known({ start: "21:00" }, precaution),
    // 「団体予約 可能」だが、団体での宿泊利用は事前に問い合わせる(事前の相談がいるため条件付き)
    groupPolicy: known(
      {
        allowed: "conditional",
        note: "団体予約は可能。団体での宿泊利用は問い合わせフォームから相談する。定員は通常のサイトが 6 人、グループサイトが 12 人",
      },
      about,
    ),
    // 公式に記載がないため予約サイトから(キャンプ場のページ)
    groundTypes: known(["芝", "土"], nap),
    // トイレは「簡易水洗」とだけあり、温水洗浄便座は書かれていない
    toiletFeatures: notStated(facility),
    // テントを張るサイトの区画数の合計(A 18 + B 15 + C 31 + D 22 + E 31 + F 28 +
    // G 19 + H 30 + V 3 + W 6 + Q 4)。無印良品の小屋・家具の家は入れない
    totalSites: known(207, stay),
    // 「シャワー棟は設置しておりません」。案内している温泉は場外の施設
    bathing: known("none", facility),
    rental: known(true, rental),
    // 「デイキャンプについて ご利用時間8:00～18:00」。予約は受け付けず、繁忙期は断る
    // (無印良品キャンプ場に共通の注意事項)
    dayCamp: known(true, precaution),
    // サイトの広さは各区画の「9m×9m」などの寸法から計算した。電源はどのサイトにも
    // 書かれていない
    siteTypes: [
      // 車は「サイト内所定の場所に1台駐車可」(Q エリアを除く)。
      // ペットは C エリアだけ可(A・B エリアは不可)
      {
        name: "林間サイト",
        area: known(
          {
            min: 28,
            max: 156,
            note: "A〜C エリアの各区画の寸法から計算。公式の表記は 4m×7m〜12m×13m",
          },
          stay,
        ),
        carAccess: known("inside", precaution),
        layout: known("plot", stay),
        power: notStated(stay),
        pets: known(true, stay),
      },
      // ペットは H エリアだけ可(D〜G エリアは不可)
      {
        name: "草原サイト",
        area: known(
          {
            min: 63,
            max: 144,
            note: "D〜H エリアの各区画の寸法から計算。公式の表記は 9m×7m〜12m×12m。E-1 は変則四角形の約13〜14m×約6〜11m で、計算に入れていない",
          },
          stay,
        ),
        carAccess: known("inside", precaution),
        layout: known("plot", stay),
        power: notStated(stay),
        pets: known(true, stay),
      },
      {
        name: "眺望サイト",
        area: known(
          {
            min: 324,
            max: 342,
            note: "公式の各区画の表記は 18m×18m〜18m×19m。エリアの説明では約20m×20m",
          },
          stay,
        ),
        carAccess: known("inside", precaution),
        layout: known("plot", stay),
        power: notStated(stay),
        pets: known(true, stay),
      },
      // 柵で囲まれ、犬をノーリードにできるサイト。「車ごと入場可能」
      {
        name: "ドッグランサイト",
        area: known(
          {
            min: 144,
            max: 169,
            note: "公式の各区画の表記は 12m×12m〜13m×13m。エリアの説明では約14m×14m",
          },
          stay,
        ),
        carAccess: known("inside", stay),
        layout: known("plot", stay),
        power: notStated(stay),
        pets: known(true, stay),
      },
      // 「サイト内での駐車はご遠慮いただいております。サイト前の駐車スペースを
      // ご利用下さい」。2 台まで駐車できる
      {
        name: "グループサイト",
        area: known(
          {
            min: 360,
            max: 420,
            note: "公式の各区画の表記は 18m×20m〜20m×21m。エリアの説明では20m×20m",
          },
          stay,
        ),
        carAccess: known("front", precaution),
        layout: known("plot", stay),
        power: notStated(stay),
        pets: known(false, stay),
      },
    ],
  } satisfies Campsite;
})();
