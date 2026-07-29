# Docs Generator システム設計書

## 1. システム概要

Docs Generatorは、ブラウザ上で一機能分の設計情報を入力し、規定構成のMarkdown設計書パッケージを生成するローカルファーストWebアプリケーションとする。

提供済みMarkdownテンプレートを生成結果の基準とし、Excelを介さず、テンプレートとほぼ同じ構造・表・見出しを持つ設計書を直接生成する。

初期実装ではバックエンドを持たず、入力内容はブラウザ内に保存する。設計内容を外部サーバーへ送信しない。

## 2. 重要設計方針

### 2.1 テンプレートを正本とする

- 見出し、セクション順、表ヘッダー、出力ファイル名はテンプレートを基準とする。
- Markdown生成ロジックへ同じ見出しを直接ハードコードしない。
- テンプレート変更時は、可能な限りアプリケーションコードを変更せず出力へ反映できるようにする。
- 提供されたテンプレートの構造を保ちつつ、Excel抽出用の文言だけをMarkdown直接作成用へ置き換える。

### 2.2 フォーム定義とテンプレートを関連付ける

テンプレートだけでは入力部品、必須判定、候補値、繰り返し行を定義できないため、`template-manifest.json`を併用する。

```text
template-manifest.json
        ├── 設計書の順序
        ├── 基本・条件付き区分
        ├── 機能種別ごとの推奨
        ├── テンプレートパス
        ├── 出力パス
        └── フォームスキーマID
                  │
                  ▼
            Form Schema
                  │
                  ├── 入力画面
                  ├── 検証
                  └── Template Context
                              │
                              ▼
                      Markdown Template
                              │
                              ▼
                        Generated Markdown
```

### 2.3 出力互換性をテストで保証する

- 各テンプレートに代表入力データを適用したゴールデンファイルを用意する。
- 生成結果をスナップショット比較する。
- 見出し順、表ヘッダー、相対リンク、空欄処理が変わった場合はテストで検知する。
- テンプレート変更時は`templateVersion`を更新する。

## 3. 技術構成

| 分類 | 採用候補 | 用途 |
| --- | --- | --- |
| Frontend | Vue 3 | 画面とコンポーネント |
| Language | TypeScript | 型安全な実装 |
| Build | Vite | 開発・ビルド |
| State | Pinia | 編集中プロジェクトとUI状態 |
| Validation | Zod | 入力モデル、フォーム、インポート検証 |
| Template Engine | Handlebars | Markdownテンプレート展開 |
| Markdown Preview | markdown-it | プレビュー表示 |
| ZIP | JSZip | パッケージの一括出力・読込 |
| Local DB | IndexedDB | 自動保存、最近使った設計、プリセット |
| IndexedDB wrapper | Dexie | IndexedDB操作の簡略化 |
| Direct save | File System Access API | 対応ブラウザでのフォルダ保存 |
| Unit test | Vitest | ロジック・生成処理のテスト |
| Component test | Vue Test Utils | UIコンポーネントテスト |
| E2E | Playwright | 作成から出力までの操作テスト |
| Lint/Format | ESLint / Prettier | コード品質の統一 |

## 4. システム構成

```text
利用者
  │
  ▼
Vue UI
  ├── 基本情報入力
  ├── 設計書選択
  ├── 設計内容入力
  ├── プレビュー
  └── 出力
  │
  ▼
Application Services
  ├── ProjectService
  ├── RecommendationService
  ├── ValidationService
  ├── TemplateService
  ├── ImportService
  └── ExportService
  │
  ▼
Domain Model
  ├── FeatureDocumentProject
  ├── CommonMetadata
  ├── DocumentSelection
  └── 各設計書モデル
  │
  ├─────────────┬────────────────────┐
  ▼             ▼                    ▼
IndexedDB   Template Registry   Markdown Parser
                │                    │
                ▼                    ▼
       Handlebars Templates   再編集用モデル
                │
                ▼
          README.md + sheets/*.md
                │
       ┌────────┴────────┐
       ▼                 ▼
    ZIP出力        フォルダ直接保存
```

## 5. ソース構成

