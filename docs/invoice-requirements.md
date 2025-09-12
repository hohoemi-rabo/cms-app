# 請求書機能 要件定義書

## 1. 概要

顧客管理システムに請求書作成・管理機能を追加する。

## 2. 機能要件

### 2.1 請求書管理

#### 基本機能
- 請求書の作成・編集・削除（論理削除）
- 請求書一覧表示（検索・フィルター機能付き）
- 請求書詳細表示
- PDF出力機能

#### 請求書番号
- フォーマット: `INV-YYYYMMDD-0001`
- 通し番号（リセットなし）
- 自動採番

### 2.2 請求書の構成要素

#### 基本情報
- 請求書番号（自動採番）
- 発行日
- 請求先情報
  - 顧客選択 or 直接入力
  - 宛名（様/御中は手動選択）
- 自社情報（設定画面から取得）

#### 明細情報
- 最大10行
- 項目ごとに以下を入力
  - 商品/サービス（マスタから選択 or 直接入力）
  - 数量
  - 単位
  - 単価
  - 金額（自動計算）

#### 金額計算
- 小計（明細の合計）
- 消費税（10%固定、端数切り捨て）
- 合計金額

### 2.3 商品/サービスマスタ

#### 管理項目
- 商品/サービス名
- デフォルト単価
- 単位（個、時間、月など）
- 説明文（オプション）

#### 機能
- マスタ管理画面（CRUD）
- 請求書作成時の選択機能

### 2.4 自社情報設定

#### 管理項目
- 会社名
- 住所
- 電話番号
- その他必要情報

#### 機能
- 設定画面（1社のみ）
- 請求書に自動反映

### 2.5 顧客連携

#### 顧客選択
- 既存顧客から選択
- 選択時、顧客情報を請求先に自動セット

#### 直接入力
- 顧客を選択せずに請求先情報を入力
- 入力した情報を新規顧客として保存可能（オプション）

### 2.6 データ管理

#### 削除時の動作
- 顧客削除時: 請求書は残す（顧客情報をスナップショットとして保持）
- 商品マスタ削除時: 使用済み請求書の明細はそのまま保持

## 3. 非機能要件

### 3.1 パフォーマンス
- 請求書一覧: 1秒以内で表示
- PDF生成: 3秒以内

### 3.2 制限事項
- 明細は最大10行
- 消費税率は10%固定
- 値引き機能なし
- ステータス管理なし
- インボイス制度非対応

## 4. 画面構成

### 4.1 メニュー構造
```
請求管理
├── 請求書一覧
├── 請求書作成
├── 商品マスタ
└── 自社情報設定
```

### 4.2 画面一覧
1. 請求書一覧画面（/invoices）
2. 請求書詳細画面（/invoices/[id]）
3. 請求書作成画面（/invoices/new）
4. 請求書編集画面（/invoices/[id]/edit）
5. 商品マスタ一覧画面（/products）
6. 商品マスタ登録/編集画面（/products/new, /products/[id]/edit）
7. 自社情報設定画面（/settings/company）

## 5. データベース設計

### 5.1 テーブル構成
```sql
-- 請求書
invoices
- id (UUID)
- invoice_number (String, Unique)
- issue_date (Date)
- customer_id (UUID, Nullable) -- 顧客選択時
- billing_name (String) -- 請求先名
- billing_address (String, Nullable) -- 請求先住所
- billing_honorific (String) -- 様/御中
- subtotal (Decimal)
- tax_amount (Decimal)
- total_amount (Decimal)
- company_snapshot (JSONB) -- 自社情報のスナップショット
- customer_snapshot (JSONB, Nullable) -- 顧客情報のスナップショット
- notes (Text, Nullable) -- 備考
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, Nullable)

-- 請求書明細
invoice_items
- id (UUID)
- invoice_id (UUID, FK)
- product_id (UUID, Nullable) -- 商品マスタ選択時
- item_name (String)
- quantity (Decimal)
- unit (String)
- unit_price (Decimal)
- amount (Decimal)
- description (Text, Nullable)
- display_order (Integer)
- created_at (Timestamp)
- updated_at (Timestamp)

-- 商品マスタ
products
- id (UUID)
- name (String)
- default_price (Decimal)
- unit (String)
- description (Text, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, Nullable)

-- 自社情報
company_settings
- id (UUID)
- company_name (String)
- address (String)
- phone (String)
- email (String, Nullable)
- postal_code (String, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## 6. 開発フェーズ

### Phase 1: 基盤構築（チケット026-030）
- データベース設計・構築
- 請求書一覧画面
- 請求書詳細画面
- 商品マスタ管理
- 自社情報設定

### Phase 2: CRUD機能（チケット031-035）
- 請求書作成機能
- 請求書編集機能
- 請求書削除機能
- 顧客連携機能
- 直接入力機能

### Phase 3: 拡張機能（チケット036-040）
- PDF生成・出力
- 検索・フィルター機能
- 集計・レポート機能
- バリデーション強化
- UI/UX改善

## 7. 技術仕様

### 使用技術
- Frontend: Next.js 15, React, TypeScript
- UI: Shadcn/ui, Tailwind CSS
- Backend: Supabase
- PDF生成: react-pdf or jsPDF
- 状態管理: React Hooks

### API設計
- RESTful API
- `/api/invoices` - 請求書CRUD
- `/api/products` - 商品マスタCRUD
- `/api/company-settings` - 自社情報CRUD

## 8. テスト要件

### 単体テスト
- 金額計算ロジック
- 請求書番号生成
- バリデーション

### 統合テスト
- 請求書作成フロー
- PDF生成
- 顧客連携

### E2Eテスト
- 請求書作成から PDF出力まで
- 顧客選択と直接入力の切り替え

## 9. 今後の拡張予定

- 領収書機能（Phase 4）
- 見積書機能（将来）
- 請求書テンプレート機能（将来）
- メール送信機能（将来）