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
import { selectedSort, sortBy, sortViews } from "@/lib/sort.ts";
import { type MapPoint, ResultsMap } from "./results-map.tsx";
import { SearchForm } from "./search-form.tsx";

// 一覧の出し方。URL のクエリ view に持つ。一覧のときは付けない
const views = [
  { value: "", label: "一覧" },
  { value: "map", label: "地図" },
];

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
  const params = await searchParams;
  const selected = selectedValues(params);
  const sort = selectedSort(params);
  const view = params.view === "map" ? "map" : "";
  const campsites = listCampsites();
  const matches = campsites.map(matchOf);
  const results = sortBy(
    campsites.flatMap((c, i) =>
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
    ),
    sort,
    (r) => r.c,
  );
  // 絞り込みの条件のほかに URL に持つもの。絞り込み直しても保つ
  const kept = { ...(sort && { sort }), ...(view && { view }) };
  const hrefOf = (query: Record<string, string>) => {
    const q = new URLSearchParams(
      Object.entries(query).filter(([, value]) => value),
    ).toString();
    return q ? `/?${q}` : "/";
  };
  const points: MapPoint[] = results.flatMap(({ c }) =>
    c.location.status === "known"
      ? [
          {
            id: c.id,
            name: c.name,
            ...c.location.value,
            stats: [
              formatFact(c.travelMinutes, formatMinutes),
              formatFact(c.elevation, formatElevation),
              areaRange(c),
            ].filter((v) => v !== undefined),
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
        key={JSON.stringify([selected, kept])}
        fields={fieldViews}
        matches={matches}
        siteTypeNames={siteTypeFieldNames}
        selected={selected}
        kept={kept}
      />

      <section className="lg:col-start-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-2xl font-extrabold tabular-nums">
            {results.length}
            <span className="ml-1 text-sm font-semibold text-muted">件</span>
          </p>
          <nav
            aria-label="一覧の出し方"
            className="flex rounded-full bg-chip p-1 text-sm"
          >
            {views.map((v) => (
              <Link
                key={v.value}
                href={hrefOf({ ...selected, sort, view: v.value })}
                // 一覧の上で押すので、押したあとも同じ位置に留める
                scroll={false}
                aria-current={v.value === view ? "true" : undefined}
                className="rounded-full px-4 py-1 text-ink/80 aria-[current]:bg-primary aria-[current]:font-semibold aria-[current]:text-white"
              >
                {v.label}
              </Link>
            ))}
          </nav>
        </div>
        {chosen.length > 0 && (
          <ul className="mt-2 flex flex-wrap items-center gap-2 px-1">
            {chosen.map((s) => (
              <li
                key={s.field}
                className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
              >
                <span className="font-normal">{s.field}</span> {s.option}
              </li>
            ))}
            <li>
              {/* 条件だけを外し、並び順と一覧の出し方は保つ */}
              <Link
                href={hrefOf(kept)}
                className="text-sm text-primary underline"
              >
                条件をクリア
              </Link>
            </li>
          </ul>
        )}

        {view === "map" ? (
          <>
            {/* Leaflet の重なり順を、この中に閉じ込める */}
            <div className="relative z-0 mt-3 overflow-hidden rounded-3xl border border-line">
              <ResultsMap points={points} className="h-96 w-full lg:h-128" />
            </div>
            <p className="mt-2 px-1 text-xs text-muted">
              印を押すと、キャンプ場の名前が出ます。
              {points.length < results.length &&
                `場所が分からない ${results.length - points.length} 件は地図に出ません。`}
            </p>
          </>
        ) : (
          <>
            <nav
              aria-label="並び順"
              className="mt-3 flex flex-wrap items-center gap-2 px-1 text-sm"
            >
              <span className="text-xs text-muted">並び順</span>
              {sortViews.map((o) => (
                <Link
                  key={o.value}
                  href={hrefOf({ ...selected, sort: o.value, view })}
                  // 一覧の上で押すので、押したあとも同じ位置に留める
                  scroll={false}
                  aria-current={o.value === sort ? "true" : undefined}
                  className="rounded-full bg-chip px-4 py-2 text-ink/80 aria-[current]:bg-primary aria-[current]:font-semibold aria-[current]:text-white"
                >
                  {o.label}
                </Link>
              ))}
            </nav>

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
                          {siteTypes.length > 1 &&
                            ` ほか ${siteTypes.length - 1}`}
                        </p>
                      )}
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
