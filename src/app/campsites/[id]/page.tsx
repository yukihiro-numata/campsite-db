import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type {
  Area,
  Bathing,
  CarAccess,
  Fact,
  GroupPolicy,
  Layout,
  SiteType,
  Source,
} from "@/data/types.ts";
import { findCampsite, listCampsites } from "@/lib/campsites.ts";
import { BackLink } from "./back-link.tsx";
import { CampsiteMap } from "./campsite-map.tsx";

export const dynamicParams = false;

export function generateStaticParams() {
  return listCampsites().map((c) => ({ id: String(c.id) }));
}

function getCampsite(id: string) {
  const campsite = findCampsite(Number(id));
  if (!campsite) notFound();
  return campsite;
}

export async function generateMetadata({
  params,
}: PageProps<"/campsites/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getCampsite(id).name };
}

const sourceKindLabel: Record<Source["kind"], string> = {
  official: "公式サイト",
  booking: "予約サイト",
  calculated: "計算",
};

const carAccessLabel: Record<CarAccess, string> = {
  inside: "区画内に駐車",
  front: "区画の前に駐車",
  none: "横付けできない",
};

const layoutLabel: Record<Layout, string> = {
  plot: "区画サイト",
  free: "フリーサイト",
};

const bathingLabel: Record<Bathing, string> = {
  bath: "風呂がある",
  shower: "シャワーだけある",
  none: "ない",
};

const yesNo = (v: boolean) => (v ? "あり" : "なし");

const groupLabel: Record<GroupPolicy["allowed"], string> = {
  yes: "可",
  conditional: "条件付き",
  no: "不可",
};

const formatArea = (a: Area) =>
  `約${a.min === a.max ? a.min : `${a.min}〜${a.max}`}㎡`;

const formatDistance = (m: number | null) =>
  m === null ? "1,500m 以内になし" : `約${m.toLocaleString("ja-JP")}m`;

/** 1 行に出す値。値が分からないときは text が無い */
type Row = {
  label: string;
  fact: Fact<unknown>;
  text?: string;
  /** 値の下に小さく出す補足 */
  sub?: string;
};

const row = <T,>(
  label: string,
  fact: Fact<T>,
  format: (value: T) => string,
  sub?: (value: T) => string | undefined,
): Row =>
  fact.status === "known"
    ? { label, fact, text: format(fact.value), sub: sub?.(fact.value) }
    : { label, fact };

