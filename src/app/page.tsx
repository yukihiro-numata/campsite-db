import Form from "next/form";
import Link from "next/link";
import { listCampsites } from "@/lib/campsites";
import {
  campsiteFields,
  filterCampsites,
  selectedValues,
  siteTypeFields,
} from "@/lib/filters";

export default async function Home({ searchParams }: PageProps<"/">) {
  const selected = selectedValues(await searchParams);
  const results = filterCampsites(listCampsites(), selected);

  return (
    <main className="mx-auto w-full max-w-2xl p-4">
      <h1 className="text-xl font-semibold">キャンプ場の一覧</h1>

      {/* クリアや戻るで URL が変わったとき、選択を URL に合わせ直す */}
      <Form key={JSON.stringify(selected)} action="" className="mt-4">
        <p className="text-sm text-gray-600">
          値が未調査のキャンプ場は、その条件で絞り込むと外れます。
        </p>
        {[...campsiteFields, ...siteTypeFields].map((f) => (
          <label key={f.name} className="mt-2 flex justify-between gap-2">
            {f.label}
            <select
              name={f.name}
              defaultValue={selected[f.name] ?? ""}
              className="border"
            >
              <option value="">指定なし</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        <p className="mt-1 text-sm text-gray-600">
          サイトの種類の条件(車の横付けから区画の広さまで)は、すべてを満たすサイトの種類があるキャンプ場を出します。
        </p>
        <p className="mt-1 text-sm text-gray-600">
          地面の種類はキャンプ場全体の値で、そのサイトの種類の地面とは限りません。
        </p>
        <div className="mt-2 flex gap-4">
          <button type="submit" className="border px-2">
            絞り込む
          </button>
          <Link href="/" className="underline">
            条件をクリア
          </Link>
        </div>
      </Form>

      <p className="mt-6">{results.length}件</p>
      <ul className="mt-2">
        {results.map((c) => (
          <li key={c.id} className="border-b py-2">
            <Link href={`/campsites/${c.id}`} className="underline">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
