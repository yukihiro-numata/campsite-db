import type { ReactNode } from "react";

/** 枠付きの白い面。一覧の 1 件・表・絞り込みのまとまりなどに使う */
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-card ${className}`}>
      {children}
    </div>
  );
}
