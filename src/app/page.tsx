import Link from "next/link";
import { listCampsites } from "@/lib/campsites";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl p-4">
      <h1 className="text-xl font-semibold">キャンプ場の一覧</h1>
      <ul className="mt-4">
        {listCampsites().map((c) => (
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
