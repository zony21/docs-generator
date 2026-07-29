# Docs Generator 画像添付仕様

## 1. 目的

`S-Layout.md`と`R-Layout.md`へ、画面イメージ、ワイヤーフレーム、帳票見本、出力例などの画像を添付できるようにする。

画像はMarkdown本文へ埋め込まず、対象Markdownと同名のフォルダへ格納し、相対パスで表示する。

## 2. 対象設計書

初期実装で画像を添付できるのは次の2種類だけとする。

- `S-Layout.md`
- `R-Layout.md`

全設計書共通の画像機能は作成しない。

## 3. 出力フォルダ構成

### 3.1 S-Layout

```text
<機能ID>_<機能名>/
├── README.md
└── sheets/
    ├── S-Layout.md
    └── S-Layout/
        ├── screen-overview.png
        └── search-area.png
```

`S-Layout.md`からは次のように参照する。

```markdown
![画面全体](./S-Layout/screen-overview.png)
```

### 3.2 R-Layout

```text
<機能ID>_<機能名>/
├── README.md
└── sheets/
    ├── R-Layout.md
    └── R-Layout/
        └── report-sample.png
```

```markdown
![帳票出力例](./R-Layout/report-sample.png)
```

### 3.3 画像なし

画像が1枚もない場合、同名の画像フォルダを生成しない。

## 4. 基本ルール

- 画像は対象Markdown名から拡張子を除いたフォルダへ格納する。
- S-Layout画像は`sheets/S-Layout/`へ格納する。
- R-Layout画像は`sheets/R-Layout/`へ格納する。
- `sheets/images/`のような共通フォルダは使用しない。
- Markdownには相対パスだけを出力する。
- Windows形式の`\`ではなく`/`を使用する。
- Base64画像をMarkdownへ埋め込まない。
- 外部URL画像を自動取得しない。

## 5. 対応形式

| 形式 | 拡張子 | MIME type |
| --- | --- | --- |
| PNG | `.png` | `image/png` |
| JPEG | `.jpg`, `.jpeg` | `image/jpeg` |
| WebP | `.webp` | `image/webp` |

初期実装ではSVG、GIF、BMP、TIFF、PDFを受け付けない。

SVGは安全性検証が必要になるため対象外とする。

## 6. 制限

- 1ファイル最大: 10MB
- 1設計書最大: 10枚
- 画像のリサイズは行わない
- 画像の圧縮は行わない
- 画像の編集は行わない

## 7. 入力項目

画像1件につき次を保持する。

| 項目 | 必須 | 内容 |
| --- | --- | --- |
| 画像ファイル | 必須 | 利用者が選択した画像 |
| 表示名 | 任意 | 画像ブロックの見出し |
| 代替テキスト | 任意 | Markdown画像のalt |
| 備考 | 任意 | 画像の説明 |
| 表示順 | 必須 | 追加順を初期値とする |

表示名が空の場合は、拡張子を除いたファイル名を使用する。

代替テキストが空の場合は、表示名を使用する。

## 8. 画面操作

S-LayoutまたはR-Layoutを選択した場合だけ、画像添付欄を表示する。

実装する操作:

- ファイル選択
- 複数ファイルの一括選択
- サムネイル表示
- 表示名入力
- 代替テキスト入力
- 備考入力
- 上へ移動
- 下へ移動
- 削除

実装しない操作:

- ドラッグ&ドロップ追加
- クリップボード貼り付け
- ドラッグ&ドロップ並び替え
- Undo
- 画像置換専用操作
- 拡大ビューア
- トリミング
- リサイズ
- 回転
- 画像内注釈

画像を変更する場合は削除して再選択する。

## 9. データモデル

```ts
interface LayoutImage {
  id: string;
  originalFileName: string;
  outputFileName: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  size: number;
  title: string;
  alt: string;
  notes: string;
  order: number;
  file: File;
}
```

S-LayoutとR-Layoutのデータに`images: LayoutImage[]`を追加する。

## 10. ファイル名正規化

1. 前後の空白を削除する。
2. `/`、`\`、`:`, `*`, `?`, `"`, `<`, `>`, `|`を`_`へ置換する。
3. 制御文字を除去する。
4. `..`を除去する。
5. 拡張子を小文字へ統一する。
6. ファイル名本体が空の場合は`image`を使用する。
7. 同一フォルダ内で重複する場合は`-2`、`-3`を付与する。

例:

| 元ファイル名 | 出力ファイル名 |
| --- | --- |
| `画面/全体.PNG` | `画面_全体.png` |
| `screen.png`の2件目 | `screen-2.png` |

## 11. Markdown出力

S-LayoutとR-Layoutテンプレートの末尾に次を配置する。

```text
{{LAYOUT_IMAGE_SECTION}}
```

画像がある場合だけ、次の形式を生成する。

```markdown
### 4.5 Layout images

#### 4.5.1 画面全体

![画面全体](./S-Layout/screen-overview.png)

- File: `S-Layout/screen-overview.png`
- Notes: 初期表示時の画面全体
```

複数画像は表示順に`4.5.1`、`4.5.2`のように出力する。

画像がない場合、`{{LAYOUT_IMAGE_SECTION}}`を空文字へ置換し、`4.5 Layout images`も出力しない。

既存テンプレートの`4.1`から`4.4`は変更しない。

## 12. プレビュー

- 選択画像のサムネイル表示に`URL.createObjectURL`を使用する。
- 画像削除時に`URL.revokeObjectURL`を実行する。
- MarkdownソースにはZIP出力時と同じ相対パスを表示する。
- HTML形式のMarkdownレンダリングは行わない。

## 13. 自動保存

画像バイナリとFileオブジェクトはLocal Storageへ保存しない。

理由:

- Local Storageの容量を超えやすい。
- Base64化で容量が増える。
- IndexedDBを追加すると実装規模が増える。

文字入力、表示名、代替テキスト、備考、表示順は保存できるが、再読み込み後は画像ファイルを再選択する。

画像選択中にページを離れる場合は`beforeunload`で警告する。

## 14. ZIP生成

1. 画像形式とサイズを検証する。
2. ファイル名を正規化する。
3. 同名を解消する。
4. Markdown画像セクションを生成する。
5. Markdownを`sheets/S-Layout.md`または`sheets/R-Layout.md`へ追加する。
6. 画像を同名フォルダへバイナリのまま追加する。
7. Markdown参照先とZIP内画像を照合する。

## 15. エラー

次の場合は画像を追加またはZIP出力できない。

- 対応外形式
- 10MB超過
- 1設計書11枚以上
- ファイル読み込み失敗
- 正規化後のファイル名を作成できない
- Markdown参照先がZIP内に存在しない

未参照画像がある場合はZIP出力前に警告する。

## 16. 受け入れ条件

1. S-Layoutへ画像を添付できる。
2. R-Layoutへ画像を添付できる。
3. 画像が対象Markdownと同名のフォルダへ格納される。
4. Markdownから相対パスで画像を表示できる。
5. 複数画像の順序と説明を設定できる。
6. 画像がない場合は画像セクションと画像フォルダを生成しない。
7. バックエンド、IndexedDB、画像編集ライブラリなしで実装できる。
