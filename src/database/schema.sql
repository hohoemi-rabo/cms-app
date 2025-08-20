-- UUID拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- customersテーブル作成
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_type VARCHAR(10) NOT NULL CHECK (customer_type IN ('company', 'personal')),
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
  invoice_method VARCHAR(10) CHECK (invoice_method IN ('mail', 'email')),
  payment_terms VARCHAR(50),
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- tagsテーブル作成
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- customer_tagsテーブル作成（中間テーブル）
CREATE TABLE customer_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, tag_id)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_name_kana ON customers(name_kana);
CREATE INDEX idx_customer_tags_customer_id ON customer_tags(customer_id);
CREATE INDEX idx_customer_tags_tag_id ON customer_tags(tag_id);

-- 初期データ投入（タグマスタ）
INSERT INTO tags (name) VALUES 
  ('休会中'),
  ('新規'),
  ('重要顧客'),
  ('要フォロー');

-- updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- customersテーブルのupdated_atトリガー
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();