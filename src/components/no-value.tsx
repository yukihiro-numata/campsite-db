// 「不明」と「未調査」は、探す人にとってはどちらも分からない値なので同じに出す
export function NoValue() {
  return <span className="text-sm font-medium text-muted">情報なし</span>;
}
