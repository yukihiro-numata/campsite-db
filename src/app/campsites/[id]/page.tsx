import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/card.tsx";
import { Stat } from "@/components/stat.tsx";
import { findCampsite, listCampsites } from "@/lib/campsites.ts";
import {
  bathingLabel,
  formatDistance,
  formatElevation,
  formatFact,
  formatMinutes,
  formatStoreDistance,
  groupLabel,
  yesNo,
} from "@/lib/labels.ts";
import { BackLink } from "./back-link.tsx";
import { CampsiteMap } from "./campsite-map.tsx";
import { SiteTypes, siteRows } from "./site-types.tsx";
import { Sources } from "./sources.tsx";
import { type Row, row, SpecTable } from "./spec-table.tsx";

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
  const c = getCampsite(id);
  const facts = [
    formatFact(c.prefecture, (v) => v),
    formatFact(c.travelMinutes, (v) => `都心から${formatMinutes(v)}`),
    formatFact(c.elevation, (v) => `標高 ${formatElevation(v)}`),
  ].filter((f) => f !== undefined);
  const description = `${c.name}(${facts.join("・")})の区画の広さ・静かさ・設備を、出典付きでまとめています。`;
  return {
    title: c.name,
    description,
  };
}

// サイトの種類が多いキャンプ場は、最初のいくつかだけ出して残りは開いて見る
const SITE_TYPES_SHOWN = 4;

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
        row("コンビニ・スーパーまで", c.storeDistance, formatStoreDistance),
      ],
    },
  ];

  const facts = [
    { label: "座標", fact: c.location },
    { label: "都道府県", fact: c.prefecture },
    { label: "所要時間", fact: c.travelMinutes },
    { label: "標高", fact: c.elevation },
    ...sections.flatMap((s) => s.rows),
    ...c.siteTypes.flatMap((s) =>
      siteRows(s).map((r) => ({
        label: `${s.name}の${r.label}`,
        fact: r.fact,
      })),
    ),
  ];

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
          {[
            {
              label: "所要時間",
              value: formatFact(c.travelMinutes, formatMinutes),
            },
            { label: "標高", value: formatFact(c.elevation, formatElevation) },
            {
              label: "静粛時間",
              value: formatFact(c.quietHours, (v) => `${v.start}〜`),
            },
          ].map((t) => (
            <Card key={t.label} className="p-3">
              <Stat label={t.label} value={t.value} size="lg" />
            </Card>
          ))}
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
            <SpecTable rows={s.rows} />
          </section>
        ))}

        <div className="mt-7">
          <Sources facts={facts} />
        </div>
      </div>
    </main>
  );
}
