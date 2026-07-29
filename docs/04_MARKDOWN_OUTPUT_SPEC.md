# Docs Generator Markdown出力仕様

## 1. 目的

本仕様は、Docs Generatorが一機能ごとに生成するMarkdown設計書パッケージの構成、ファイル名、共通見出し、設計書別の内容、空欄処理を定義する。

`docs/templates`配下のテンプレートを出力構造の正本とする。本書はテンプレートの意味と生成規則を説明する。

## 2. 出力単位

- 一回の出力対象は一機能とする。
- 一機能につき一つのルートフォルダを生成する。
- `README.md`だけをルート直下へ配置する。
- その他の設計書はすべて`sheets`配下へ配置する。

## 3. 出力フォルダ

### 3.1 フォルダ名

```text
<機能ID>_<機能名>
```

### 3.2 正規化

- 前後の空白を削除する。
- `/`、`\`、`:`, `*`, `?`, `"`, `<`, `>`, `|`は`_`へ置換する。
- 連続する空白とアンダースコアを整理する。
- 末尾のピリオドと空白を削除する。
- 機能IDがない場合は出力エラーとする。
- 機能名がない場合は出力エラーとする。

## 4. 出力構成

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
    └── 選択された追加設計書.md
```

## 5. 設計書区分

### 5.1 基本設計書

次の6ファイルは新規作成時に選択済みとする。

1. `Hist.md`
2. `Outline_A.md`
3. `Outline_B.md`
4. `FuncSpec.md`
5. `FuncDetail.md`
6. `Relation.md`

利用者が解除する場合は警告する。未選択の場合は生成しない。

### 5.2 条件付き設計書

必要な場合だけ選択・生成する。

1. `S-Layout.md`
2. `R-Layout.md`
3. `Event.md`
4. `Check.md`
5. `Others.md`
6. `Footnote.md`

## 6. ファイル順

READMEの索引と画面上の表示順は次とする。

1. Hist
2. Outline_A
3. Outline_B
4. S-Layout
5. R-Layout
6. FuncSpec
7. Event
8. FuncDetail
9. Relation
10. Check
11. Others
12. Footnote

未選択ファイルは順序から除外する。

## 7. README.md

### 7.1 セクション順

1. H1タイトル
2. `## How to use this folder`
3. `## Feature`
4. `## Document index`
5. `## Notes`

### 7.2 タイトル

```markdown
# <FeatureId> <FeatureName> 設計書
```

### 7.3 How to use this folder

テンプレートに定義された2～3個の案内を出力する。

### 7.4 Feature

次を出力する。

- system_name
- module_name
- module_id
- feature_id
- feature_name
- feature_type
- revision
- author
- generated_at

### 7.5 Document index

```markdown
| Document | File |
| --- | --- |
| Hist | [sheets/Hist.md](sheets/Hist.md) |
```

実際に生成したファイルだけを掲載する。索引と実ファイルは1対1で一致させる。

## 8. 各設計書の共通構造

提供テンプレートに近い構造を維持し、Excel抽出用の項目だけを直接作成用へ置き換える。

```markdown
# <DocumentType>

## 1. Document metadata

## 2. Common metadata

## 3. Document summary

## 4. Main content

## 5. Blank / N/A handling
```

### 8.1 Document metadata

- Package name
- Document type
- Output file
- Generated at
- Template version

### 8.2 Common metadata

- System Name
- Module Name
- Module ID
- Feature ID
- Feature Name
- Date
- Rev
- Doc Number
- Author

### 8.3 Document summary

- Title
- Screen / component name
- Event / check / function name
- Timing
- Notes

各設計書で意味の薄い項目は、フォーム上では非表示にできる。ただし互換性を優先する出力モードでは共通項目を残す。

### 8.4 Main content

設計書固有の見出し、表、処理順を出力する。

### 8.5 Blank / N/A handling

テンプレートの運用説明として次を残す。

- If no concrete values exist, write exactly: No concrete entries.
- Do not infer missing values.
- Do not add implementation assumptions.

生成時の実際の扱いは次とする。

- 未選択設計書は生成しない。
- 主要内容が空の選択済み設計書は警告する。
- 利用者が警告を許可して出力した場合は`No concrete entries.`を出力する。
- 意味のある表枠は保持する。

## 9. Hist.md

### Main content

1. `### 4.1 Revision history`
2. 改訂履歴表
3. `### 4.2 Additional notes`

### 表

| Creation/Update Date | Author | Rev. | Target Document/Area | Change Note | Approval Date | Approval By |
| --- | --- | --- | --- | --- | --- | --- |

新規作成時は、作成日、作成者、Rev、全体、新規作成を初期行として生成する。

## 10. Outline_A.md

### Main content

