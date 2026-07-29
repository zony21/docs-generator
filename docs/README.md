# Docs Generator 設計資料

## 1. 目的

本ディレクトリは、Markdownを正式な設計書として直接作成するための「Docs Generator」の設計資料を管理する。

本ツールでは、Excelを作成してからMarkdownへ変換する工程を廃止し、一機能ごとに必要項目を選択・入力することで、設計書一式を直接生成する。

## 2. 設計方針

- Markdownを正式な設計成果物として扱う。
- 一機能につき一つの設計書パッケージを生成する。
- 基本設計書を初期選択し、機能の種類に応じて追加設計書を自動提案する。
- 共通項目は一度だけ入力し、複数ファイルへ自動反映する。
- Excelを前提とした項目名や抽出メタデータは廃止する。
- 提供テンプレートを出力構造の正本とする。
- 入力途中の自動保存、プレビュー、検証、ZIP出力により操作を最小化する。
- レイアウト画像は対象Markdownと同名のフォルダへ格納する。
- 出力後はMarkdownファイルを正本とし、再読込して編集できることを目標とする。

## 3. 資料一覧

| 資料 | 内容 |
| --- | --- |
| [01_PRODUCT_REQUIREMENTS.md](01_PRODUCT_REQUIREMENTS.md) | 背景、目的、対象範囲、要件、受入条件 |
| [02_FUNCTIONAL_DESIGN.md](02_FUNCTIONAL_DESIGN.md) | 画面、操作フロー、入力項目、機能仕様 |
| [03_SYSTEM_DESIGN.md](03_SYSTEM_DESIGN.md) | 技術構成、内部モデル、テンプレート駆動生成、保存方式 |
| [04_MARKDOWN_OUTPUT_SPEC.md](04_MARKDOWN_OUTPUT_SPEC.md) | 出力フォルダ、設計書種類、各Markdownの生成規約 |
| [05_IMPLEMENTATION_PLAN.md](05_IMPLEMENTATION_PLAN.md) | 実装順序、作業単位、完了条件 |
| [06_TEST_PLAN.md](06_TEST_PLAN.md) | テスト観点、検証項目、品質基準 |
| [07_IMAGE_ASSET_SPEC.md](07_IMAGE_ASSET_SPEC.md) | レイアウト画像の添付、保存、表示、再読込仕様 |
| [08_IMAGE_IMPLEMENTATION_PLAN.md](08_IMAGE_IMPLEMENTATION_PLAN.md) | 画像対応の実装順序と完了条件 |
| [templates/README.md](templates/README.md) | テンプレート一式の管理・変更ルール |

## 4. 基本出力設計書

一機能につき、原則として次の設計書を生成対象とする。

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

## 5. 想定出力構成

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
    │   └── report-page-1.png
    └── 必要に応じて追加される設計書.md
```

`README.md`以外の設計書は、すべて`sheets`フォルダに配置する。

画像は、対象Markdownの拡張子を除いたファイル名と同じフォルダへ配置する。画像が存在しない場合、その画像フォルダは生成しない。
