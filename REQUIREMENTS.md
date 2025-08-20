# 顧客管理システム要件定義書

## 1. プロジェクト概要

### 1.1 システム名

顧客管理システム（Customer Management System）

### 1.2 目的

教室・スクール運営における顧客情報の一元管理と、将来的な請求書・領収書発行機能への拡張を見据えた基盤システムの構築

### 1.3 開発環境・技術スタック

- **フロントエンド**: Next.js 15 (App Router) - 最新版
- **バックエンド**: Supabase
- **開発環境**: Claude Code
- **UI ライブラリ**: shadcn/ui
- **その他**: react-pdf（将来実装）

## 2. 機能要件

### 2.1 Phase 1（初期実装）

#### 2.1.1 顧客情報管理

**基本情報項目**

- 顧客 ID（自動採番）
- 顧客種別（法人/個人）
- 会社名（法人の場合）
- 氏名
- フリガナ
- クラス（選択式・単一選択）
  - 月-AM
  - 月-PM
  - 火-AM
  - 火-PM
  - 水-AM
  - 水-PM
  - 木-AM
  - 木-PM
  - 金-AM
  - 金-PM
  - 個別
  - その他
- 生年月日
- 郵便番号
- 都道府県
- 市区町村
- 番地・建物名
- 電話番号
- メールアドレス
- 契約開始日
- 請求書送付方法（郵送/メール）
- 支払い条件（月末締め）
- タグ（事前登録式・複数選択可）
  - 休会中
  - （その他は開発時に追加）
- 備考

#### 2.1.2 基本機能

1. **一覧表示**

   - ページネーション（20 件/ページ）
   - ソート機能（氏名、フリガナ、登録日、更新日）
   - 検索機能（氏名、フリガナ、電話番号、メールアドレス）
   - フィルタ機能（顧客種別、クラス、タグ）

2. **詳細表示**

   - 全項目の表示
   - 編集・削除ボタン

3. **新規登録**

   - バリデーション機能
   - 必須項目の明示

4. **編集**

   - 既存データの更新
   - バリデーション機能

5. **削除**

   - 確認ダイアログ
   - 論理削除（deleted_at フラグ）

6. **インポート/エクスポート**
   - CSV 形式でのデータ入出力
   - テンプレートファイルのダウンロード

### 2.2 Phase 2（将来実装）

- ログイン機能
- 変更履歴管理
- スマートフォン対応（レスポンシブデザイン）

## 3. 非機能要件

### 3.1 性能要件

- 顧客数 100 件程度での快適な動作
- 一覧表示：1 秒以内
- 検索処理：1 秒以内

### 3.2 使いやすさ

- 直感的な操作性を最優先
- キーボードショートカット対応
- エラーメッセージの分かりやすさ

### 3.3 セキュリティ

- Phase 1 では認証なし（ローカル環境での使用想定）
- Phase 2 で Supabase Auth による認証実装

## 4. データベース設計

### 4.1 customers テーブル

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_type VARCHAR(10) NOT NULL, -- 'company' or 'personal'
  company_name VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255),
  class VARCHAR(20),
  birth_date DATE,
  postal_code VARCHAR(8),
  prefecture VARCHAR(10),
  city VARCHAR(100),
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  contract_start_date DATE,
  invoice_method VARCHAR(10), -- 'mail' or 'email'
  payment_terms VARCHAR(50),
  memo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

### 4.2 tags テーブル（マスタ）

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 初期データ
INSERT INTO tags (name) VALUES ('休会中');
```

### 4.3 customer_tags テーブル（中間テーブル）

```sql
CREATE TABLE customer_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, tag_id)
);
```

## 5. 画面設計

### 5.1 画面一覧

1. 顧客一覧画面（/customers）
2. 顧客詳細画面（/customers/[id]）
3. 顧客新規登録画面（/customers/new）
4. 顧客編集画面（/customers/[id]/edit）
5. インポート画面（/customers/import）

### 5.2 レイアウト

- ヘッダー：システム名、ナビゲーション
- サイドバー：なし（シンプルな構成）
- メインエリア：各機能の表示

## 6. 開発タスクリスト

### Phase 1 - 基本機能実装

#### 環境構築

- [ ] Next.js 15 プロジェクト作成（最新版）
- [ ] Supabase プロジェクト作成・接続
- [ ] shadcn/ui セットアップ
- [ ] 基本レイアウト作成

#### データベース

- [ ] テーブル作成（customers, tags, customer_tags）
- [ ] RLS（Row Level Security）設定
- [ ] 初期データ投入（タグマスタ）

#### 顧客管理機能

- [ ] 顧客一覧画面
  - [ ] データ取得・表示
  - [ ] ページネーション
  - [ ] 検索機能
  - [ ] フィルタ機能（顧客種別、クラス、タグ）
  - [ ] ソート機能
- [ ] 顧客詳細画面
- [ ] 顧客新規登録
  - [ ] フォーム作成
  - [ ] バリデーション
  - [ ] 顧客種別による表示切替（法人/個人）
- [ ] 顧客編集
- [ ] 顧客削除（論理削除）
- [ ] CSV 入出力
  - [ ] エクスポート機能
  - [ ] インポート機能
  - [ ] テンプレートダウンロード

#### テスト・調整

- [ ] 動作確認
- [ ] UI の微調整
- [ ] エラーハンドリング

### Phase 2 - 将来実装

- [ ] 請求書機能
- [ ] 領収書機能
- [ ] 認証機能（Supabase Auth）
- [ ] 変更履歴管理
- [ ] レスポンシブ対応

## 7. 制約事項

- 個人開発のため、シンプルで保守しやすい設計を心がける
- 過度な機能追加は避け、基本機能の完成度を重視
- 将来の拡張性を考慮したデータ構造

## 8. 用語定義

- **クラス**: 受講する曜日と時間帯の組み合わせ
- **顧客種別**: 法人または個人の区分
- **論理削除**: データベースから物理的に削除せず、フラグで削除扱いにする方式