1. `### 4.1 System/module purpose`
2. `### 4.2 Scope and target users/process`
3. `### 4.3 High-level operation flow`
4. `### 4.4 Preconditions/postconditions`

操作・処理フローは入力順を維持し、番号付きリストで出力する。

## 11. Outline_B.md

### Main content

1. `### 4.1 Processing style/classification`
2. `### 4.2 CRUD / operation categories`
3. `### 4.3 Related tables/masters/interfaces`
4. `### 4.4 Operational constraints and remarks`

CRUDと関連資源の行順は入力順を維持する。

## 12. S-Layout.md

### Main content

1. `### 4.1 Screen sections/areas`
2. `### 4.2 Control list`
3. `### 4.3 Control properties`
4. `### 4.4 Display/edit rules`

コントロールIDは一覧と属性表の関連キーとして扱う。

## 13. R-Layout.md

### Main content

1. `### 4.1 Layout blocks and areas`
2. `### 4.2 Output/display item list`
3. `### 4.3 Column-level definitions`
4. `### 4.4 Rendering/output behavior notes`

## 14. FuncSpec.md

### Main content

1. `### 4.1 Screen/function unit`
2. `### 4.2 Trigger/timing`
3. `### 4.3 Action details`

機能単位が複数ある場合は、`4.1`以下を機能番号付きのサブセクションとして繰り返す。

各アクションに次を出力する。

1. Intent
2. Major steps
3. Success path
4. Error/interruption path

空のエラー処理を推測して追加しない。

## 15. Event.md

### Main content

1. `### 4.1 Event list`
2. イベント一覧表
3. `### 4.2 Additional event notes`

### 表

| Event Name | Trigger | Target Function/Process | Remarks |
| --- | --- | --- | --- |

必要な場合は、発生条件と処理内容の列を追加できる拡張モードを用意する。標準モードは提供テンプレートの4列を維持する。

## 16. FuncDetail.md

### Main content

1. `### 4.1 Processing unit`
2. `### 4.2 Internal flow`
3. `### 4.3 Cross references`

処理単位が複数ある場合は繰り返す。

`try`、`catch`、`finally`は入力があるブロックだけ出力する。関連設計書リンクは選択済みファイルだけを出力する。

## 17. Relation.md

### Main content

1. `### 4.1 Transfer Source`
2. `### 4.2 Transfer Destination`
3. `### 4.3 Mapping`
4. `### 4.4 SQL definition`

提供テンプレートと同様に、転送元と転送先を分離する。複数行SQLは必ず`sql` fenced code blockで出力し、SQL内容を自動変更しない。

## 18. Check.md

### Main content

1. `### 4.1 Validation target context`
2. `### 4.2 Validation table`

### 標準表

| No. | Check Item | Type | Detail | Message ID | Message Arguments |
| --- | --- | --- | --- | --- | --- |

表枠自体に意味があるため、互換モードではデータがなくてもヘッダーを保持する。

## 19. Others.md

### Main content

1. `### 4.1 Shared constants/definitions`
2. `### 4.2 Option/function key/helper mappings`
3. `### 4.3 Supplemental operational notes`

## 20. Footnote.md

### Main content

1. `### 4.1 Reference terms and annotations`
2. `### 4.2 Abbreviations/codes`
3. `### 4.3 Supplemental notes`

AIやツールによる用語説明の自動追加は行わない。

## 21. 文字とMarkdown整形

- 文字コード：UTF-8
- 改行：LF
- ファイル末尾：改行あり
- 見出し前後：空行を1行
- Markdown表：ヘッダー区切り必須
- 表セル内の`|`：エスケープ
- 複数行SQL：`sql`コードブロック
- 通常コード：言語が判明する場合は言語名を付与
- 入力文言の業務的な意味を変更しない
- 利用者の文章を勝手に要約しない

## 22. 相互参照

`sheets`内の設計書同士は、同階層の相対リンクを使用する。

```markdown
[Check.md](Check.md)
```

READMEからは`sheets/`付きの相対リンクを使用する。

```markdown
[sheets/Check.md](sheets/Check.md)
```

未選択ファイルへのリンクは生成しない。

## 23. テンプレートバージョン

- マニフェストに`templateVersion`を持つ。
- 生成ファイルのDocument metadataへバージョンを出力する。
- 見出し、表ヘッダー、解釈規則を変更した場合はバージョンを更新する。
- 文言修正のみの場合はパッチバージョン、互換性のある項目追加はマイナーバージョン、解析互換性を壊す変更はメジャーバージョンを上げる。

## 24. 禁止事項

- 選択されていない設計書の生成
- README以外のルート直下配置
- 入力されていない要件の推測
- SQLロジックの変更
- リンク先が存在しない相互参照
- README索引と実ファイルの不一致
- テンプレートとコードへの見出し構造の二重管理
