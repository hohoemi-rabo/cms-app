-- ================================
-- Row Level Security (RLS) 設定
-- ================================

-- Phase 1: 認証なし環境での設定（開発環境用）
-- 注意: 本番環境では必ずPhase 2の認証ベースのポリシーを使用してください

-- 1. RLSを有効化
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;

-- 2. Phase 1用ポリシー（全操作を許可）
-- customersテーブル
CREATE POLICY "Allow all operations on customers" 
  ON customers 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- tagsテーブル
CREATE POLICY "Allow all operations on tags" 
  ON tags 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- customer_tagsテーブル
CREATE POLICY "Allow all operations on customer_tags" 
  ON customer_tags 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- ================================
-- ポリシー確認用クエリ
-- ================================
-- 以下のクエリで設定されたポリシーを確認できます：
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';