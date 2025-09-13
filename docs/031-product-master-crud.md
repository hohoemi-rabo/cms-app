# チケット031: 商品マスタCRUD機能

## 概要
商品・サービスマスタの管理機能を実装する。請求書作成時に選択できる商品・サービスの登録、編集、削除機能を提供。

## 要件

### 機能要件
1. **商品マスタ一覧画面** (`/products`)
   - 商品一覧表示
   - ページネーション（20件/ページ）
   - 検索機能（商品名）
   - 新規登録ボタン
   - 編集・削除ボタン

2. **商品登録画面** (`/products/new`)
   - 商品名（必須、最大100文字）
   - デフォルト単価（必須、0以上）
   - 単位（必須、例：個、時間、月）
   - 説明文（任意、最大500文字）
   - 保存/キャンセル

3. **商品編集画面** (`/products/[id]/edit`)
   - 既存データの編集
   - 変更履歴の考慮（請求書で使用中でも編集可能）

4. **削除機能**
   - 論理削除（deleted_at）
   - 使用中の商品も削除可能（請求書の明細は保持）
   - 確認ダイアログ表示

### データベース
```sql
products
- id (UUID, PK)
- name (String, NOT NULL)
- default_price (Decimal, NOT NULL)
- unit (String, NOT NULL)
- description (Text, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, Nullable)
```

### API設計
- `GET /api/products` - 一覧取得
- `GET /api/products/[id]` - 詳細取得
- `POST /api/products` - 新規作成
- `PUT /api/products/[id]` - 更新
- `DELETE /api/products/[id]` - 論理削除

## タスク

### データベース設定
- [ ] productsテーブルの作成
- [ ] インデックスの設定

### バックエンド実装
- [ ] API Route: `/api/products`
- [ ] API Route: `/api/products/[id]`
- [ ] バリデーション処理
- [ ] エラーハンドリング

### フロントエンド実装
- [ ] 商品一覧ページ (`/products`)
- [ ] 商品登録ページ (`/products/new`)
- [ ] 商品編集ページ (`/products/[id]/edit`)
- [ ] 削除確認ダイアログコンポーネント
- [ ] フォームコンポーネント（共通化）

### テスト
- [ ] 商品登録テスト
- [ ] 商品編集テスト
- [ ] 商品削除テスト
- [ ] バリデーションテスト

## 成功基準
- [ ] 商品の登録・編集・削除が正常に動作する
- [ ] 一覧表示でページネーションが機能する
- [ ] 検索機能が正常に動作する
- [ ] エラー時に適切なメッセージが表示される
- [ ] 削除時に確認ダイアログが表示される

## 注意事項
- 商品マスタ削除時も、既存請求書の明細は影響を受けない
- 単価は0以上の数値のみ許可
- 商品名は重複可能とする

## 依存関係
- Supabaseのテーブル作成権限
- shadcn/uiコンポーネント