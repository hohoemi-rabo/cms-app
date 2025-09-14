-- チケット033: 請求書-顧客連携機能のためのテーブル拡張
-- 既存のinvoicesテーブルに顧客連携用のカラムを追加

-- 1. 顧客連携用カラムの追加
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS billing_honorific VARCHAR(10) DEFAULT '様',
ADD COLUMN IF NOT EXISTS customer_snapshot JSONB;

-- 2. billing_nameカラムは既存なので変更なし

-- 3. インデックスの追加
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);

-- 4. コメントの追加（ドキュメント化）
COMMENT ON COLUMN invoices.customer_id IS '顧客マスタへの参照（削除時はNULLにセット）';
COMMENT ON COLUMN invoices.billing_name IS '請求先名（必須）';
COMMENT ON COLUMN invoices.billing_address IS '請求先住所';
COMMENT ON COLUMN invoices.billing_honorific IS '敬称（様/御中）';
COMMENT ON COLUMN invoices.customer_snapshot IS '作成時点での顧客情報のスナップショット';

-- 5. 既存データの更新（billing_honorificのデフォルト値設定）
UPDATE invoices
SET billing_honorific = '様'
WHERE billing_honorific IS NULL;

-- 6. 顧客検索用のインデックス（既存のcustomersテーブル）
CREATE INDEX IF NOT EXISTS idx_customers_name_search
ON customers(name text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_customers_company_name_search
ON customers(company_name text_pattern_ops);

-- 7. 請求書作成時の顧客情報スナップショット保存用関数
CREATE OR REPLACE FUNCTION capture_customer_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- customer_idが設定されている場合、顧客情報をスナップショットとして保存
  IF NEW.customer_id IS NOT NULL THEN
    SELECT row_to_json(c.*) INTO NEW.customer_snapshot
    FROM (
      SELECT
        id,
        customer_type,
        company_name,
        name,
        name_kana,
        email,
        phone,
        postal_code,
        prefecture,
        city,
        address
      FROM customers
      WHERE id = NEW.customer_id
        AND deleted_at IS NULL
    ) c;

    -- 顧客情報から billing_name と billing_address を自動設定（未設定の場合）
    IF NEW.billing_name IS NULL OR NEW.billing_name = '' THEN
      SELECT
        COALESCE(company_name, name) INTO NEW.billing_name
      FROM customers
      WHERE id = NEW.customer_id
        AND deleted_at IS NULL;
    END IF;

    IF NEW.billing_address IS NULL OR NEW.billing_address = '' THEN
      SELECT
        CONCAT(COALESCE(prefecture, ''), COALESCE(city, ''), COALESCE(address, '')) INTO NEW.billing_address
      FROM customers
      WHERE id = NEW.customer_id
        AND deleted_at IS NULL;
    END IF;

    -- 敬称の自動判定（法人なら「御中」、個人なら「様」）
    IF NEW.billing_honorific IS NULL OR NEW.billing_honorific = '' THEN
      SELECT
        CASE
          WHEN customer_type = 'company' THEN '御中'
          ELSE '様'
        END INTO NEW.billing_honorific
      FROM customers
      WHERE id = NEW.customer_id
        AND deleted_at IS NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. トリガーの作成（請求書作成時）
DROP TRIGGER IF EXISTS capture_customer_snapshot_on_insert ON invoices;
CREATE TRIGGER capture_customer_snapshot_on_insert
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION capture_customer_snapshot();

-- 9. トリガーの作成（請求書更新時 - customer_idが変更された場合）
DROP TRIGGER IF EXISTS capture_customer_snapshot_on_update ON invoices;
CREATE TRIGGER capture_customer_snapshot_on_update
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  WHEN (OLD.customer_id IS DISTINCT FROM NEW.customer_id)
  EXECUTE FUNCTION capture_customer_snapshot();

-- 10. サンプルデータの確認クエリ（実行は任意）
/*
-- 顧客と請求書の関連を確認
SELECT
  i.invoice_number,
  i.billing_name,
  i.billing_honorific,
  i.billing_address,
  c.name as customer_name,
  c.company_name as customer_company,
  i.customer_snapshot
FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.id
ORDER BY i.created_at DESC
LIMIT 10;
*/