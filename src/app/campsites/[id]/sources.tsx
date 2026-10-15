import type { Fact, Source } from "@/data/types.ts";
import { sourceKindLabel } from "@/lib/labels.ts";

const sourceKey = (s: Source) =>
  [s.kind, s.url, s.note ?? "", s.checkedOn].join("\n");

/**
 * 出典の一覧。同じページの出典はまとめ、どの値をそこで確かめたかを添える。
 * 普段は閉じておき、開いたときだけ出す
 */
export function Sources({
  facts,
}: {
  facts: { label: string; fact: Fact<unknown> }[];
}) {
  const sources = new Map<string, { source: Source; labels: string[] }>();
  for (const { label, fact } of facts) {
    if (fact.status === "unchecked") continue;
    const key = sourceKey(fact.source);
    const entry = sources.get(key) ?? { source: fact.source, labels: [] };
    if (!entry.labels.includes(label)) entry.labels.push(label);
    sources.set(key, entry);
  }

  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-1 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
        出典を見る
        <span className="ml-1 inline-block text-xs transition group-open:rotate-180">
          ▼
        </span>
      </summary>
      <ul className="mt-3 space-y-3 px-1 text-xs text-muted">
        {[...sources.values()].map(({ source, labels }) => (
          <li key={sourceKey(source)}>
            <a
              href={source.url}
              className="font-semibold break-all text-primary underline"
            >
              {sourceKindLabel[source.kind]}
            </a>
            (調べた日: {source.checkedOn}){source.note && <p>{source.note}</p>}
            <p className="text-ink/70">{labels.join("、")}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 px-1 text-xs text-muted">
        「情報なし」は、調べたが書かれていなかった値と、まだ調べていない値です。
      </p>
    </details>
  );
}
