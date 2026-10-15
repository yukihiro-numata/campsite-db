import type {
  Area,
  Bathing,
  CarAccess,
  Fact,
  GroupPolicy,
  Layout,
  Source,
} from "@/data/types.ts";

// 値を画面に出すときの文言と書き方。一覧と詳細で同じ言い方にする

/** 分かっている値を文字にする。分からなければ undefined */
export const formatFact = <T>(
  fact: Fact<T>,
  format: (value: T) => string,
): string | undefined =>
  fact.status === "known" ? format(fact.value) : undefined;

export const sourceKindLabel: Record<Source["kind"], string> = {
  official: "公式サイト",
  booking: "予約サイト",
  calculated: "計算",
};

export const carAccessLabel: Record<CarAccess, string> = {
  inside: "区画内に駐車",
  front: "区画の前に駐車",
  none: "横付けできない",
};

export const layoutLabel: Record<Layout, string> = {
  plot: "区画サイト",
  free: "フリーサイト",
};

export const bathingLabel: Record<Bathing, string> = {
  bath: "風呂がある",
  shower: "シャワーだけある",
  none: "ない",
};

export const groupLabel: Record<GroupPolicy["allowed"], string> = {
  yes: "可",
  conditional: "条件付き",
  no: "不可",
};

export const yesNo = (v: boolean) => (v ? "あり" : "なし");

export const formatMinutes = (min: number) => `約${min}分`;

export const formatElevation = (m: number) => `${m.toLocaleString("ja-JP")}m`;

export const formatArea = (a: Pick<Area, "min" | "max">) =>
  `約${a.min === a.max ? a.min : `${a.min}〜${a.max}`}㎡`;

// 距離は null が「半径 1,500m 以内にない」
export const formatDistance = (m: number | null) =>
  m === null ? "1,500m 以内になし" : `約${m.toLocaleString("ja-JP")}m`;

// コンビニ・スーパーは null が「半径 5km 以内にない」
export const formatStoreDistance = (m: number | null) =>
  m === null ? "5km 以内になし" : `約${(m / 1000).toFixed(1)}km`;
