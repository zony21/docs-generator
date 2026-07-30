# Relation

- 元シート名: `Relation`

## 基本情報

| 項目 | 値 |
| --- | --- |
| System Name | {{SYSTEM_NAME}} |
| Module Name | {{MODULE_NAME}} |
| Date | {{DOCUMENT_DATE}} |
| Rev | {{DOCUMENT_REV}} |
| Author | {{AUTHOR}} |
| Module ID | {{MODULE_ID}} |

<!-- 移送区分またはSQL単位で以下のセクションを追加します。 -->

## [移送名]

| 項目 | 値 |
| --- | --- |
| 移送区分 | [Select / Insert / Update / Delete / API / File] |
| 移送名 | [移送名] |
| 条件 | [抽出条件、実行条件] |
| 並び順 | [ORDER BY条件] |
| 引数 | [引数名、WHERE句プレースホルダなど] |

### SQL

```sql
SELECT
    [COLUMN_1]
  , [COLUMN_2]
FROM
    [TABLE_NAME] [ALIAS]
WHERE
    [CONDITION]
ORDER BY
    [SORT_KEY]
```

### 移送元／移送先

| 移送元テーブル名 | 移送元カラム名 | 移送元項目名称 | 移送先テーブル名 | 移送先カラム名 | 移送先項目名称 | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| [SOURCE_TABLE] | [SOURCE_COLUMN] | [移送元項目名] | [DESTINATION] | [DESTINATION_COLUMN] | [移送先項目名] | [表示、非表示、変換条件など] |

## [移送名: 必要に応じて追加]

| 項目 | 値 |
| --- | --- |
| 移送区分 | [Select / Insert / Update / Delete / API / File] |
| 移送名 | [移送名] |
| 条件 | [条件] |
| 並び順 | [並び順] |
| 引数 | [引数] |

### SQL

```sql
-- SQLを記載してください
```

### 移送元／移送先

（記載なし）
