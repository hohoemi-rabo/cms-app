-- 商品マスタテーブル
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  default_price DECIMAL(10, 2) NOT NULL CHECK (default_price >= 0),
  unit VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLSを有効化
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 全ユーザーに対してCRUD権限を付与（開発環境用）
DROP POLICY IF EXISTS "Enable all operations for all users" ON products;
CREATE POLICY "Enable all operations for all users" ON products
  FOR ALL USING (true);

-- サンプルデータを挿入
INSERT INTO products (name, default_price, unit, description) VALUES
  ('ウェブサイト制作', 500000, '件', 'コーポレートサイトの新規制作'),
  ('ロゴデザイン', 100000, '件', 'ブランドロゴのデザイン制作'),
  ('保守サポート', 30000, '月', 'ウェブサイトの月額保守サポート'),
  ('コンサルティング', 50000, '時間', 'IT戦略コンサルティング'),
  ('SEO対策', 100000, '月', '検索エンジン最適化サービス')
ON CONFLICT DO NOTHING;