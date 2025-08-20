# 002 - データベーススキーマ作成

## 概要
顧客管理システムに必要なデータベーステーブルの作成

## 対象範囲
- customersテーブル作成
- tagsテーブル作成
- customer_tagsテーブル作成
- 初期データ投入

## 実装タスク

### TODO
- [ ] UUID拡張機能の有効化
- [ ] customersテーブルのSQL作成と実行
- [ ] tagsテーブルのSQL作成と実行
- [ ] customer_tagsテーブルのSQL作成と実行
- [ ] 外部キー制約の設定確認
- [ ] インデックスの作成（必要に応じて）
- [ ] タグマスタの初期データ投入

## 技術仕様
```sql
-- customersテーブル
- id: UUID (PK)
- customer_type: VARCHAR(10) - 'company' or 'personal'
- company_name: VARCHAR(255) - NULL許可
- name: VARCHAR(255) - NOT NULL
- name_kana: VARCHAR(255)
- class: VARCHAR(20)
- birth_date: DATE
- postal_code: VARCHAR(8)
- prefecture: VARCHAR(10)
- city: VARCHAR(100)
- address: VARCHAR(255)
- phone: VARCHAR(20)
- email: VARCHAR(255)
- contract_start_date: DATE
- invoice_method: VARCHAR(10)
- payment_terms: VARCHAR(50)
- memo: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- deleted_at: TIMESTAMP
```

## 依存関係
- 001-supabase-project-setup.md が完了していること

## 動作確認項目
- [ ] 各テーブルが正常に作成される
- [ ] 外部キー制約が機能する
- [ ] カスケード削除が正しく動作する
- [ ] 初期データが正しく投入される

## 注意事項
- マイグレーションファイルとして管理することを推奨
- テーブル名は複数形で統一