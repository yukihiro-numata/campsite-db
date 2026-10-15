import { Card } from "@/components/card.tsx";
import type { SiteType } from "@/data/types.ts";
import {
  carAccessLabel,
  formatArea,
  layoutLabel,
  yesNo,
} from "@/lib/labels.ts";
import { type Row, row, Value } from "./spec-table.tsx";

export const siteRows = (s: SiteType): Row[] => [
  row("区画の広さ", s.area, formatArea, (a) => a.note),
  row("車の横付け", s.carAccess, (v) => carAccessLabel[v]),
  row("区画 / フリー", s.layout, (v) => layoutLabel[v]),
  row("AC 電源", s.power, yesNo),
  row("ペット", s.pets, (v) => (v ? "泊まれる" : "泊まれない")),
];

/** サイトの種類の一覧。スマホはサイトの種類ごとのカード、PC は表 */
export function SiteTypes({ siteTypes }: { siteTypes: SiteType[] }) {
  return (
    <>
      <div className="space-y-2 md:hidden">
        {siteTypes.map((s) => (
          <Card key={s.name} className="px-4 pt-3">
            <section>
              <h3 className="text-sm font-bold">{s.name}</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 py-3 text-sm">
                {siteRows(s).map((r) => (
                  <div key={r.label}>
                    <dt className="text-xs text-muted">{r.label}</dt>
                    <dd className="font-semibold">
                      <Value r={r} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </Card>
        ))}
      </div>
      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-4 py-3 font-normal">サイトの種類</th>
              {siteRows(siteTypes[0]).map((r) => (
                <th key={r.label} className="px-3 py-3 font-normal">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {siteTypes.map((s) => (
              <tr
                key={s.name}
                className="border-b border-line align-top last:border-0"
              >
                <th className="px-4 py-3 text-left font-bold">{s.name}</th>
                {siteRows(s).map((r) => (
                  <td key={r.label} className="px-3 py-3 font-semibold">
                    <Value r={r} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
