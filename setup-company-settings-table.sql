-- 自社情報設定テーブル
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  postal_code VARCHAR(20),
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  fax VARCHAR(50),
  bank_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 更新日時の自動更新トリガー（既存の関数を使用）
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLSを有効化
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- 全ユーザーに対してCRUD権限を付与（開発環境用）
DROP POLICY IF EXISTS "Enable all operations for all users" ON company_settings;
CREATE POLICY "Enable all operations for all users" ON company_settings
  FOR ALL USING (true);

-- 初期データを挿入（1件のみ）
INSERT INTO company_settings (
  company_name,
  postal_code,
  address,
  phone,
  email,
  fax,
  bank_info
) VALUES (
  '株式会社サンプル',
  '100-0001',
  '東京都千代田区千代田1-1-1',
  '03-1234-5678',
  'info@example.com',
  '03-1234-5679',
  '{
    "bank_name": "みずほ銀行",
    "branch_name": "東京営業部",
    "account_type": "普通",
    "account_number": "1234567",
    "account_holder": "カ）サンプル"
  }'::jsonb
) ON CONFLICT DO NOTHING;