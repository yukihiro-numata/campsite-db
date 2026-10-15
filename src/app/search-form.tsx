"use client";

import Form from "next/form";
import { useEffect, useState } from "react";
import type { FieldView } from "@/lib/filters.ts";
import { isMatch, type Match } from "@/lib/match.ts";
import { saveLastSearch } from "./last-search.ts";

// 絞り込みの項目のまとまり。よく使うものを上に置く
const groups: { title: string; names: string[]; note?: string }[] = [
  { title: "場所", names: ["pref", "time"] },
  {
    title: "サイト",
    names: ["car", "layout", "area", "power", "pets"],
    note: "サイトの種類の条件は、すべてを満たすサイトの種類があるキャンプ場を出します。",
  },
  {
    title: "設備",
    names: ["bath", "washlet", "ground", "rental", "day"],
    note: "地面の種類はキャンプ場全体の値で、そのサイトの種類の地面とは限りません。",
  },
  {
    title: "静かさ",
    names: ["quiet", "group", "expressway", "road", "railway"],
  },
  { title: "周辺", names: ["elevation", "water", "store"] },
];

export function SearchForm({
  fields,
  matches,
  siteTypeNames,
  selected,
}: {
  fields: FieldView[];
  /** キャンプ場ごとの満たす選択肢。押す前に件数を出すのに使う */
  matches: Match[];
  siteTypeNames: string[];
  /** URL で選ばれている条件 */
  selected: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(selected);
  useEffect(() => {
    saveLastSearch(new URLSearchParams(selected).toString());
  }, [selected]);
  const count = matches.filter((m) => isMatch(m, values, siteTypeNames)).length;
  const selectedCount = Object.keys(selected).length;
  const fieldByName = new Map(fields.map((f) => [f.name, f]));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="search-form"
        className="fixed inset-x-4 bottom-5 z-10 flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/30 lg:hidden"
      >
        条件で絞り込む
        {selectedCount > 0 && (
          <span className="rounded-full bg-white px-2 text-xs text-primary">
            {selectedCount}
          </span>
        )}
      </button>

      <div
        id="search-form"
        className={`${open ? "fixed inset-0 z-20 overflow-y-auto" : "hidden"} bg-bg lg:sticky lg:top-4 lg:row-span-2 lg:row-start-1 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:rounded-3xl`}
      >
        {/* 条件が今と同じだと URL が変わらず画面も作り直されないので、ここで閉じる */}
        <Form action="" onSubmit={() => setOpen(false)}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3 lg:px-1 lg:pt-0">
            <h2 className="text-lg font-extrabold">絞り込み</h2>
            <div className="flex gap-4 text-sm">
              <button
                type="button"
                onClick={() => setValues({})}
                className="text-primary underline lg:hidden"
              >
                条件をクリア
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted lg:hidden"
              >
                閉じる
              </button>
            </div>
          </div>

          {groups.map((g) => {
            const groupFields = g.names.flatMap(
              (n) => fieldByName.get(n) ?? [],
            );
            const chosen = groupFields.filter((f) => values[f.name]).length;
            return (
              <details
                key={g.title}
                // URL で条件を選んでいるまとまりは開いておく
                open={g.names.some((n) => selected[n])}
                className="group mx-4 mb-3 rounded-2xl border border-line bg-card lg:mx-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
                  <span>
                    {g.title}
                    {chosen > 0 && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-1 text-xs text-white">
                        {chosen}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted transition group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="space-y-3 px-4 pb-4">
                  {groupFields.map((f) => (
                    <fieldset key={f.name}>
                      <legend className="mb-2 text-xs text-muted">
                        {f.label}
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {[{ value: "", label: "指定なし" }, ...f.options].map(
                          (o) => (
                            <label key={o.value} className="cursor-pointer">
                              {/* 選択肢そのものは送らず、下の hidden で選んだ条件だけを送る。
                                  form をどのフォームにも属さない名前にして、送る対象から外す */}
                              <input
                                type="radio"
                                form="no-submit"
                                name={f.name}
                                value={o.value}
                                checked={(values[f.name] ?? "") === o.value}
                                onChange={() =>
                                  setValues({ ...values, [f.name]: o.value })
                                }
                                className="peer sr-only"
                              />
                              <span
                                className={`inline-block rounded-full border px-4 py-2 text-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 ${
                                  // 指定なしは選ばれていても目立たせない
                                  o.value === ""
                                    ? "border-transparent bg-chip text-ink/80 peer-checked:border-primary/50 peer-checked:bg-card peer-checked:text-primary"
                                    : "border-transparent bg-chip text-ink/80 peer-checked:bg-primary peer-checked:font-semibold peer-checked:text-white"
                                }`}
                              >
                                {o.label}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </fieldset>
                  ))}
                  {g.note && <p className="text-xs text-muted">{g.note}</p>}
                </div>
              </details>
            );
          })}

          <p className="mx-5 mt-3 text-xs text-muted lg:mx-1">
            値が分からないキャンプ場は、その条件で絞り込むと外れます。
          </p>

          {Object.entries(values).map(
            ([name, value]) =>
              value && (
                <input key={name} type="hidden" name={name} value={value} />
              ),
          )}

          <div className="sticky bottom-0 bg-gradient-to-t from-bg from-70% px-4 pt-6 pb-5 lg:px-0">
            <button
              type="submit"
              disabled={count === 0}
              className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/30 disabled:bg-muted disabled:shadow-none"
            >
              {count === 0
                ? "条件に合うキャンプ場がありません"
                : `${count} 件を表示`}
            </button>
          </div>
        </Form>
      </div>
    </>
  );
}
