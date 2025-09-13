-- 請求書テーブル作成（最小構成）
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  billing_name VARCHAR(200) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 請求書明細テーブル作成（最小構成）
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_name VARCHAR(200) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- インデックス作成
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- 更新日時自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- invoicesテーブルのトリガー
CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- invoice_itemsテーブルのトリガー
CREATE TRIGGER update_invoice_items_updated_at
  BEFORE UPDATE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) を有効化
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー作成（開発環境用：全アクセス許可）
-- TODO: 本番環境では適切な認証ベースのポリシーに変更すること

-- invoicesテーブルのポリシー
CREATE POLICY "Enable all operations for invoices" ON invoices
  FOR ALL USING (true) WITH CHECK (true);

-- invoice_itemsテーブルのポリシー
CREATE POLICY "Enable all operations for invoice_items" ON invoice_items
  FOR ALL USING (true) WITH CHECK (true);

-- 請求書番号のシーケンス管理テーブル
CREATE TABLE IF NOT EXISTS invoice_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date_prefix VARCHAR(8) NOT NULL UNIQUE, -- YYYYMMDD形式
  last_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- invoice_sequencesのRLS設定
ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for invoice_sequences" ON invoice_sequences
  FOR ALL USING (true) WITH CHECK (true);

-- 請求書番号生成関数
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  date_str TEXT;
  next_num INTEGER;
  new_invoice_number TEXT;
BEGIN
  -- 現在日付を YYYYMMDD 形式で取得
  date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  -- 該当日付のシーケンスを取得または作成
  INSERT INTO invoice_sequences (date_prefix, last_number)
  VALUES (date_str, 0)
  ON CONFLICT (date_prefix) DO NOTHING;
  
  -- 次の番号を取得して更新
  UPDATE invoice_sequences
  SET last_number = last_number + 1,
      updated_at = TIMEZONE('utc', NOW())
  WHERE date_prefix = date_str
  RETURNING last_number INTO next_num;
  
  -- 請求書番号を生成（例: INV-20241209-0001）
  new_invoice_number := 'INV-' || date_str || '-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;