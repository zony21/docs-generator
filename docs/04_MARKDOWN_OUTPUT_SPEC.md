# Docs Generator Markdown出力仕様

## 1. 目的

本仕様は、一機能ごとに生成するMarkdown設計書パッケージのフォルダ、ファイル、順序、共通構造、画像参照、空欄処理を定義する。

生成形式の正本はリポジトリ直下の`templates/`とする。

## 2. 出力単位

- 一回の出力対象は一機能とする。
- 一機能につき一つのルートフォルダを生成する。
- `README.md`だけをルート直下へ配置する。
- その他のMarkdownはすべて`sheets/`へ配置する。

## 3. ルートフォルダ名

```text
<機能ID>_<機能名>
```

ファイル名に使用できない文字は`_`へ置換する。

対象文字:

```text
/ \ : * ? " < > |
```

機能IDまたは機能名が空の場合は出力しない。

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
    ├── S-Layout.md
    ├── S-Layout/
    │   └── screen-overview.png
    ├── R-Layout.md
    ├── R-Layout/
    │   └── report-sample.png
    └── 選択された追加設計書.md
```

画像フォルダは画像が存在する場合だけ生成する。

## 5. 設計書区分

### 5.1 基本6設計書

初期選択する。

1. `Hist.md`
2. `Outline_A.md`
3. `Outline_B.md`
4. `FuncSpec.md`
5. `FuncDetail.md`
6. `Relation.md`

### 5.2 条件付き6設計書

利用者が必要な場合だけ選択する。

1. `S-Layout.md`
2. `R-Layout.md`
3. `Event.md`
4. `Check.md`
5. `Others.md`
6. `Footnote.md`

未選択の設計書は生成しない。

## 6. 出力順

README索引と画面上の表示順は次とする。

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
3. `## Document information`
4. `## Sheet index`
5. `## Notes`

### 7.2 タイトル

```markdown
# <機能ID> <機能名> 設計書
```

### 7.3 Sheet index

```markdown
| Sheet | Design document |
| --- | --- |
| Hist | [sheets/Hist.md](sheets/Hist.md) |
```

実際に生成したファイルだけを掲載し、索引と実ファイルを1対1で一致させる。

## 8. 各設計書の共通構造

```markdown
# <DocumentType>

## 1. Document metadata

## 2. Common metadata

## 3. Document summary

## 4. Main content
```

Excel抽出元を表す項目は出力しない。

次へ置き換える。

- Package
- Document
- File
- Generated at
- Function ID
- Function Name

## 9. 共通メタデータ

- System Name
- Module Name
- Module ID
- Function ID
- Function Name
- Date
- Rev
- Doc Number
- Author

共通情報は利用者が一度だけ入力し、選択された全設計書へ反映する。

## 10. Hist.md

### Main content

1. `### 4.1 Revision history`
2. 改訂履歴表
3. `### 4.2 Additional notes`

表:

| Creation/Update Date | Author | Rev. | Target Sheet/Area | Change Note | Approval Date | Approval By |
| --- | --- | --- | --- | --- | --- | --- |

## 11. Outline_A.md

1. `### 4.1 System/module purpose`
2. `### 4.2 Scope and target users/process`
3. `### 4.3 High-level operation flow`
4. `### 4.4 Preconditions/postconditions`

フローは入力順を維持して番号付きリストへ変換する。

## 12. Outline_B.md

1. `### 4.1 Processing style/classification`
2. `### 4.2 CRUD / operation categories`
3. `### 4.3 Related tables/masters/interfaces`
4. `### 4.4 Operational constraints and remarks`

## 13. S-Layout.md

1. `### 4.1 Screen sections/areas`
2. `### 4.2 Control list`
3. `### 4.3 Control properties`
4. `### 4.4 Display/edit rules`
5. 画像がある場合だけ`### 4.5 Layout images`

画像参照例:

```markdown
![画面全体](./S-Layout/screen-overview.png)
```

## 14. R-Layout.md

1. `### 4.1 Layout blocks and areas`
2. `### 4.2 Output/display item list`
3. `### 4.3 Column-level definitions`
4. `### 4.4 Rendering/output behavior notes`
5. 画像がある場合だけ`### 4.5 Layout images`

画像参照例:

```markdown
![帳票出力例](./R-Layout/report-sample.png)
```

## 15. FuncSpec.md

1. `### 4.1 Screen/function unit`
2. `### 4.2 Trigger/timing`
3. `### 4.3 Action details`

各アクションに次を出力する。

1. Intent
2. Major steps
3. Success path
4. Error/interruption path

入力されていないエラー処理を補完しない。

## 16. Event.md

1. `### 4.1 Event list`
2. イベント一覧表
3. `### 4.2 Additional event notes`

表:

| Event Name | Trigger | Target Function/Process | Remarks |
| --- | --- | --- | --- |

## 17. FuncDetail.md

1. `### 4.1 Processing units`
2. `### 4.2 Internal flow`
3. `### 4.3 Cross references`

`try`、`catch`、`finally`は入力がある部分だけ出力する。

## 18. Relation.md

1. `### 4.1 Transfer Source`
2. `### 4.2 Transfer Destination`
3. `### 4.3 SQL definition`

Transfer SourceとTransfer Destinationを分離する。

複数行SQLは`sql`コードフェンスへ入れ、内容を変更しない。

## 19. Check.md

1. `### 4.1 Validation target context`
2. `### 4.2 Validation table`

表:

| No. | Check Item | Type | Detail | Message ID | Message Arguments |
| --- | --- | --- | --- | --- | --- |

## 20. Others.md

1. `### 4.1 Shared constants/definitions`
2. `### 4.2 Option/function key/helper mappings`
3. `### 4.3 Supplemental operational notes`

## 21. Footnote.md

1. `### 4.1 Reference terms and annotations`
2. `### 4.2 Abbreviations/codes`
3. `### 4.3 Supplemental notes`

入力されていない用語説明を追加しない。

## 22. 空欄処理

- 未選択設計書は生成しない。
- 任意の単一値は空文字へ置換する。
- 空の本文は空文字へ置換する。
- 表の見出しはテンプレートに残す。
- EventとCheckはデータ行がなくても表見出しを残せる。
- 画像がない場合は画像セクションと画像フォルダを生成しない。
- 生成物へテンプレートトークンを残さない。

Excel抽出用の`No concrete entries in source sheet.`は使用しない。

## 23. Markdown整形

- 文字コード: UTF-8
- 改行: LF
- ファイル末尾: 改行あり
- 表セル内の`|`: `\|`へ変換
- 表セル内の改行: `<br>`へ変換
- SQL: 改行とインデントを維持
- ファイル間リンク: 相対パス
- 入力文章: 自動要約、補完、言い換えを行わない

## 24. 検証

ZIP出力前に次を検証する。

- README索引とMarkdownファイルが一致する。
- 未置換トークンがない。
- Markdownが`sheets/`以外へ出力されていない。
- 画像参照先がZIP内に存在する。
- ZIP内の画像が正しい同名フォルダにある。
