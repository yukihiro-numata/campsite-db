# 技術方針

目的・課題・提供価値は [concept.md](concept.md)、MVP の範囲は [mvp.md](mvp.md) を参照。

## 構成

| 部分 | 採用 |
|---|---|
| Web アプリ | Next.js(App Router、TypeScript)。画面とサーバー側の処理を 1 つで持つ |
| 公開先 | Vercel |
| データ | 最初はリポジトリ内のファイル。必要になったら PostgreSQL(Supabase か Neon)に移す |
| データを集めて整える仕組み | 同じリポジトリのスクリプト。Web アプリとは分ける |
| リポジトリ | 1 つ |
| パッケージ管理 | pnpm |
| Lint・整形 | Biome(Lint と整形を 1 つのツールで行う) |
| スタイル | Tailwind CSS |

この構成を選んだ理由は [ADR 0001](adr/0001-single-nextjs-app.md)。データをファイルで
持つ理由は [ADR 0002](adr/0002-data-in-repo-files-first.md)。

## 方針

- **Web と PWA で作り、最初はネイティブアプリを作らない。** 最初からネイティブアプリを
  作るのは手間が大きいため。Web なら検索エンジンから人を集められる。PWA でホーム画面への
  追加などアプリに近い使い勝手を足せる。
- **Vercel だけのサービスや機能に頼らない。** 商用で使うときなどに Cloudflare
  などへ移しやすくするため。データベースを入れるときは外部の PostgreSQL を使う。
- **データを集めて整える処理は Web アプリの中で動かさない。** Vercel には 1 回の
  処理時間に上限があるため。
