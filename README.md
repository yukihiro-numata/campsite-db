# campsite-db

キャンプ場の「スペック検索・比較」サービス。

既存のキャンプ場サービスは予約・口コミが中心で、「行ってみないと分からない情報」
(地面の硬さ、区画の広さ、静かさ、トイレのきれいさ 等)が構造化されていない。
本プロジェクトは、それらを構造化データとして検索できるサービスを目指す。

## ドキュメント

| パス | 内容 |
|---|---|
| [docs/concept.md](docs/concept.md) | 目的・対象ユーザー・課題・提供価値 |
| [docs/mvp.md](docs/mvp.md) | MVP スコープ(何を作るか) |
| [docs/tech.md](docs/tech.md) | 技術方針(何で作るか) |
| [docs/adr/](docs/adr/) | 設計判断の記録(ADR) |

## 開発

Node.js と pnpm が必要。

```sh
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint       # Lint・整形のチェック(Biome)
pnpm format     # 整形
pnpm typecheck  # 型チェック
pnpm calc       # 計算して埋める値を出す(scripts/calc/)
pnpm build
```
