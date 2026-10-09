import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type {
  Area,
  Bathing,
  CarAccess,
  Fact,
  GroupPolicy,
  Layout,
  Source,
} from "@/data/types.ts";
import { findCampsite, listCampsites } from "@/lib/campsites.ts";
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
  `約${a.min === a.max ? a.min : `${a.min}〜${a.max}`}㎡${a.note ? `(${a.note})` : ""}`;

const formatDistance = (m: number | null) =>
  m === null ? "1,500m 以内になし" : `約${m.toLocaleString("ja-JP")}m`;

function FactRow<T>({
  label,
  fact,
  format,
}: {
  label: string;
  fact: Fact<T>;
  format: (value: T) => string;
}) {
  return (
    <div className="border-b py-2">
      <dt className="text-sm text-gray-600">{label}</dt>
      <dd>
        {fact.status === "known"
          ? format(fact.value)
          : fact.status === "notStated"
            ? "不明"
            : "未調査"}
        {fact.status !== "unchecked" && (
          <p className="text-xs text-gray-500">
            <a href={fact.source.url} className="underline">
              {sourceKindLabel[fact.source.kind]}
            </a>
            {fact.source.note && ` ${fact.source.note}`}
            (調べた日: {fact.source.checkedOn})
          </p>
        )}
      </dd>
    </div>
  );
}

export default async function Page({ params }: PageProps<"/campsites/[id]">) {
  const { id } = await params;
  const c = getCampsite(id);

  return (
    <main className="mx-auto w-full max-w-2xl p-4">
      <h1 className="text-xl font-semibold">{c.name}</h1>

      <h2 className="mt-6 font-semibold">地図</h2>
      {c.location.status === "known" ? (
        <div className="mt-2">
          <CampsiteMap {...c.location.value} />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${c.location.value.lat},${c.location.value.lng}`}
            className="mt-1 inline-block underline"
          >
            Google マップで開く
          </a>
          <p className="text-xs text-gray-500">
            座標:{" "}
            <a href={c.location.source.url} className="underline">
              {sourceKindLabel[c.location.source.kind]}
            </a>
            (調べた日: {c.location.source.checkedOn})
          </p>
        </div>
      ) : (
        <p className="mt-2">
          {c.location.status === "notStated" ? "不明" : "未調査"}
        </p>
      )}

      <h2 className="mt-6 font-semibold">基本情報</h2>
      <dl>
        <FactRow label="都道府県" fact={c.prefecture} format={(v) => v} />
        <FactRow
          label="都心からの所要時間"
          fact={c.travelMinutes}
          format={(v) => `約${v}分`}
        />
        <FactRow
          label="標高"
          fact={c.elevation}
          format={(v) => `${v.toLocaleString()}m`}
        />
        <FactRow
          label="静粛時間"
          fact={c.quietHours}
          format={(v) => `${v.start}〜${v.end ?? ""}`}
        />
        <FactRow
          label="グループ利用"
          fact={c.groupPolicy}
          format={(v) =>
            `${groupLabel[v.allowed]}${v.note ? `(${v.note})` : ""}`
          }
        />
        <FactRow
          label="高速道路まで"
          fact={c.distanceTo.expressway}
          format={formatDistance}
        />
        <FactRow
          label="国道まで"
          fact={c.distanceTo.nationalRoad}
          format={formatDistance}
        />
        <FactRow
          label="鉄道まで"
          fact={c.distanceTo.railway}
          format={formatDistance}
        />
        <FactRow
          label="海まで"
          fact={c.distanceTo.sea}
          format={formatDistance}
        />
        <FactRow
          label="湖まで"
          fact={c.distanceTo.lake}
          format={formatDistance}
        />
        <FactRow
          label="川まで"
          fact={c.distanceTo.river}
          format={formatDistance}
        />
        <FactRow
          label="コンビニ・スーパーまで"
          fact={c.storeDistance}
          format={(m) =>
            m === null ? "5km 以内になし" : `約${(m / 1000).toFixed(1)}km`
          }
        />
        <FactRow
          label="地面の種類"
          fact={c.groundTypes}
          format={(v) => v.join("・")}
        />
        <FactRow
          label="トイレの設備"
          fact={c.toiletFeatures}
          format={(v) => v.join("・")}
        />
        <FactRow
          label="風呂・シャワー"
          fact={c.bathing}
          format={(v) => bathingLabel[v]}
        />
        <FactRow label="レンタル" fact={c.rental} format={yesNo} />
        <FactRow
          label="デイキャンプ"
          fact={c.dayCamp}
          format={(v) => (v ? "できる" : "できない")}
        />
        <FactRow
          label="総サイト数"
          fact={c.totalSites}
          format={(v) => `${v}サイト`}
        />
        <FactRow
          label="座標"
          fact={c.location}
          format={(v) => `${v.lat}, ${v.lng}`}
        />
      </dl>

      <h2 className="mt-6 font-semibold">サイトの種類</h2>
      {c.siteTypes.map((s) => (
        <section key={s.name} className="mt-4">
          <h3 className="font-medium">{s.name}</h3>
          <dl>
            <FactRow label="区画の広さ" fact={s.area} format={formatArea} />
            <FactRow
              label="車の横付け"
              fact={s.carAccess}
              format={(v) => carAccessLabel[v]}
            />
            <FactRow
              label="区画 / フリー"
              fact={s.layout}
              format={(v) => layoutLabel[v]}
            />
            <FactRow label="AC 電源" fact={s.power} format={yesNo} />
            <FactRow
              label="ペット"
              fact={s.pets}
              format={(v) => (v ? "連れて泊まれる" : "連れて泊まれない")}
            />
          </dl>
        </section>
      ))}
    </main>
  );
}
