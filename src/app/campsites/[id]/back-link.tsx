"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadLastSearch } from "../../last-search.ts";

/** 直前に絞り込んだ条件の一覧へ戻る */
export function BackLink({ className }: { className?: string }) {
  const [href, setHref] = useState("/");
  useEffect(() => {
    const query = loadLastSearch();
    if (query) setHref(`/?${query}`);
  }, []);
  return (
    <Link href={href} className={className}>
      ← 一覧へ
    </Link>
  );
}
