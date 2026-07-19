# 技術方針

戦略・背景・決定記録は [concept.md](concept.md)、MVP の範囲は [mvp.md](mvp.md) を参照。

| レイヤ | 選定 | 状態 |
|---|---|---|
| フロントエンド | Next.js (App Router)。SEO 重視 + **PWA(モバイルファースト。ネイティブアプリは作らない)** | 候補 |
| バックエンド | Ruby on Rails API | 候補 |
| DB | PostgreSQL + PostGIS | 候補 |
| 地図 | MapLibre + OpenStreetMap(Google Maps 非依存) | 候補 |
| ストレージ | S3 互換(Cloudflare R2) | 候補 |
| インフラ | Vercel / Fly.io / Supabase | 候補 |

方針: **PWA + Web** を主軸とする。ネイティブアプリは作らない。理由:
(1) なっぷ・hinata・sotoshiru が既にネイティブアプリを保有し概ね好評＝
アプリ空白は無い、(2) 操作性は衛生要因で差別化にならない、(3) ネイティブは
SEO(広告収益の生命線)に乗らない。Web は SEO とモバイル体験を両立でき、
PWA でホーム画面追加・オフライン閲覧などアプリ的な使い勝手も足せる。

実装開始時に ADR として確定させる。
