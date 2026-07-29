# Docs Generator 画像添付仕様

## 1. 目的

画面レイアウト、帳票レイアウト、処理図などをMarkdown設計書へ画像として添付できるようにする。

画像はMarkdownファイルと同じ`sheets`階層で管理し、対象Markdownファイル名と同名のフォルダへ格納する。これにより、設計書と画像の対応をファイル構造だけでも判別できるようにする。

## 2. 基本フォルダ構成

### 2.1 S-Layoutへ画像を添付する場合

```text
<機能ID>_<機能名>/
├── README.md
└── sheets/
    ├── S-Layout.md
    └── S-Layout/
        ├── screen-overview.png
        ├── search-area.png
        └── result-grid.png
```

`S-Layout.md`からは次の相対パスで参照する。

```markdown
![画面全体](S-Layout/screen-overview.png)
```

### 2.2 R-Layoutへ画像を添付する場合

```text
<機能ID>_<機能名>/
├── README.md
└── sheets/
    ├── R-Layout.md
    └── R-Layout/
        ├── report-page-1.png
        └── report-page-2.png
```

```markdown
![帳票1ページ目](R-Layout/report-page-1.png)
```

### 2.3 任意の設計書へ画像を添付する場合

画像格納フォルダ名は、対象Markdownの拡張子を除いたファイル名と完全一致させる。

```text
sheets/
├── FuncDetail.md
└── FuncDetail/
    └── processing-flow.svg
```

```markdown
![処理フロー](FuncDetail/processing-flow.svg)
```

初期UIでは`S-Layout`と`R-Layout`を優先対応し、内部モデルと出力処理は全設計書で画像を扱える共通仕様とする。

## 3. 画像格納ルール

- 画像は対象Markdownと同じ`sheets`階層にある同名フォルダへ格納する。
- 画像が1件もない場合は画像フォルダを生成しない。
- 一つの画像ファイルを複数設計書から共有しない。
- 同じ画像が複数設計書で必要な場合は、各設計書の画像フォルダへ複製する。
- README直下に画像を置かない。
- `sheets/images`のような共通画像フォルダは使用しない。
- Markdownからは相対パスだけを使用する。
- Windowsの区切り文字`\`ではなく`/`を使用する。

## 4. 対応形式

初期実装で対応する形式は次とする。

| 形式 | 拡張子 | 用途 |
| --- | --- | --- |
| PNG | `.png` | 画面キャプチャ、レイアウト図 |
| JPEG | `.jpg`, `.jpeg` | 写真、圧縮画像 |
| WebP | `.webp` | 軽量画像 |
| SVG | `.svg` | ベクター図、構成図 |

GIFは静止画として表示される環境差があるため初期対象外とする。BMP、TIFF、PDFは画像添付対象外とする。

## 5. 制限

初期値は次とする。設定値は将来変更可能とする。

- 1ファイル最大：10MB
- 一設計書最大：30ファイル
- 一機能パッケージ最大：100MB
- 画像の最大辺：制限しないが、8000px超は警告
- ファイル名最大：100文字

制限超過時は出力前にエラーまたは警告を表示する。

## 6. 画像入力モデル

```ts
interface DocumentImageAsset {
  id: string;
  documentType: DocumentType;
  originalFileName: string;
  outputFileName: string;
  mimeType: SupportedImageMimeType;
  size: number;
  width?: number;
  height?: number;
  altText: string;
  caption?: string;
  sectionId?: string;
  relatedItemId?: string;
  order: number;
  data: Blob;
  createdAt: string;
  updatedAt: string;
}
```

### 6.1 項目説明

| 項目 | 内容 |
| --- | --- |
| documentType | 画像を表示する設計書 |
| originalFileName | 利用者がアップロードした元ファイル名 |
| outputFileName | 正規化・重複回避後の出力ファイル名 |
| altText | Markdown画像構文の代替テキスト |
| caption | 画像下部へ出力する説明文 |
| sectionId | 表示対象セクション |
| relatedItemId | 画面領域、レイアウトブロックなどとの関連ID |
| order | 同一セクション内の表示順 |
| data | IndexedDBへ保存する画像データ |

## 7. 画面操作

### 7.1 追加方法

- ファイル選択
- ドラッグ&ドロップ
- クリップボードから貼り付け

S-LayoutとR-Layoutの編集画面に「画像を追加」領域を設ける。

### 7.2 追加時の入力

画像追加後、次を編集できる。

- 代替テキスト
- キャプション
- 表示するセクション
- 関連する画面領域またはレイアウトブロック
- 表示順
- 出力ファイル名

代替テキストは必須とする。画像ファイル名から初期候補を自動生成するが、利用者が確認・修正できるようにする。

### 7.3 一覧操作

- サムネイル表示
- 拡大プレビュー
- 並び替え
- ファイル名変更
- 代替テキスト編集
- キャプション編集
- 関連対象変更
- 置換
- 削除

削除はUndo可能とする。

### 7.4 省操作

- ドロップした順序を初期表示順にする。
- 元ファイル名から安全な出力名を自動生成する。
- 重複時は`-2`、`-3`を自動付与する。
- S-Layoutでは選択中の画面領域を関連先の初期値にする。
- R-Layoutでは選択中のレイアウトブロックを関連先の初期値にする。
- クリップボード画像には`image-001.png`形式の名前を自動付与する。

## 8. ファイル名正規化

### 8.1 規則

- 前後の空白を削除する。
- `/`、`\`、`:`, `*`, `?`, `"`, `<`, `>`, `|`を`-`へ置換する。
- 制御文字を除去する。
- 連続する空白を`-`へ置換する。
- 連続する`-`を一つにする。
- 拡張子は小文字へ統一する。
- ファイル名本体が空になった場合は`image`を使用する。
- 同一フォルダ内で大文字小文字を無視して重複しないようにする。

