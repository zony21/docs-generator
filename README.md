# Docs Generator

ブラウザ上で一機能分の設計情報を入力し、Markdown設計書パッケージをZIP出力する静的Webアプリケーションです。

## MVPでできること

- 基本6設計書を初期選択
- 条件付き6設計書を追加選択
- 全12種類の設計内容を1画面で入力
- Markdownソースをファイル単位でプレビュー
- S-Layout / R-LayoutへPNG・JPEG・WebP画像を添付
- README、設計書、画像を規定階層でZIP出力
- 文字入力と表データをLocal Storageへ自動保存

## 開発環境

- Node.js 22.12以上
- Vite
- TypeScript
- JSZip
- Vitest

## 起動

```bash
npm install
npm run dev
```

## 検証

```bash
npm test
npm run build
```

## 出力例

```text
KY01_契約一覧/
├── README.md
└── sheets/
    ├── Hist.md
    ├── Outline_A.md
    ├── Outline_B.md
    ├── FuncSpec.md
    ├── FuncDetail.md
    ├── Relation.md
    ├── S-Layout.md
    └── S-Layout/
        └── screen-overview.png
```

設計仕様と実装計画は[`docs/`](docs/)を参照してください。生成形式の正本は[`templates/`](templates/)です。
