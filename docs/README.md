# Docs Generator 設計資料

## 1. 目的

本ディレクトリは、Excelを介さず、一機能分のMarkdown設計書を直接作成する「Docs Generator」の正式な設計資料を管理する。

初期実装は、必要な設計書を選択し、必要項目を入力して、テンプレートに近いMarkdown一式をZIP出力する小規模なブラウザ完結型ツールとする。

## 2. MVP方針

- Markdownを正式な設計成果物として扱う。
- 一機能につき一つの設計書パッケージを生成する。
- 基本6設計書を初期選択する。
- 条件付き6設計書は利用者が必要なものだけ選択する。
- 共通項目は一度だけ入力し、全設計書へ反映する。
- 出力形式はリポジトリ直下の`templates/`を正本とする。
- 画面は1画面とし、バックエンドとデータベースを持たない。
- テンプレートは単純なトークン置換で展開する。
- 画像はS-LayoutとR-Layoutだけに添付できる。
- 画像は対象Markdownと同名のフォルダへ格納する。
- 初期実装ではMarkdown再読込、GitHub連携、AI生成を行わない。

## 3. 資料一覧

| 資料 | 内容 |
| --- | --- |
| [01_PRODUCT_REQUIREMENTS.md](01_PRODUCT_REQUIREMENTS.md) | 背景、目的、対象範囲、要件、対象外 |
| [02_FUNCTIONAL_DESIGN.md](02_FUNCTIONAL_DESIGN.md) | 1画面構成、入力、選択、プレビュー、出力 |
| [03_SYSTEM_DESIGN.md](03_SYSTEM_DESIGN.md) | 技術構成、データモデル、テンプレート展開、保存方式 |
| [04_MARKDOWN_OUTPUT_SPEC.md](04_MARKDOWN_OUTPUT_SPEC.md) | 出力階層、設計書種類、Markdown生成規則 |
| [05_IMPLEMENTATION_PLAN.md](05_IMPLEMENTATION_PLAN.md) | 小規模MVPの実装順と完了条件 |
| [06_TEST_PLAN.md](06_TEST_PLAN.md) | 最低限必要な自動テストと手動確認 |
| [07_IMAGE_ASSET_SPEC.md](07_IMAGE_ASSET_SPEC.md) | レイアウト画像の添付、格納、相対参照仕様 |
| [08_IMAGE_IMPLEMENTATION_PLAN.md](08_IMAGE_IMPLEMENTATION_PLAN.md) | 画像対応の最小実装計画 |

## 4. 基本出力設計書

次の6ファイルを初期選択する。

- `Hist.md`
- `Outline_A.md`
- `Outline_B.md`
- `FuncSpec.md`
- `FuncDetail.md`
- `Relation.md`

次の設計書は、対象機能に必要な場合だけ追加する。

- `S-Layout.md`
- `R-Layout.md`
- `Event.md`
- `Check.md`
- `Others.md`
- `Footnote.md`

## 5. テンプレート

生成形式の正本はリポジトリ直下の`templates/`とする。

```text
templates/
├── README_TEMPLATE.md
└── sheets/
    ├── Hist.md
    ├── Outline_A.md
    ├── Outline_B.md
    ├── S-Layout.md
    ├── R-Layout.md
    ├── FuncSpec.md
    ├── Event.md
    ├── FuncDetail.md
    ├── Relation.md
    ├── Check.md
    ├── Others.md
    └── Footnote.md
```

## 6. 想定出力構成

```text
<機能ID>_<機能名>/
├── README.md
└── sheets/
    ├── Hist.md
    ├── Outline_A.md
    ├── Outline_B.md
    ├── FuncSpec.md
    ├── FuncDetail.md
    ├── Relation.md
    ├── S-Layout.md
    ├── S-Layout/
    │   └── screen-overview.png
    ├── R-Layout.md
    ├── R-Layout/
    │   └── report-sample.png
    └── 必要に応じて追加される設計書.md
```

`README.md`以外のMarkdownはすべて`sheets/`へ配置する。画像が存在しない場合、画像フォルダは生成しない。
