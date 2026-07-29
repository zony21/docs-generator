# 非正本テンプレート（参照禁止）

この`docs/templates/`は設計検討中に作成された作業用テンプレートであり、Docs Generatorの実装では使用しない。

正式なテンプレートは、リポジトリ直下の次のディレクトリを正本とする。

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

## 実装ルール

- 実装はルート`templates/`だけを読み込む。
- `docs/templates/`内のMarkdownと`template-manifest.json`は読み込まない。
- 出力形式の判断は、ルート`templates/`と`docs/04_MARKDOWN_OUTPUT_SPEC.md`を参照する。
- ルート`templates/`は単純トークン置換方式を使用する。
- S-LayoutとR-Layoutの画像は`{{LAYOUT_IMAGE_SECTION}}`へ差し込む。

この作業用ディレクトリは、正式テンプレートへの移行確認後に削除対象とする。