### 8.2 例

| 元ファイル名 | 出力ファイル名 |
| --- | --- |
| `画面 全体.PNG` | `画面-全体.png` |
| `検索/条件.png` | `検索-条件.png` |
| `screen.png`、2件目 | `screen-2.png` |
| クリップボード画像 | `image-001.png` |

## 9. Markdown出力

### 9.1 標準形式

```markdown
### 4.1 Screen image

![検索画面全体](S-Layout/screen-overview.png)

検索条件エリアと検索結果エリアを含む画面全体。
```

### 9.2 複数画像

```markdown
#### 画面全体

![画面全体](S-Layout/screen-overview.png)

#### 検索条件エリア

![検索条件エリア](S-Layout/search-area.png)
```

### 9.3 キャプション

標準Markdownには正式なキャプション構文がないため、画像の次の段落として出力する。

```markdown
![画面全体](S-Layout/screen-overview.png)

画面全体の配置イメージ。
```

生HTMLの`figure`と`figcaption`は使用しない。

### 9.4 画像セクション位置

`S-Layout.md`のMain contentは次を標準とする。

1. `### 4.1 Screen images`
2. `### 4.2 Screen sections/areas`
3. `### 4.3 Control list`
4. `### 4.4 Control properties`
5. `### 4.5 Display/edit rules`

`R-Layout.md`のMain contentは次を標準とする。

1. `### 4.1 Layout images`
2. `### 4.2 Layout blocks and areas`
3. `### 4.3 Output/display item list`
4. `### 4.4 Column-level definitions`
5. `### 4.5 Rendering/output behavior notes`

画像がない場合は、互換モードでは画像セクションを残して`No images attached.`と出力し、簡潔モードでは画像セクション自体を省略できる。

## 10. テンプレート仕様

テンプレートでは画像配列を繰り返し展開する。

```handlebars
{{#if images.length}}
### 4.1 Screen images

{{#each images}}
{{#if title}}
#### {{title}}

{{/if}}
![{{altText}}]({{relativePath}})
{{#if caption}}

{{caption}}
{{/if}}

{{/each}}
{{/if}}
```

