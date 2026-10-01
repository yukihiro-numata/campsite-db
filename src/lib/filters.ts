import type { Campsite, Fact, GroupPolicy, SiteType } from "@/data/types";

// 絞り込みの条件。値が「未調査」のものは、条件を満たすと確かめられないため外す。

type Option = { value: string; label: string };

type Field<T> = {
  /** URL のクエリの名前 */
  name: string;
  label: string;
  options: (Option & { test: T })[];
};

type CampsiteTest = (c: Campsite) => boolean;
type SiteTypeTest = (s: SiteType) => boolean;

const knownAnd =
  <T>(test: (v: T) => boolean) =>
  (fact: Fact<T>) =>
    fact.status === "known" && test(fact.value);

// 距離は null が「半径 1,500m 以内にない」
const farFrom = (meters: number) =>
  knownAnd<number | null>((d) => d === null || d >= meters);

const distanceOptions = (
  pick: (c: Campsite) => Fact<number | null>,
): Field<CampsiteTest>["options"] =>
  [500, 1000, 1500].map((m) => ({
    value: String(m),
    label: `${m.toLocaleString("ja-JP")}m 以上離れている`,
    test: (c) => farFrom(m)(pick(c)),
  }));

const groupIn = (allowed: GroupPolicy["allowed"][]) =>
  knownAnd<GroupPolicy>((g) => allowed.includes(g.allowed));

// "22:00" のような HH:MM は文字列のまま比べられる
const quietFrom = (latest: string) =>
  knownAnd<{ start: string }>((q) => q.start <= latest);

export const campsiteFields: Field<CampsiteTest>[] = [
  {
    name: "time",
    label: "都心からの所要時間",
    options: [60, 90, 120].map((min) => ({
      value: String(min),
      label: `${min}分以内`,
      test: (c) => knownAnd<number>((v) => v <= min)(c.travelMinutes),
    })),
  },
  {
    name: "quiet",
    label: "静粛時間",
    options: ["21:00", "22:00"].map((t) => ({
      value: t.replace(":", ""),
      label: `${t} までに始まる`,
      test: (c) => quietFrom(t)(c.quietHours),
    })),
  },
  {
    name: "group",
    label: "グループ利用",
    options: [
      {
        value: "no",
        label: "断っている",
        test: (c) => groupIn(["no"])(c.groupPolicy),
      },
      {
        value: "limited",
        label: "断っている・制限がある",
        test: (c) => groupIn(["no", "conditional"])(c.groupPolicy),
      },
    ],
  },
  {
    name: "expressway",
    label: "高速道路から",
    options: distanceOptions((c) => c.distanceTo.expressway),
  },
  {
    name: "road",
    label: "国道から",
    options: distanceOptions((c) => c.distanceTo.nationalRoad),
  },
  {
    name: "railway",
    label: "鉄道から",
    options: distanceOptions((c) => c.distanceTo.railway),
  },
];

// サイトの種類ごとの条件。1 つのサイトの種類がすべてを満たす必要がある
export const siteTypeFields: Field<SiteTypeTest>[] = [
  {
    name: "car",
    label: "車の横付け",
    options: [
      {
        value: "inside",
        label: "区画内に駐車",
        test: (s) => knownAnd((v) => v === "inside")(s.carAccess),
      },
      {
        value: "front",
        label: "区画内か区画の前に駐車",
        test: (s) =>
          knownAnd((v) => v === "inside" || v === "front")(s.carAccess),
      },
    ],
  },
  {
    name: "area",
    label: "区画の広さ",
    // 「約 100〜120㎡」のように幅があるときは、狭い方で比べる
    options: [80, 100, 150].map((sqm) => ({
      value: String(sqm),
      label: `${sqm}㎡以上`,
      test: (s) => knownAnd<{ min: number }>((a) => a.min >= sqm)(s.area),
    })),
  },
];

export type SearchParams = Record<string, string | string[] | undefined>;

/** クエリから選ばれている値を取り出す。知らない値は無視する */
export function selectedValues(params: SearchParams): Record<string, string> {
  const selected: Record<string, string> = {};
  for (const field of [...campsiteFields, ...siteTypeFields]) {
    const raw = params[field.name];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (field.options.some((o) => o.value === value)) {
      selected[field.name] = value as string;
    }
  }
  return selected;
}

function selectedTests<T>(
  fields: Field<T>[],
  selected: Record<string, string>,
): T[] {
  return fields.flatMap((f) =>
    f.options.filter((o) => o.value === selected[f.name]).map((o) => o.test),
  );
}

export function filterCampsites(
  campsites: Campsite[],
  selected: Record<string, string>,
): Campsite[] {
  const campsiteTests = selectedTests(campsiteFields, selected);
  const siteTypeTests = selectedTests(siteTypeFields, selected);
  return campsites.filter(
    (c) =>
      campsiteTests.every((test) => test(c)) &&
      (siteTypeTests.length === 0 ||
        c.siteTypes.some((s) => siteTypeTests.every((test) => test(s)))),
  );
}
