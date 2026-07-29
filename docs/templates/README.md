# Docs Generator テンプレート

## 1. 役割

本ディレクトリのMarkdownテンプレートを、Docs Generatorが生成する設計書構造の正本とする。

提供された設計書テンプレートの見出し、表、順序を極力維持し、Excel抽出用の表現だけをMarkdown直接作成用へ変更している。

## 2. 構成

```text
templates/
├── README.md
├── template-manifest.json
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

## 3. 基本設計書

次の6種類は新規機能作成時に選択済みとする。

- Hist
- Outline_A
- Outline_B
- FuncSpec
- FuncDetail
- Relation

## 4. 条件付き設計書

次は機能に必要な場合だけ選択する。

- S-Layout
- R-Layout
- Event
- Check
- Others
- Footnote

## 5. テンプレート記法

テンプレートはHandlebars記法を使用する。

```handlebars
{{common.systemName}}

{{#each rows}}
| {{name}} | {{value}} |
{{/each}}
```

複雑な業務ロジックはテンプレートへ記載せず、フォームスキーマから出力用コンテキストへ変換する。

## 6. 画像

画像は対象Markdown名と同じフォルダへ出力する。

```text
sheets/
├── S-Layout.md
└── S-Layout/
    └── screen-overview.png
```

Markdownからは次のように参照する。

```markdown
![画面全体](S-Layout/screen-overview.png)
```

## 7. 変更ルール

- 見出し、表ヘッダー、セクション順を変更した場合は`templateVersion`を更新する。
- テンプレートとアプリケーションコードへ見出しを二重定義しない。
- テンプレート変更時はゴールデンファイルテストを更新する。
- 未入力要件をテンプレート側で補完しない。
- SQLをテンプレートまたは生成処理で書き換えない。
