# Docs Generator システム設計書

## 1. システム概要

Docs Generatorは、ブラウザ上で一機能分の設計情報を入力し、規定構成のMarkdown設計書パッケージを生成する静的Webアプリケーションとする。

初期実装ではバックエンド、データベース、ログイン機能を持たない。入力内容はブラウザ内だけで扱い、設計情報を外部へ送信しない。

## 2. 重要設計方針

### 2.1 テンプレートを正本とする

- 見出し、セクション順、表ヘッダー、ファイル名は`templates/`を基準とする。
- Excel抽出用の項目だけをMarkdown直接作成用へ変更する。
- 生成ロジックへ同じ見出しを重複して定義しない。
- テンプレート変更をGitで履歴管理する。

### 2.2 単純置換だけを使用する

テンプレートは次の形式のトークンを持つ。

```text
{{SYSTEM_NAME}}
{{FUNCTION_ID}}
{{FUNCTION_NAME}}
{{HIST_ROWS}}
{{SQL_BLOCKS}}
```

- 単一値は文字列置換する。
- 表はTypeScriptでMarkdown行を作成して差し込む。
- 複数処理はTypeScriptでMarkdownブロックを作成して差し込む。
- 条件分岐や繰り返し構文を持つ独自テンプレート言語は作成しない。
- Handlebarsなどのテンプレートエンジンは使用しない。

### 2.3 1画面、1状態、1下書きとする

- 画面遷移を設けない。
- 画面状態は1つの`DesignPackage`オブジェクトで保持する。
- Local Storageの保存スロットは1件だけとする。
- プロジェクト一覧や複数下書き管理は行わない。

## 3. 技術構成

| 分類 | 採用内容 | 用途 |
| --- | --- | --- |
| Build | Vite | 開発とビルド |
| Language | TypeScript | 画面、モデル、生成処理 |
| UI | HTML、CSS、DOM API | 1画面フォーム |
| Template import | Vite raw import | Markdownテンプレート読込 |
| ZIP | JSZip | Markdownと画像の一括出力 |
| Draft save | Local Storage | 文字入力の自動保存 |
| Test | Vitest | 生成処理とZIP構成のテスト |

初期実装では次を導入しない。

- Vue、Reactなどのフレームワーク
- Piniaなどの状態管理ライブラリ
- Router
- Zod
- Handlebars
- IndexedDB、Dexie
- Markdownパーサー
- File System Access API
- Playwright

## 4. システム構成

```text
利用者
  │
  ▼
1画面フォーム
  ├── 共通情報入力
  ├── 設計書選択
  ├── 設計書固有入力
  ├── Markdownソースプレビュー
  └── ZIP出力
  │
  ▼
DesignPackage
  ├── common
  ├── selectedDocuments
  └── documents
  │
  ├──────────────┬────────────────┐
  ▼              ▼                ▼
Local Storage   Template Renderer Image Assets
  │              │                │
  │              ▼                │
  │        README + sheets/*.md   │
  │              │                │
  └──────────────┴────────────────┘
                 │
                 ▼
               JSZip
```

## 5. リポジトリ構成

```text
/
├── docs/
│   ├── README.md
│   ├── 01_PRODUCT_REQUIREMENTS.md
│   ├── 02_FUNCTIONAL_DESIGN.md
│   ├── 03_SYSTEM_DESIGN.md
│   ├── 04_MARKDOWN_OUTPUT_SPEC.md
│   ├── 05_IMPLEMENTATION_PLAN.md
│   ├── 06_TEST_PLAN.md
│   ├── 07_IMAGE_ASSET_SPEC.md
│   └── 08_IMAGE_IMPLEMENTATION_PLAN.md
├── templates/
│   ├── README_TEMPLATE.md
│   └── sheets/
│       └── 12種類の設計書テンプレート
├── index.html
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── model.ts
│   ├── documentDefinitions.ts
│   ├── templateLoader.ts
│   ├── markdownGenerator.ts
│   ├── imageAssets.ts
│   ├── zipExporter.ts
│   ├── storage.ts
│   └── style.css
└── tests/
    ├── markdownGenerator.test.ts
    ├── imageAssets.test.ts
    └── templateValidation.test.ts
```

初期実装では、上記より細かくファイルを分割しない。

## 6. データモデル

### 6.1 DesignPackage

```ts
interface DesignPackage {
  schemaVersion: string;
  common: CommonMetadata;
  selectedDocuments: DocumentType[];
  documents: DocumentDataMap;
}
```

### 6.2 CommonMetadata

```ts
interface CommonMetadata {
  systemName: string;
  moduleName: string;
  moduleId: string;
  functionId: string;
  functionName: string;
  summary: string;
  documentNumber: string;
  date: string;
  revision: string;
  author: string;
  notes: string;
}
```

### 6.3 DocumentType