画像のバイナリはテンプレートへ埋め込まず、ExportServiceが別ファイルとして出力する。

## 11. 生成処理

1. 選択済み設計書を確定する。
2. 設計書ごとに画像一覧を表示順で取得する。
3. ファイル名を正規化し重複を解消する。
4. Markdown用の相対パスを生成する。
5. 画像情報をテンプレートコンテキストへ渡す。
6. Markdownを生成する。
7. `sheets/<DocumentName>/`へ画像バイナリを追加する。
8. Markdown参照先と画像ファイル一覧を照合する。
9. 未参照画像と参照切れを検出する。
10. ZIPまたはフォルダへ保存する。

## 12. プレビュー

- Markdownプレビュー内に画像を表示する。
- IndexedDB内のBlobからObject URLを生成して表示する。
- Object URLは不要になった時点で`URL.revokeObjectURL`する。
- 画像読込失敗時は代替テキストとエラー表示を行う。
- 拡大表示では元解像度とファイルサイズを表示する。

## 13. 自動保存

- 画像BlobをIndexedDBへ保存する。
- プロジェクトデータと画像メタデータ・Blobを同一トランザクションで更新する。
- 保存容量不足時は明確なエラーを表示する。
- 画像置換後もMarkdown上の表示順と関連先を維持する。

## 14. インポート・再編集

### 14.1 読込

1. Markdown内の画像構文を解析する。
2. 相対パスから対象ファイルを解決する。
3. 画像ファイルをBlobとして読み込む。
4. 代替テキスト、キャプション、表示順を復元する。
5. 対象フォルダ規則に合わない画像を警告する。

### 14.2 未解決画像

Markdownが画像を参照しているがファイルがない場合はエラーとする。

```text
Missing image: sheets/S-Layout/screen-overview.png
```

画像ファイルが存在するが、どのMarkdownからも参照されていない場合は警告とする。

### 14.3 外部URL

`https://`などの外部画像URLは、初期実装ではローカルへ自動取得しない。

- プレビューでは外部画像読込を既定で無効にする。
- インポート時は外部参照として警告する。
- 出力時は利用者が入力した外部参照を保持するか削除するか確認する。

## 15. 検証

### Error

- 非対応形式
- サイズ上限超過
- 画像ファイルが読み込めない
- Markdown参照先の画像が存在しない
- 出力ファイル名が生成できない
- 同一フォルダ内の重複が解消されていない
- パストラバーサルを含むパス

### Warning

- 代替テキストが自動候補のまま
- キャプションが空
- 8000pxを超える画像
- 未参照画像
- 画像フォルダが対象Markdown名と一致しない
- SVGに外部参照またはスクリプト要素が含まれる

## 16. セキュリティ

- MIME typeと拡張子の両方を確認する。
- ファイルのシグネチャを可能な範囲で確認する。
- SVGはスクリプト、イベント属性、外部参照、危険な要素をサニタイズする。
- 画像ファイル名から`..`と絶対パス要素を除去する。
- ZIP展開時のZip Slipを防止する。
- 画像をHTMLとして直接挿入しない。

## 17. Git管理上の方針

- 画像はMarkdownと同じコミットで更新する。
- 画像の差し替え時は、可能な限り同じファイル名を維持する。
- 不要になった画像はMarkdown参照と同時に削除する。
- 大容量画像は事前に圧縮を推奨する。
- Git LFSは初期要件に含めないが、リポジトリ規模に応じて将来検討する。

## 18. 受入条件

- S-LayoutとR-Layoutへ画像を追加できる。
- 画像を並び替え、説明、代替テキスト、関連先を編集できる。
- 対象Markdown名と同名のフォルダへ画像が出力される。
- Markdownから相対パスで画像を表示できる。
- ZIP展開後も画像が表示される。
- 入力途中の画像をブラウザ再起動後に復元できる。
- 生成済みパッケージから画像を再読込できる。
- 参照切れ、未参照、重複、危険なファイルを検出できる。
