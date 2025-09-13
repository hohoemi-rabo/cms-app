# 026 - 請求書データベース設計・構築

## 概要

請求書システムの基盤となるデータベーステーブルを作成する。
**骨組み重視**: 最小限必要なフィールドからスタート、後で拡張可能な設計にする。

## 対象テーブル

### 1. 請求書（invoices）- 最小構成
- id (UUID, Primary Key)
- invoice_number (String, Unique) - 請求書番号
- issue_date (Date) - 発行日
- billing_name (String) - 請求先名
- total_amount (Decimal) - 合計金額
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, Nullable) - 論理削除

### 2. 請求書明細（invoice_items）- 最小構成
- id (UUID, Primary Key)
- invoice_id (UUID, Foreign Key)
- item_name (String) - 品目名
- quantity (Decimal) - 数量
- unit_price (Decimal) - 単価
- amount (Decimal) - 金額
- display_order (Integer) - 表示順
- created_at (Timestamp)
- updated_at (Timestamp)

## Tasks

- [x] Supabase で invoices テーブル作成
- [x] Supabase で invoice_items テーブル作成
- [x] 外部キー制約の設定
- [x] RLS (Row Level Security) ポリシー設定
- [x] TypeScript 型定義生成
- [x] 基本的なAPI関数作成（作成・取得のみ）

## 注意事項

1. **段階的拡張方針**: 
   - 最小限のフィールドでスタート
   - 機能追加時に必要なフィールドを後から追加
   
2. **後で追加予定のフィールド**:
   - customer_id (顧客連携)
   - subtotal, tax_amount (税額計算)
   - company_snapshot, customer_snapshot (スナップショット)
   - billing_address, billing_honorific

3. **シンプルな動作確認**:
   - 請求書の基本的な作成・表示ができることを確認
   - 明細の追加・表示ができることを確認

## 成功基準

- [x] テーブルが正常に作成される
- [x] 基本的なCRUD操作が動作する
- [x] TypeScript での型チェックが通る
- [x] 簡単なテストデータで動作確認完了