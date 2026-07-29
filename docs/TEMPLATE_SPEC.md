# Markdown設計書ジェネレーター テンプレート仕様

## 1. 目的

本仕様は、提供されたMarkdownテンプレートとほぼ同一の構造で、一機能分の正式な設計書を生成するためのルールを定義する。

テンプレートは参考資料ではなく、生成Markdownの構造を決める正本としてリポジトリ内で管理する。

## 2. 配置

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

生成時は次の構成とする。

```text
<FunctionId>_<FunctionName>/
├── README.md
└── sheets/
    └── 選択された設計書.md
```

`README.md`以外をルート直下へ生成してはならない。

## 3. テンプレートからの変更点

提供されたテンプレートはExcel抽出用であったため、次だけをMarkdown直接作成向けに変更する。

| 元の内容 | 変更後 |
| --- | --- |
| Workbook名を使用したタイトル | 機能IDと機能名を使用したタイトル |
| Sheet metadata | Document metadata |
| Source workbook | Package |
| Source sheet | Document |
| Original extraction file | File |
| Extracted at | Generated at |
| Sheet-level summary (as written in Excel) | Document summary |
| Main content (verbatim from Excel) | Main content |
| Blank / N/A handling | 生成物には出力しない |

各設計書固有の見出し、表の列、セクション順、ファイル名は原則として維持する。

## 4. 共通置換トークン

全設計書で利用できるトークンは次のとおり。

| トークン | 内容 |
| --- | --- |
| `{{SYSTEM_NAME}}` | システム名 |
| `{{MODULE_NAME}}` | モジュール名 |
| `{{MODULE_ID}}` | モジュールID |
| `{{FUNCTION_ID}}` | 機能ID |
| `{{FUNCTION_NAME}}` | 機能名 |
| `{{DATE}}` | 作成日または基準日 |
| `{{REVISION}}` | Rev |
| `{{DOC_NUMBER}}` | 文書番号 |
| `{{AUTHOR}}` | 作成者 |
| `{{GENERATED_AT}}` | 生成日時 |
| `{{SHEET_TITLE}}` | 設計書タイトル |
| `{{SCREEN_COMPONENT_NAME}}` | 画面・コンポーネント名 |
| `{{EVENT_CHECK_FUNCTION_NAME}}` | イベント・チェック・機能名 |
| `{{TIMING}}` | タイミング |
| `{{NOTES}}` | 備考 |

## 5. README固有トークン

| トークン | 内容 |
| --- | --- |
| `{{SHEET_INDEX_ROWS}}` | 実際に生成した設計書の索引行 |
| `{{PACKAGE_NOTES}}` | パッケージ全体の補足 |

索引には選択された設計書だけを、画面上の定義順で出力する。

## 6. 設計書固有トークン

### 6.1 Hist

- `{{HIST_ROWS}}`
- `{{ADDITIONAL_NOTES}}`

### 6.2 Outline_A

- `{{PURPOSE}}`
- `{{SCOPE_TARGET}}`
- `{{OPERATION_FLOW}}`
- `{{PRECONDITIONS}}`
- `{{POSTCONDITIONS}}`

### 6.3 Outline_B

- `{{PROCESSING_STYLE}}`
- `{{CRUD_ROWS}}`
- `{{RELATED_RESOURCE_ROWS}}`
- `{{CONSTRAINTS_REMARKS}}`

### 6.4 S-Layout

- `{{SCREEN_AREA_ROWS}}`
- `{{CONTROL_ROWS}}`
- `{{CONTROL_PROPERTY_ROWS}}`
- `{{DISPLAY_EDIT_RULES}}`

### 6.5 R-Layout

- `{{LAYOUT_BLOCK_ROWS}}`
- `{{OUTPUT_ITEM_ROWS}}`
- `{{COLUMN_DEFINITION_ROWS}}`
- `{{OUTPUT_BEHAVIOR_NOTES}}`

