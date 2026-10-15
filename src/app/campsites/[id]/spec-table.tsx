import { Card } from "@/components/card.tsx";
import { NoValue } from "@/components/no-value.tsx";
import type { Fact } from "@/data/types.ts";

/** 表の 1 行。値が分からないときは text が無い */
export type Row = {
  label: string;
  fact: Fact<unknown>;
  text?: string;
  /** 値の下に小さく出す補足 */
  sub?: string;
};

export const row = <T,>(
  label: string,
  fact: Fact<T>,
  format: (value: T) => string,
  sub?: (value: T) => string | undefined,
): Row =>
  fact.status === "known"
    ? { label, fact, text: format(fact.value), sub: sub?.(fact.value) }
    : { label, fact };

/** 値と、その下の補足・注記 */
export function Value({ r }: { r: Row }) {
  if (r.text === undefined) return <NoValue />;
  const note = r.fact.status === "known" ? r.fact.note : undefined;
  return (
    <>
      {r.text}
      {r.sub && (
        <span className="block text-xs font-normal text-muted">{r.sub}</span>
      )}
      {note && (
        <span className="block text-xs font-medium text-accent">{note}</span>
      )}
    </>
  );
}

/** 左にラベル、右に値を並べた表 */
export function SpecTable({ rows }: { rows: Row[] }) {
  return (
    <Card className="px-4">
      <dl>
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex justify-between gap-4 border-b border-line py-3 text-sm last:border-0"
          >
            <dt className="shrink-0 text-sm text-muted">{r.label}</dt>
            <dd className="text-right font-semibold">
              <Value r={r} />
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
