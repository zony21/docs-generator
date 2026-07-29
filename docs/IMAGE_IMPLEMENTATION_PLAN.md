# レイアウト画像添付 実装計画

## 1. 位置づけ

本書は`IMPLEMENTATION_PLAN.md`へ追加する必須作業を定義する。

対象は`S-Layout.md`と`R-Layout.md`の画像添付であり、画像編集機能や汎用ファイル管理機能は含めない。

## 2. データモデル追加

`model.ts`へ次を追加する。

```ts
interface LayoutImage {
  id: string;
  originalFileName: string;
  outputFileName: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  title: string;
  alt: string;
  notes: string;
  order: number;
  file: File;
}
```

S-LayoutとR-Layoutのモデルへ`images: LayoutImage[]`を追加する。

画像バイナリを共通のJSON保存形式へ含めない。

## 3. Step 3への追加作業

設計書固有フォームの実装時に、S-LayoutとR-Layoutへ画像添付欄を追加する。

実装する操作:

1. `<input type="file" multiple accept="image/png,image/jpeg,image/webp">`
2. サムネイル表示
3. 表示名入力
4. 代替テキスト入力
5. 備考入力
6. 上下移動
7. 削除

ドラッグ&ドロップ、画像加工、画像内注釈は実装しない。

## 4. Step 4への追加作業

Markdown生成時に、画像がある場合だけ`{{LAYOUT_IMAGE_SECTION}}`を生成する。

生成例:

```markdown
### 4.5 Layout images

#### 4.5.1 画面全体

![画面全体](./S-Layout/screen-overview.png)

- File: `S-Layout/screen-overview.png`
- Notes: 初期表示時の全体イメージ
```

画像がない場合、トークンを空文字へ置換する。

プレビューには`URL.createObjectURL`を使用する。

## 5. Step 5への追加作業

ZIP生成時に次を追加する。

1. 画像ファイル名を正規化する。
2. 同名ファイルへ連番を付ける。
3. S-Layout画像を`sheets/S-Layout/`へ追加する。
4. R-Layout画像を`sheets/R-Layout/`へ追加する。
5. Markdown内の参照先とZIP内の画像パスを照合する。

## 6. 追加関数

ファイル数を増やしすぎないため、画像処理専用ファイルは1つだけ追加する。

```text
src/
└── imageAssets.ts
```

想定関数:

```ts
validateLayoutImage(file: File): ValidationResult
sanitizeImageFileName(fileName: string): string
resolveDuplicateFileNames(images: LayoutImage[]): LayoutImage[]
renderLayoutImageSection(documentName: "S-Layout" | "R-Layout", images: LayoutImage[]): string
addLayoutImagesToZip(zip: JSZip, documentName: string, images: LayoutImage[]): void
```

画像関連処理を複数ファイルへ分割しない。

## 7. 自動保存への対応

Local Storageへ保存するのは画像の表示名、代替テキスト、備考、順番だけとする。

Fileオブジェクトは保存しない。

画像選択後にページ離脱または再読み込みを行う場合、`beforeunload`で警告する。

## 8. テスト追加

`tests/imageAssets.test.ts`を1ファイル追加する。

テスト内容:

- 対応形式判定
- 10MB超過判定
- ファイル名正規化
- 同名ファイルの連番
- S-Layout相対パス生成
- R-Layout相対パス生成
- 画像なし時の空セクション
- ZIP格納先
- Markdown参照先との一致

## 9. 完了条件

1. S-LayoutとR-Layoutだけに画像を添付できる。
2. 画像がMarkdownと同名のフォルダへ出力される。
3. Markdownから相対パスで表示できる。
4. 画像なしの場合は画像フォルダを生成しない。
5. 画像関連の追加実装を`imageAssets.ts`中心に収める。
6. バックエンド、IndexedDB、画像編集ライブラリを追加しない。