```ts
type DocumentType =
  | "Hist"
  | "Outline_A"
  | "Outline_B"
  | "S-Layout"
  | "R-Layout"
  | "FuncSpec"
  | "Event"
  | "FuncDetail"
  | "Relation"
  | "Check"
  | "Others"
  | "Footnote";
```

### 6.4 DocumentDataMap

各設計書のデータは、設計書名をキーとするオブジェクトへ保持する。

```ts
interface DocumentDataMap {
  Hist?: HistData;
  Outline_A?: OutlineAData;
  Outline_B?: OutlineBData;
  "S-Layout"?: ScreenLayoutData;
  "R-Layout"?: ReportLayoutData;
  FuncSpec?: FuncSpecData;
  Event?: EventData;
  FuncDetail?: FuncDetailData;
  Relation?: RelationData;
  Check?: CheckData;
  Others?: OthersData;
  Footnote?: FootnoteData;
}
```

画面状態とLocal Storage保存形式で同じモデルを使用する。複雑な中間モデルを作らない。

## 7. 設計書定義

`documentDefinitions.ts`へ、設計書順、初期選択、テンプレートパス、出力パスだけを静的に定義する。

```ts
interface DocumentDefinition {
  type: DocumentType;
  templatePath: string;
  outputPath: string;
  selectedByDefault: boolean;
  order: number;
}
```

JSONマニフェストやフォームスキーマエンジンは作成しない。

## 8. テンプレート読込

Viteのraw importを使用する。

```ts
import readmeTemplate from "../templates/README_TEMPLATE.md?raw";
import histTemplate from "../templates/sheets/Hist.md?raw";
```

13個のテンプレートを`templateLoader.ts`で`DocumentType`と関連付ける。

## 9. Markdown生成

### 9.1 生成手順

1. 共通入力を検証する。
2. 選択済み設計書を定義順に並べる。
3. 共通トークンを置換する。
4. 設計書固有の表行とブロックを生成する。
5. 固有トークンを置換する。
6. 未置換トークンを検出する。
7. README索引を生成する。
8. 生成ファイルと索引を照合する。
9. ZIPへ格納する。

### 9.2 置換

```ts
function replaceTokens(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}
```

### 9.3 未置換検証

生成後に次へ一致する文字列が残っている場合、出力を停止する。

```regex
{{[A-Z0-9_]+}}
```

## 10. Markdown表生成

- 見出しはテンプレートに固定する。
- 行だけをTypeScriptで生成する。
- セル内の`|`を`\|`へ変換する。
- セル内の改行を`<br>`へ変換する。
- 入力順を維持する。
- No.列は必要な表だけ自動採番する。

## 11. SQL生成

SQLが入力されている場合だけ、次の形式で生成する。

```markdown
```sql
SELECT ...
```
```

SQLのインデント、改行、内容を変更しない。

## 12. 画像処理

画像処理は`imageAssets.ts`へ集約する。

- 対象はS-LayoutとR-Layoutだけとする。
- PNG、JPEG、WebPだけを許可する。
- Fileオブジェクトをメモリ上で保持する。
- `URL.createObjectURL`でサムネイルを表示する。
- ZIPへバイナリのまま追加する。
- Local Storageへ画像バイナリを保存しない。
- 詳細は`07_IMAGE_ASSET_SPEC.md`に従う。

## 13. Local Storage

保存対象は、画像ファイル本体を除く`DesignPackage`とする。

- 入力変更後に短いデバウンスで保存する。
- 保存キーは1つだけとする。
- 画面起動時に復元する。
- schemaVersionが一致しない場合は破棄確認を表示する。
- 入力クリア時に削除する。

## 14. ZIP生成

```ts
type GeneratedFile = GeneratedTextFile | GeneratedBinaryFile;

interface GeneratedTextFile {
  kind: "text";
  path: string;
  content: string;
}

interface GeneratedBinaryFile {
  kind: "binary";
  path: string;
  content: Blob;
}
```

- MarkdownはUTF-8で格納する。
- READMEはルートへ格納する。
- その他のMarkdownは`sheets/`へ格納する。
- レイアウト画像は`sheets/S-Layout/`または`sheets/R-Layout/`へ格納する。
- 画像がない場合は画像フォルダを作成しない。

## 15. セキュリティ

- 入力値をHTMLとして実行しない。
- 外部URL画像を読み込まない。
- 画像ファイル名から`../`と絶対パスを除去する。
- 対応外MIME typeを拒否する。
- ZIP内のパスをアプリ側で固定生成する。

## 16. 将来拡張

MVP完成後に必要性が確認された場合だけ検討する。

- JSONインポート、エクスポート
- 複数下書き
- Markdown再読込
- HTMLレンダリングプレビュー
- GitHub連携
- AI入力支援
- IndexedDB画像保存

将来機能を理由に初期実装を複雑化しない。