```text
src/
├── app/                    # ルーター、アプリ初期化
├── pages/                  # 画面単位
├── components/             # 共通UI部品
├── features/               # 設計書別入力機能
├── domain/                 # ドメイン型・ルール
├── application/            # ユースケース、サービス
├── infrastructure/         # IndexedDB、ZIP、File System API
├── templates/              # ビルド時に取り込むテンプレート
├── template-registry/      # マニフェスト、フォーム定義
├── generators/             # テンプレート展開と出力整形
├── parsers/                # Markdown再読込処理
└── validation/             # 検証ルール

docs/templates/
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

`docs/templates`を人間が確認する正本とし、ビルド時に`src/templates`から参照またはコピーする。

## 6. ドメインモデル

### 6.1 FeatureDocumentProject

```ts
interface FeatureDocumentProject {
  id: string;
  schemaVersion: string;
  templateVersion: string;
  common: CommonMetadata;
  featureType: FeatureType;
  selectedDocuments: DocumentType[];
  documents: DocumentDataMap;
  unknownBlocks: ImportedUnknownBlock[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  lastExportedAt?: string;
}
```

### 6.2 CommonMetadata

```ts
interface CommonMetadata {
  systemName: string;
  moduleName?: string;
  moduleId?: string;
  featureId: string;
  featureName: string;
  author: string;
  date: string;
  revision: string;
  documentNumber?: string;
  summary: string;
  outputLanguage: "ja" | "en";
}
```

共通メタデータは各設計書モデルへ複製せず、生成時にテンプレートコンテキストへ注入する。

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

### 6.4 FeatureType

```ts
type FeatureType =
  | "screen"
  | "api"
  | "batch"
  | "report"
  | "common"
  | "other";
```

## 7. テンプレートマニフェスト

マニフェストは、テンプレートの構成とアプリケーション機能を接続する。

```ts
interface TemplateManifest {
  schemaVersion: string;
  templateVersion: string;
  rootTemplate: string;
  documents: TemplateDocumentDefinition[];
  recommendationRules: RecommendationRule[];
}

interface TemplateDocumentDefinition {
  type: DocumentType;
  displayName: string;
  templatePath: string;
  outputPath: string;
  formSchemaId: string;
  requiredByDefault: boolean;
  order: number;
}
```

### 7.1 マニフェストで管理する内容

- ルートREADMEテンプレート
- 設計書の出力順
- 基本6設計書
- 条件付き6設計書
- テンプレートパス
- 出力先パス
- フォームスキーマとの関連
- 機能種別ごとの推奨ルール
- テンプレートバージョン

## 8. フォームスキーマ

テンプレート中のプレースホルダーへ、どの入力値を渡すかを定義する。

```ts
interface FormSchema<T> {
  id: string;
  createDefault(common: CommonMetadata): T;
  fields: FieldDefinition[];
  validate(data: T, context: ValidationContext): ValidationIssue[];
  toTemplateContext(data: T, common: CommonMetadata): Record<string, unknown>;
  fromParsedMarkdown(parsed: ParsedMarkdown): ParseResult<T>;
}
```

### 8.1 入力部品

- text
- textarea
- select
- checkbox
- date
- code/sql
- repeatable table
- ordered steps
- document reference selector

## 9. Markdown生成処理

### 9.1 生成手順

1. プロジェクト全体を検証する。
2. 選択済み設計書をマニフェスト順に並べる。
3. 各フォームモデルをテンプレートコンテキストへ変換する。
4. 対応するMarkdownテンプレートをHandlebarsで展開する。
5. 空行、表、コードブロックを出力整形する。
6. 生成したファイル一覧をREADMEテンプレートへ渡す。
7. 相対リンクとファイル一覧を再検証する。
8. UTF-8/LFでZIPまたはフォルダへ出力する。

### 9.2 生成結果モデル

```ts
interface GeneratedPackage {
  folderName: string;
  templateVersion: string;
  files: GeneratedFile[];
  generatedAt: string;
}

interface GeneratedFile {
  path: string;
  content: string;
  documentType?: DocumentType;
}
```

### 9.3 Handlebarsヘルパー

必要最小限のヘルパーだけを用意する。

- `orDash`: 空値を`-`へ変換
- `join`: 配列の結合
- `markdownCell`: 表セル用エスケープ
- `hasRows`: 有効な行の有無
- `number`: 自動採番
- `relativeLink`: 設計書間リンク
- `formatDateTime`: 日時整形

テンプレート内へ複雑な業務ロジックを記述しない。

## 10. 空欄処理

### 10.1 基本方針

- 未選択の設計書は生成しない。
- 選択済み設計書の主要内容がすべて空の場合は警告する。
- 表枠自体に意味がある`Check`と`Event`は、設定により空の表枠を残せる。
- 任意セクションは内容がなければ見出しごと省略できる。
- 共通メタデータの空値は、テンプレート規則に従って`-`または空欄にする。

### 10.2 元テンプレートとの互換

提供テンプレートにあった次のExcel依存項目は直接作成向けへ変換する。

| 元項目 | 新項目 |
| --- | --- |
| Source workbook | Package name |
| Source sheet | Document type |
| Original extraction file | Output file |
| Extracted at | Generated at |
| as written in Excel | Document summary |
| verbatim from Excel | Main content |
| No concrete entries in source sheet. | No concrete entries. |

それ以外の設計書固有見出しと表構造は極力維持する。

## 11. 保存方式

### 11.1 IndexedDB

次を保存する。

- 編集中プロジェクト
- 最近開いたプロジェクト
- プロジェクトプリセット
- UIの折りたたみ状態
- 最終出力情報

### 11.2 自動保存

1. 入力変更をPiniaへ反映する。
2. 500msデバウンスする。
3. Zodで保存モデルを検証する。
4. IndexedDBへトランザクション保存する。
5. 保存状態をヘッダーへ表示する。

## 12. Markdown再読込

### 12.1 方針

Markdownが正式な設計書であるため、アプリ固有JSONを出力パッケージの必須ファイルにはしない。

規定見出し、表ヘッダー、テンプレートバージョンから入力モデルへ復元する。

### 12.2 解析対象

- H1/H2/H3/H4見出し
- Markdown表
- 箇条書き
- 番号付きリスト
- fenced code block
- 設計書間リンク
- 未知ブロック

### 12.3 ラウンドトリップ保護

- 解析できない内容は`unknownBlocks`へ保持する。
- 再出力時に不明内容を削除しない。
- 重大な構造変更がある場合は上書き前に警告する。
- 必要に応じて非表示MarkdownコメントのブロックIDを利用する。

```md
<!-- docs-generator:block-id=funcspec-unit-01 -->
```

コメントを削除しても、通常のMarkdown設計書として成立することを条件とする。

## 13. セキュリティ

- Markdownプレビューで生HTMLを無効化する。
- HTMLを許可する将来拡張では必ずサニタイズする。
- インポートZIPのパストラバーサルを防止する。
- ファイル数、ファイルサイズ、展開後サイズに上限を設ける。
- ファイル名を正規化する。
- 入力データを外部へ送信しない。

## 14. 拡張方針

将来は次を追加可能な構成とする。

- テンプレートエディタ
- プロジェクト独自テンプレート
- GitHubへの直接出力
- AI入力支援
- 承認ワークフロー
- 複数機能パッケージの一括管理
- 文書間参照グラフ

拡張時も、Markdownが正本である原則を維持する。
