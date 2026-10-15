import Link from "next/link";
import { Card } from "@/components/card.tsx";
import { Stat } from "@/components/stat.tsx";
import type { Campsite } from "@/data/types.ts";
import { listCampsites } from "@/lib/campsites.ts";
import {
  fieldViews,
  matchOf,
  selectedValues,
  siteTypeFieldNames,
} from "@/lib/filters.ts";
import {
  carAccessLabel,
  formatArea,
  formatElevation,
  formatFact,
  formatMinutes,
} from "@/lib/labels.ts";
import { isMatch, matchingSiteTypes } from "@/lib/match.ts";
import { SearchForm } from "./search-form.tsx";

/** サイトの種類の広さを、一番狭いものから一番広いものまでの幅で出す */
function areaRange(c: Campsite): string | undefined {
  const areas = c.siteTypes.flatMap((s) =>
    s.area.status === "known" ? [s.area.value] : [],
  );
  if (areas.length === 0) return undefined;
  return formatArea({
    min: Math.min(...areas.map((a) => a.min)),
    max: Math.max(...areas.map((a) => a.max)),
  });
}

/** 一覧に出す短いタグ。分かっていて、あると嬉しいものだけ出す */
function tags(c: Campsite): string[] {
  const car = new Set(
    c.siteTypes.flatMap((s) =>
      s.carAccess.status === "known" ? [s.carAccess.value] : [],
    ),
  );
  return [
    car.has("inside")
      ? carAccessLabel.inside
      : car.has("front")
        ? carAccessLabel.front
        : undefined,
    c.quietHours.status === "known"
      ? `静粛 ${c.quietHours.value.start}`
      : undefined,
    c.bathing.status === "known"
      ? { bath: "風呂", shower: "シャワー", none: undefined }[c.bathing.value]
      : undefined,
  ].filter((t) => t !== undefined);
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const selected = selectedValues(await searchParams);
  const campsites = listCampsites();
  const matches = campsites.map(matchOf);
  const results = campsites.flatMap((c, i) =>
    isMatch(matches[i], selected, siteTypeFieldNames)
      ? [
          {
            c,
            siteTypes: matchingSiteTypes(
              matches[i],
              selected,
              siteTypeFieldNames,
            ),
          },
        ]
      : [],
  );
  const chosen = fieldViews.flatMap((f) =>
    f.options
      .filter((o) => o.value === selected[f.name])
      .map((o) => ({ field: f.label, option: o.label })),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-28 lg:grid lg:grid-cols-[340px_1fr] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-8 lg:pt-6 lg:pb-12">
      <div className="px-1 pt-4 pb-4 lg:col-start-2 lg:pt-0">
        <h1 className="text-2xl leading-snug font-extrabold tracking-wide lg:text-3xl">
          関東近郊の
          <br className="lg:hidden" />
          キャンプ場をさがす
        </h1>
        <p className="mt-1 text-sm text-muted">
          {campsites.length} か所のスペックで絞り込めます
        </p>
      </div>

      {/* 条件が変わったら、選択を URL に合わせ直す */}
      <SearchForm
        key={JSON.stringify(selected)}
        fields={fieldViews}
        matches={matches}
        siteTypeNames={siteTypeFieldNames}
        selected={selected}
      />

      <section className="lg:col-start-2">
        <div className="flex items-baseline justify-between px-1">
          <p className="text-2xl font-extrabold tabular-nums">
            {results.length}
            <span className="ml-1 text-sm font-semibold text-muted">件</span>
          </p>
          {chosen.length > 0 && (
            <Link href="/" className="text-sm text-primary underline">
              条件をクリア
            </Link>
          )}
        </div>
        {chosen.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2 px-1">
            {chosen.map((s) => (
              <li
                key={s.field}
                className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
              >
                <span className="font-normal">{s.field}</span> {s.option}
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-3 space-y-3">
          {results.map(({ c, siteTypes }) => (
            <li key={c.id}>
              <Link href={`/campsites/${c.id}`} className="group block">
                <Card className="p-4 transition group-hover:border-primary/40">
                  {c.prefecture.status === "known" && (
                    <p className="text-xs font-bold tracking-wider text-accent">
                      {c.prefecture.value}
                    </p>
                  )}
                  <h2 className="mt-1 text-lg leading-snug font-extrabold">
                    {c.name}
                  </h2>
                  <div className="mt-2 flex gap-5">
                    <Stat
                      label="所要時間"
                      value={formatFact(c.travelMinutes, formatMinutes)}
                    />
                    <Stat
                      label="標高"
                      value={formatFact(c.elevation, formatElevation)}
                    />
                    <Stat label="広さ" value={areaRange(c)} />
                  </div>
                  {tags(c).length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1">
                      {tags(c).map((t) => (
                        <li
                          key={t}
                          className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                  {siteTypes && siteTypes.length > 0 && (
                    <p className="mt-3 border-t border-dashed border-line pt-2 text-xs text-muted">
                      条件に合うサイト:{" "}
                      <b className="font-semibold text-ink">
                        {c.siteTypes[siteTypes[0]].name}
                      </b>
                      {siteTypes.length > 1 && ` ほか ${siteTypes.length - 1}`}
                    </p>
                  )}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
