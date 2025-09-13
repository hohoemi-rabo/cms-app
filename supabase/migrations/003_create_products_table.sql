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
CREATE INDEX idx_products_deleted_at ON products(deleted_at);
CREATE INDEX idx_products_name ON products(name);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLSを有効化
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 全ユーザーに対してCRUD権限を付与（開発環境用）
CREATE POLICY "Enable all operations for all users" ON products
  FOR ALL USING (true);