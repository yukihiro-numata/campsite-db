import type { Campsite } from "@/data/types.ts";
import type { SearchParams } from "./filters.ts";

// 一覧の並び順。選ばなければデータの順(登録順)のまま。

type SortOption = {
  /** URL のクエリ sort の値 */
  value: string;
  label: string;
  /** 小さい順に並べる値。分からないときは undefined */
  key: (c: Campsite) => number | undefined;
};

const sortOptions: SortOption[] = [
  {
    value: "time",
    label: "所要時間が近い順",
    key: (c) =>
      c.travelMinutes.status === "known" ? c.travelMinutes.value : undefined,
  },
];

/** 画面に出す並び順の選択肢。value が空のものはデータの順 */
export const sortViews = [
  { value: "", label: "登録順" },
  ...sortOptions.map(({ value, label }) => ({ value, label })),
];

/** クエリから並び順を取り出す。知らない値は無視して空文字(データの順)にする */
export function selectedSort(params: SearchParams): string {
  const raw = params.sort;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return sortOptions.some((o) => o.value === value) ? (value as string) : "";
}

/**
 * 選んだ並び順に並べ替える。値が分からないキャンプ場は末尾に置く。
 * 同じ値のもの、分からないもの同士は元の順のまま
 */
export function sortBy<T>(
  items: T[],
  sort: string,
  campsiteOf: (item: T) => Campsite,
): T[] {
  const option = sortOptions.find((o) => o.value === sort);
  if (!option) return items;
  const key = (item: T) => option.key(campsiteOf(item)) ?? Infinity;
  return items.toSorted((a, b) => {
    const [ka, kb] = [key(a), key(b)];
    return ka === kb ? 0 : ka - kb;
  });
}
