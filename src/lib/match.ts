// 絞り込みの当てはめ。データを読み込まないので、ブラウザでも件数を数えるのに使える。

/** 1 件のキャンプ場が満たす選択肢。"都道府県の name=値" のような文字列で持つ */
export type Match = {
  /** キャンプ場全体の条件で満たす選択肢 */
  campsite: string[];
  /** サイトの種類ごとに、満たす選択肢 */
  siteTypes: string[][];
};

export const optionKey = (name: string, value: string) => `${name}=${value}`;

/**
 * 選んだ条件をすべて満たすサイトの種類の番号。サイトの種類の条件を選んでいなければ null。
 * siteTypeNames はサイトの種類ごとの条件の name
 */
export function matchingSiteTypes(
  match: Match,
  selected: Record<string, string>,
  siteTypeNames: string[],
): number[] | null {
  const keys = Object.entries(selected)
    .filter(([name, value]) => value && siteTypeNames.includes(name))
    .map(([name, value]) => optionKey(name, value));
  if (keys.length === 0) return null;
  return match.siteTypes.flatMap((options, i) =>
    keys.every((k) => options.includes(k)) ? [i] : [],
  );
}

export function isMatch(
  match: Match,
  selected: Record<string, string>,
  siteTypeNames: string[],
): boolean {
  const campsiteOk = Object.entries(selected)
    .filter(([name, value]) => value && !siteTypeNames.includes(name))
    .every(([name, value]) => match.campsite.includes(optionKey(name, value)));
  const siteTypes = matchingSiteTypes(match, selected, siteTypeNames);
  return campsiteOk && (siteTypes === null || siteTypes.length > 0);
}
