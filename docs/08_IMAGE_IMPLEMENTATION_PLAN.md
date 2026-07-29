# Docs Generator 画像対応実装計画

## 1. 目的

S-LayoutとR-Layoutへ画像を添付し、対象Markdownと同名のフォルダへ画像を出力できるようにする。

画像機能はMVPの一部として実装するが、画像保存、編集、再読込などの大規模機能は含めない。

## 2. 対象範囲

初期実装で対応する。

- `S-Layout.md`
- `R-Layout.md`
- PNG、JPEG、WebP
- ファイル選択
- 複数画像選択
- サムネイル表示
- 表示名、代替テキスト、備考
- 上下移動
- 削除
- Markdown画像セクション
- ZIPへの画像格納

初期実装に含めない。

- SVG
- ドラッグ&ドロップ
- クリップボード貼り付け
- IndexedDB
- 画像の自動保存
- 画像編集
- Undo
- 画像付きMarkdownの再読込
- 全設計書共通の画像添付

## 3. 実装ファイル

画像処理は1ファイルへまとめる。

```text
src/
└── imageAssets.ts
```

テストも1ファイルへまとめる。

```text
tests/
└── imageAssets.test.ts
```

## 4. IM01 データモデルと検証

### 作業

1. `LayoutImage`を`model.ts`へ追加する。
2. S-LayoutとR-Layoutへ`images`配列を追加する。
3. MIME typeを検証する。
4. 10MB上限を検証する。
5. 10枚上限を検証する。

### 完了条件

- PNG、JPEG、WebPだけを受け付ける。
- 対応外形式を拒否する。
- サイズと枚数の上限を適用できる。

## 5. IM02 ファイル名処理

### 作業

`imageAssets.ts`へ次を実装する。

```ts
sanitizeImageFileName(fileName: string): string
resolveDuplicateFileNames(images: LayoutImage[]): LayoutImage[]
```

処理内容:

- 禁止文字を`_`へ変換する。
- `..`を除去する。
- 拡張子を小文字化する。
- 空のファイル名を`image`へ置き換える。
- 重複時に`-2`、`-3`を付与する。

### 完了条件

- 安全な相対パスを生成できる。
- 同一フォルダ内で名前が重複しない。

## 6. IM03 画像入力UI

### 作業

S-LayoutとR-Layoutの入力セクションへ、次を追加する。

```html
<input
  type="file"
  multiple
  accept="image/png,image/jpeg,image/webp"
>
```

画像ごとに次を表示する。

- サムネイル
- 元ファイル名
- 出力ファイル名
- 表示名
- 代替テキスト
- 備考
- 上へ
- 下へ
- 削除

### 完了条件

- 複数画像を追加できる。
- 追加順で表示される。
- 順番を上下へ変更できる。
- 画像を削除できる。

## 7. IM04 サムネイル

### 作業

- `URL.createObjectURL`で画像を表示する。
- 画像削除時に`URL.revokeObjectURL`を実行する。
- 画面破棄時に残りのObject URLを解放する。

### 完了条件

- 画像選択後にサムネイルを確認できる。
- 不要なObject URLが残らない。

## 8. IM05 テンプレート展開

### 作業

1. S-LayoutとR-Layoutの`{{LAYOUT_IMAGE_SECTION}}`を処理する。
2. 画像がある場合だけ`### 4.5 Layout images`を生成する。
3. 表示順に画像ブロックを生成する。
4. Markdown相対パスを生成する。
5. 画像がない場合はトークンを空文字へ置換する。

想定関数:

```ts
renderLayoutImageSection(
  documentName: "S-Layout" | "R-Layout",
  images: LayoutImage[],
): string
```

### 完了条件

- S-Layoutが`./S-Layout/<file>`を参照する。
- R-Layoutが`./R-Layout/<file>`を参照する。
- 画像なし時に4.5セクションを出力しない。

## 9. IM06 ZIP出力

### 作業

1. 画像ファイル名を確定する。
2. Markdownを生成する。
3. S-Layout画像を`sheets/S-Layout/`へ追加する。
4. R-Layout画像を`sheets/R-Layout/`へ追加する。
5. Markdown参照先とZIP内画像を照合する。

想定関数:

```ts
addLayoutImagesToZip(
  zip: JSZip,
  documentName: "S-Layout" | "R-Layout",
  images: LayoutImage[],
): void
```

### 完了条件

- ZIP展開後にMarkdownから画像を表示できる。
- 画像が0件の場合は同名フォルダを作成しない。
- 削除した画像をZIPへ出力しない。

## 10. IM07 Local Storageとの分離

### 作業

- Fileオブジェクトを保存対象から除外する。
- 画像メタデータを保存可能な形へ変換する。
- 再読み込み後は画像未選択状態として扱う。
- 画像選択中は`beforeunload`で警告する。

### 完了条件

- Local Storage容量を画像が消費しない。
- 画像が選択されたまま誤って画面を閉じる操作を警告できる。

## 11. テスト

`imageAssets.test.ts`へ次を追加する。

1. PNG許可
2. JPEG許可
3. WebP許可
4. SVG拒否
5. 10MB超過拒否
6. 11枚目拒否
7. 禁止文字置換
8. `..`除去
9. 拡張子小文字化
10. 同名連番
11. S-Layout相対パス
12. R-Layout相対パス
13. 画像なし時の空セクション
14. ZIP格納先
15. Markdown参照先とZIPパスの一致

## 12. 実装順

画像対応は、基本6設計書のMarkdown生成とZIP出力が動作した後に実装する。

1. データモデルと検証
2. ファイル名処理
3. 画像入力UI
4. サムネイル
5. テンプレート展開
6. ZIP出力
7. Local Storage分離
8. テスト

## 13. 完了条件

1. S-Layoutへ画像を追加できる。
2. R-Layoutへ画像を追加できる。
3. 画像を対象Markdownと同名のフォルダへ出力できる。
4. Markdownから相対パスで表示できる。
5. 画像なしの場合は画像フォルダを生成しない。
6. IndexedDB、画像編集ライブラリ、再読込機能を追加せずに完成する。
