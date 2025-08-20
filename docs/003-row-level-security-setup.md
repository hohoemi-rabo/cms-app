# 003 - Row Level Security (RLS) 設定

## 概要
Supabaseのテーブルに対するRow Level Securityポリシーの設定

## 対象範囲
- 各テーブルのRLS有効化
- Phase 1用の暫定ポリシー設定（認証なし環境）
- Phase 2に向けた設計準備

## 実装タスク

### TODO
- [ ] customersテーブルのRLS有効化
- [ ] tagsテーブルのRLS有効化
- [ ] customer_tagsテーブルのRLS有効化
- [ ] Phase 1用の全許可ポリシー作成
- [ ] ポリシーのテスト
- [ ] Phase 2用のポリシー設計書作成

## 技術仕様
### Phase 1 (認証なし)
```sql
-- 暫定的に全操作を許可
CREATE POLICY "Allow all operations" ON customers
  FOR ALL USING (true);
```

### Phase 2 (認証あり) - 設計のみ
```sql
-- 認証済みユーザーのみアクセス可能
CREATE POLICY "Authenticated users only" ON customers
  FOR ALL USING (auth.uid() IS NOT NULL);
```

## 依存関係
- 002-database-schema-creation.md が完了していること

## 動作確認項目
- [ ] RLSが有効化されている
- [ ] Phase 1環境で全CRUD操作が可能
- [ ] Supabaseダッシュボードからポリシーを確認できる

## 注意事項
- Phase 1では開発環境のみでの使用を想定
- 本番環境への移行時は必ず認証ポリシーを設定
- RLSを無効にすることは推奨されない