### 6.6 FuncSpec

- `{{FUNCTION_UNIT}}`
- `{{TRIGGER_TIMING}}`
- `{{ACTION_DETAIL_BLOCKS}}`

### 6.7 Event

- `{{EVENT_ROWS}}`
- `{{EVENT_NOTES}}`

### 6.8 FuncDetail

- `{{PROCESSING_UNIT_BLOCKS}}`
- `{{INTERNAL_FLOW_BLOCKS}}`

### 6.9 Relation

- `{{TRANSFER_SOURCE_BLOCKS}}`
- `{{TRANSFER_DESTINATION_BLOCKS}}`
- `{{SQL_BLOCKS}}`

### 6.10 Check

- `{{SCREEN_NAME}}`
- `{{CHECK_NAME}}`
- `{{CHECK_TIMING_TRIGGER}}`
- `{{CHECK_ROWS}}`

### 6.11 Others

- `{{CONSTANT_ROWS}}`
- `{{MAPPING_ROWS}}`
- `{{OPERATIONAL_NOTES}}`

### 6.12 Footnote

- `{{TERM_ROWS}}`
- `{{ABBREVIATION_ROWS}}`
- `{{SUPPLEMENTAL_NOTES}}`

## 7. レンダリング方式

### 7.1 単一値

単一値は`replaceAll`相当の処理で置換する。

HTMLとして解釈せず、Markdown文字列として扱う。

### 7.2 箇条書き・手順

複数行入力は、入力欄の用途に応じて次へ変換する。

- 箇条書き: 各行の先頭へ`- `を付与
- 番号付き手順: 各行を`1.`から自動採番
- 本文: 入力された改行を維持

### 7.3 表

表の見出しはテンプレートに固定する。

入力行だけをMarkdownの表行へ変換して、対応する行トークンへ差し込む。

セル内では次を処理する。

- `|`を`\|`へ変換
- 改行を`<br>`へ変換
- 前後の不要な空白を除去

### 7.4 SQL

SQLが入力されている場合、次の形式で差し込む。

```sql
SELECT ...
```

SQL自体の整形や書き換えは行わない。

### 7.5 空欄

- 任意の単一値: 空文字へ置換
- 空の本文: `-`または空文字へ置換する設定を設計書単位で固定
- 空の表: 見出しを維持し、データ行を空にする
- 選択されていない設計書: ファイル自体を生成しない

利用者へテンプレートトークンを見せない。

## 8. 未置換トークン検証

生成後に正規表現`{{[A-Z0-9_]+}}`へ一致する文字列が残っていないことを検証する。

未置換トークンが存在する場合はZIPを生成せず、対象ファイルとトークン名を表示する。

## 9. テンプレート変更ルール

1. テンプレート変更はGitで履歴管理する。
2. 見出しや列の変更時は生成テストも更新する。
3. トークン追加時はデータモデル、入力フォーム、レンダラー、テストを同時に更新する。
4. テンプレート内に処理ロジックを追加しない。
5. 独自の条件構文やループ構文を追加しない。
6. テンプレート名と生成ファイル名を一致させる。

## 10. 完全一致させる範囲

次はテンプレートと一致させる。

- ファイル名
- 見出し名
- 見出し順
- セクション番号
- 表の列名
- 表の列順
- ファイル間リンク
- READMEからの相対リンク

次は入力内容に応じて変化してよい。

- 表の行数
- 処理ブロック数
- 箇条書き数
- SQLブロック数
- 選択される設計書の種類

## 11. 受け入れ条件

1. 13個のテンプレートがリポジトリに存在する。
2. 基本6設計書をテンプレート構造どおり生成できる。
3. 条件付き6設計書も選択時に同じ構造で生成できる。
4. 生成後に未置換トークンが残らない。
5. テンプレート変更が出力へ反映される。
6. テンプレートエンジンを独自実装せずに動作する。
7. README以外はすべて`sheets/`配下へ生成される。