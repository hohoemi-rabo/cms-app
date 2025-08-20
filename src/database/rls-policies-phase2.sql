-- ================================
-- Phase 2: 認証ベースのRLSポリシー（本番環境用）
-- ================================
-- 注意: これは将来の実装用の設計書です。
-- Phase 2実装時にSupabase Authを設定した後で使用してください。

-- 前提条件:
-- 1. Supabase Authが設定済み
-- 2. ユーザー認証が実装済み
-- 3. 必要に応じてユーザーロール管理テーブルを作成

-- ================================
-- Phase 1のポリシーを削除
-- ================================
-- DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
-- DROP POLICY IF EXISTS "Allow all operations on tags" ON tags;
-- DROP POLICY IF EXISTS "Allow all operations on customer_tags" ON customer_tags;

-- ================================
-- Phase 2: 認証ユーザー用ポリシー
-- ================================

-- customersテーブル
-- 認証済みユーザーのみアクセス可能
-- CREATE POLICY "Authenticated users can view customers" 
--   ON customers 
--   FOR SELECT 
--   USING (auth.uid() IS NOT NULL);

-- CREATE POLICY "Authenticated users can insert customers" 
--   ON customers 
--   FOR INSERT 
--   WITH CHECK (auth.uid() IS NOT NULL);

-- CREATE POLICY "Authenticated users can update customers" 
--   ON customers 
--   FOR UPDATE 
--   USING (auth.uid() IS NOT NULL)
--   WITH CHECK (auth.uid() IS NOT NULL);

-- CREATE POLICY "Authenticated users can delete customers" 
--   ON customers 
--   FOR DELETE 
--   USING (auth.uid() IS NOT NULL);

-- tagsテーブル
-- 全ユーザーが閲覧可能、編集は認証ユーザーのみ
-- CREATE POLICY "Anyone can view tags" 
--   ON tags 
--   FOR SELECT 
--   USING (true);

-- CREATE POLICY "Authenticated users can manage tags" 
--   ON tags 
--   FOR ALL 
--   USING (auth.uid() IS NOT NULL)
--   WITH CHECK (auth.uid() IS NOT NULL);

-- customer_tagsテーブル
-- 認証済みユーザーのみアクセス可能
-- CREATE POLICY "Authenticated users can manage customer_tags" 
--   ON customer_tags 
--   FOR ALL 
--   USING (auth.uid() IS NOT NULL)
--   WITH CHECK (auth.uid() IS NOT NULL);

-- ================================
-- より高度なポリシー例（ロールベース）
-- ================================
-- ユーザーロール管理テーブルが存在する場合の例：

-- CREATE TABLE user_roles (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   UNIQUE(user_id)
-- );

-- 管理者のみ削除可能なポリシー例：
-- CREATE POLICY "Only admins can delete customers" 
--   ON customers 
--   FOR DELETE 
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles 
--       WHERE user_id = auth.uid() 
--       AND role = 'admin'
--     )
--   );

-- ================================
-- セキュリティベストプラクティス
-- ================================
-- 1. 最小権限の原則を適用
-- 2. 必要な操作のみを許可
-- 3. センシティブなデータは追加の制限を設ける
-- 4. 定期的にポリシーを監査・レビュー
-- 5. テスト環境と本番環境で異なるポリシーを使用