# 計算して埋める値のスクリプト

キャンプ場データのうち、地図データから計算で出す値を求めて `src/data/calculated.ts` に
書き出す。各キャンプ場のファイルは `calculatedFacts(id)` でこの値を読み込む。

```sh
pnpm calc
```

- 座標が分かっているキャンプ場を、毎回すべて計算し直す。座標がないキャンプ場は書き出さず、
  値は未調査になる。
- 計算した日は、スクリプトを実行した日を 1 つだけ書き出す(出典の「調べた日」に入る)。
  毎回すべて計算し直すので、地図データの更新で変わった値は PR の差分に出る。
- `src/data/calculated.ts` は手で直さない。
- 計算を足すときは、`CalculatedValues`(`src/data/types.ts`)と `index.ts` の
  `calculate()`、`src/data/facts.ts` の `calculatedFacts()` に足す。