// 「不明」と「未調査」は、探す人にとってはどちらも分からない値なので同じに出す
function Value({ r }: { r: Row }) {
  if (r.text === undefined) {
    return <span className="text-sm text-muted/80">情報なし</span>;
  }
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

function Table({ rows }: { rows: Row[] }) {
  return (
    <dl className="rounded-2xl border border-line bg-card px-4">
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
  );
}

const siteRows = (s: SiteType): Row[] => [
  row("区画の広さ", s.area, formatArea, (a) => a.note),
  row("車の横付け", s.carAccess, (v) => carAccessLabel[v]),
  row("区画 / フリー", s.layout, (v) => layoutLabel[v]),
  row("AC 電源", s.power, yesNo),
  row("ペット", s.pets, (v) => (v ? "泊まれる" : "泊まれない")),
];

function SiteTypes({ siteTypes }: { siteTypes: SiteType[] }) {
  return (
    <>
      {/* スマホはサイトの種類ごとのカード */}
      <div className="space-y-2 md:hidden">
        {siteTypes.map((s) => (
          <section
            key={s.name}
            className="rounded-2xl border border-line bg-card px-4 pt-3"
          >
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
        ))}
      </div>
      {/* PC は表 */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-card md:block">
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
      </div>
    </>
  );
}

// サイトの種類が多いキャンプ場は、最初のいくつかだけ出して残りは開いて見る
const SITE_TYPES_SHOWN = 4;

function Tile({ label, fact }: { label: string; fact: Fact<string> }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-3 py-3 text-xs text-muted">
      {label}
      <b className="mt-1 block text-lg font-extrabold text-ink tabular-nums">
        {fact.status === "known" ? (
          fact.value
        ) : (
          <span className="text-sm font-medium text-muted/80">情報なし</span>
        )}
      </b>
    </div>
  );
}

/** 事実の値を、見出し用の文字に変える */
const mapFact = <T,>(fact: Fact<T>, f: (v: T) => string): Fact<string> =>
  fact.status === "known" ? { ...fact, value: f(fact.value) } : fact;

const sourceKey = (s: Source) =>
  [s.kind, s.url, s.note ?? "", s.checkedOn].join("\n");

export default async function Page({ params }: PageProps<"/campsites/[id]">) {
  const { id } = await params;
  const c = getCampsite(id);

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: "設備",
      rows: [
        row("風呂・シャワー", c.bathing, (v) => bathingLabel[v]),
        row("トイレ", c.toiletFeatures, (v) => v.join("・") || "特になし"),
        row("地面の種類", c.groundTypes, (v) => v.join("・")),
        row("レンタル", c.rental, yesNo),
        row("デイキャンプ", c.dayCamp, (v) => (v ? "できる" : "できない")),
        row("総サイト数", c.totalSites, (v) => `${v}サイト`),
      ],
    },
    {
      title: "静かさ",
      rows: [
        row("静粛時間", c.quietHours, (v) => `${v.start}〜${v.end ?? ""}`),
        row(
          "グループ利用",
          c.groupPolicy,
          (v) => groupLabel[v.allowed],
          (v) => v.note,
        ),
        row("高速道路まで", c.distanceTo.expressway, formatDistance),
        row("国道まで", c.distanceTo.nationalRoad, formatDistance),
        row("鉄道まで", c.distanceTo.railway, formatDistance),
      ],
    },
    {
      title: "周辺",
      rows: [
        row("海まで", c.distanceTo.sea, formatDistance),
        row("湖まで", c.distanceTo.lake, formatDistance),
        row("川まで", c.distanceTo.river, formatDistance),
        row("コンビニ・スーパーまで", c.storeDistance, (m) =>
          m === null ? "5km 以内になし" : `約${(m / 1000).toFixed(1)}km`,
        ),
      ],
    },
  ];

  // 出典は同じページをまとめ、どの値をそこで確かめたかを添える
  const sources = new Map<string, { source: Source; labels: string[] }>();
  const addSource = (label: string, fact: Fact<unknown>) => {
    if (fact.status === "unchecked") return;
    const key = sourceKey(fact.source);
    const entry = sources.get(key) ?? { source: fact.source, labels: [] };
    if (!entry.labels.includes(label)) entry.labels.push(label);
    sources.set(key, entry);
  };
  addSource("座標", c.location);
  addSource("都道府県", c.prefecture);
  addSource("所要時間", c.travelMinutes);
  addSource("標高", c.elevation);
  for (const s of sections) for (const r of s.rows) addSource(r.label, r.fact);
  for (const s of c.siteTypes) {
    for (const r of siteRows(s)) addSource(`${s.name}の${r.label}`, r.fact);
  }

  const shown = c.siteTypes.slice(0, SITE_TYPES_SHOWN);
  const rest = c.siteTypes.slice(SITE_TYPES_SHOWN);

  return (
    <main className="mx-auto w-full max-w-3xl pb-16 md:px-4">
      <div className="px-5 pt-3 pb-3 md:px-1">
        <BackLink className="text-sm font-semibold text-primary" />
      </div>

      {c.location.status === "known" && (
        <div className="relative z-0">
          <CampsiteMap
            {...c.location.value}
            className="h-56 w-full md:h-80 md:rounded-3xl"
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${c.location.value.lat},${c.location.value.lng}`}
            className="mt-2 inline-block px-5 text-xs text-primary underline md:px-1"
          >
            Google マップで開く
          </a>
        </div>
      )}

      <div className="px-4 md:px-0">
        <div className="px-1 pt-4">
          {c.prefecture.status === "known" && (
            <p className="text-xs font-bold tracking-wider text-accent">
              {c.prefecture.value}
            </p>
          )}
          <h1 className="mt-1 text-2xl leading-snug font-extrabold tracking-wide md:text-3xl">
            {c.name}
          </h1>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile
            label="所要時間"
            fact={mapFact(c.travelMinutes, (v) => `約${v}分`)}
          />
          <Tile
            label="標高"
            fact={mapFact(c.elevation, (v) => `${v.toLocaleString("ja-JP")}m`)}
          />
          <Tile
            label="静粛時間"
            fact={mapFact(c.quietHours, (v) => `${v.start}〜`)}
          />
        </div>

        <h2 className="mt-7 mb-2 px-1 text-sm font-extrabold tracking-wider text-primary">
          サイトの種類
          <span className="ml-2 font-semibold text-muted">
            {c.siteTypes.length}
          </span>
        </h2>
        <SiteTypes siteTypes={shown} />
        {rest.length > 0 && (
          <details className="group mt-2">
            <summary className="cursor-pointer list-none px-1 py-2 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">
                ほかの {rest.length} 種類を見る ▼
              </span>
              <span className="hidden group-open:inline">閉じる ▲</span>
            </summary>
            <SiteTypes siteTypes={rest} />
          </details>
        )}

        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mt-7 mb-2 px-1 text-sm font-extrabold tracking-wider text-primary">
              {s.title}
            </h2>
            <Table rows={s.rows} />
          </section>
        ))}

        <details className="group mt-7">
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
                (調べた日: {source.checkedOn})
                {source.note && <p>{source.note}</p>}
                <p className="text-ink/70">{labels.join("、")}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 px-1 text-xs text-muted">
            「情報なし」は、調べたが書かれていなかった値と、まだ調べていない値です。
          </p>
        </details>
      </div>
    </main>
  );
}
