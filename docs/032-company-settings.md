# チケット032: 自社情報設定機能

## 概要
請求書に表示する自社情報の設定機能を実装する。会社名、住所、連絡先などの情報を管理し、請求書に自動反映させる。

## 要件

### 機能要件
1. **自社情報設定画面** (`/settings/company`)
   - 会社名（必須）
   - 郵便番号（任意）
   - 住所（必須）
   - 電話番号（必須）
   - メールアドレス（任意）
   - FAX番号（任意）
   - 銀行口座情報（任意）
   - 保存ボタン

2. **データ管理**
   - 1社のみ登録可能（更新のみ）
   - 初回アクセス時に自動作成
   - 更新履歴の保持

3. **請求書連携**
   - 請求書作成時に自動読み込み
   - スナップショットとして請求書に保存

### データベース
```sql
company_settings
- id (UUID, PK)
- company_name (String, NOT NULL)
- postal_code (String, Nullable)
- address (String, NOT NULL)
- phone (String, NOT NULL)
- email (String, Nullable)
- fax (String, Nullable)
- bank_info (JSONB, Nullable) -- 銀行情報
- created_at (Timestamp)
- updated_at (Timestamp)
```

### API設計
- `GET /api/company-settings` - 設定取得
- `PUT /api/company-settings` - 設定更新
- `POST /api/company-settings/init` - 初期作成

## タスク

### データベース設定
- [ ] company_settingsテーブルの作成
- [ ] 初期データの投入

### バックエンド実装
- [ ] API Route: `/api/company-settings`
- [ ] 初期化処理
- [ ] バリデーション処理
- [ ] エラーハンドリング

### フロントエンド実装
- [ ] 自社情報設定ページ (`/settings/company`)
- [ ] フォームコンポーネント
- [ ] 保存成功/失敗の通知
- [ ] ローディング状態の表示

### テスト
- [ ] 初回アクセス時の自動作成
- [ ] 情報更新テスト
- [ ] バリデーションテスト
- [ ] 請求書との連携確認

## 成功基準
- [ ] 自社情報の登録・更新が正常に動作する
- [ ] 初回アクセス時に自動で初期データが作成される
- [ ] バリデーションが適切に機能する
- [ ] 保存時に成功通知が表示される
- [ ] エラー時に適切なメッセージが表示される

## 注意事項
- 会社情報は1件のみ（UPDATE処理のみ）
- 郵便番号は自動住所入力機能は実装しない（Phase 3で検討）
- 銀行情報はJSON形式で柔軟に保存

## 依存関係
- Supabaseのテーブル作成権限
- shadcn/uiコンポーネント