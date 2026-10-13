// 詳細ページの「一覧へ」で、直前に絞り込んだ条件の一覧に戻れるようにする。
// 保存できない環境(プライベートブラウズなど)では、条件なしの一覧に戻る

const key = "last-search";

export function saveLastSearch(query: string) {
  try {
    sessionStorage.setItem(key, query);
  } catch {}
}

export function loadLastSearch(): string {
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
