import { NoValue } from "./no-value.tsx";

/** 小さいラベルと大きい数字。value が無ければ「情報なし」を出す */
export function Stat({
  label,
  value,
  size = "md",
}: {
  label: string;
  value?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className="text-xs text-muted">
      {label}
      <b
        className={`mt-1 block font-bold text-ink tabular-nums ${size === "lg" ? "text-lg" : "text-base"}`}
      >
        {value ?? <NoValue />}
      </b>
    </div>
  );
}
