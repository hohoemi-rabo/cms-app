-- チケット034: 請求書明細機能強化のためのテーブル拡張
-- invoice_itemsテーブルに商品マスタ連携用のカラムを追加

-- 1. 商品連携用カラムの追加
ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS unit VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. 既存カラムの確認（既に存在するカラムはスキップ）
-- item_name, quantity, unit_price, amount, display_order は既存

-- 3. インデックスの追加
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_display_order ON invoice_items(invoice_id, display_order);

-- 4. コメントの追加（ドキュメント化）
COMMENT ON COLUMN invoice_items.product_id IS '商品マスタへの参照（削除時はNULLにセット）';
COMMENT ON COLUMN invoice_items.unit IS '単位（個、時間、式など）';
COMMENT ON COLUMN invoice_items.description IS '明細の補足説明';
COMMENT ON COLUMN invoice_items.display_order IS '表示順序（並び替え用）';

-- 5. 既存データの更新（unitのデフォルト値設定）
UPDATE invoice_items
SET unit = '個'
WHERE unit IS NULL;

-- 6. 明細作成時の商品情報自動入力用関数
CREATE OR REPLACE FUNCTION populate_invoice_item_from_product()
RETURNS TRIGGER AS $$
BEGIN
  -- product_idが設定されている場合、商品情報から自動入力
  IF NEW.product_id IS NOT NULL THEN
    -- 商品マスタから情報を取得して設定（未設定の項目のみ）
    IF NEW.item_name IS NULL OR NEW.item_name = '' THEN
      SELECT name INTO NEW.item_name
      FROM products
      WHERE id = NEW.product_id
        AND deleted_at IS NULL;
    END IF;

    IF NEW.unit_price IS NULL OR NEW.unit_price = 0 THEN
      SELECT default_price INTO NEW.unit_price
      FROM products
      WHERE id = NEW.product_id
        AND deleted_at IS NULL;
    END IF;

    IF NEW.unit IS NULL OR NEW.unit = '' THEN
      SELECT unit INTO NEW.unit
      FROM products
      WHERE id = NEW.product_id
        AND deleted_at IS NULL;
    END IF;
  END IF;

  -- 金額の自動計算
  IF NEW.quantity IS NOT NULL AND NEW.unit_price IS NOT NULL THEN
    NEW.amount = NEW.quantity * NEW.unit_price;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. トリガーの作成（明細作成時）
DROP TRIGGER IF EXISTS populate_invoice_item_on_insert ON invoice_items;
CREATE TRIGGER populate_invoice_item_on_insert
  BEFORE INSERT ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION populate_invoice_item_from_product();

-- 8. トリガーの作成（明細更新時）
DROP TRIGGER IF EXISTS populate_invoice_item_on_update ON invoice_items;
CREATE TRIGGER populate_invoice_item_on_update
  BEFORE UPDATE ON invoice_items
  FOR EACH ROW
  WHEN (OLD.product_id IS DISTINCT FROM NEW.product_id
    OR OLD.quantity IS DISTINCT FROM NEW.quantity
    OR OLD.unit_price IS DISTINCT FROM NEW.unit_price)
  EXECUTE FUNCTION populate_invoice_item_from_product();

-- 9. 消費税計算用の関数（10%固定、端数切り捨て）
CREATE OR REPLACE FUNCTION calculate_tax(subtotal DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  -- 10%の消費税を計算（端数切り捨て）
  RETURN FLOOR(subtotal * 0.1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. 合計金額計算用のビュー（オプション）
CREATE OR REPLACE VIEW invoice_totals AS
SELECT
  i.id as invoice_id,
  i.invoice_number,
  COALESCE(SUM(ii.amount), 0) as subtotal,
  calculate_tax(COALESCE(SUM(ii.amount), 0)) as tax_amount,
  COALESCE(SUM(ii.amount), 0) + calculate_tax(COALESCE(SUM(ii.amount), 0)) as total_amount
FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
WHERE i.deleted_at IS NULL
GROUP BY i.id, i.invoice_number;

-- 11. サンプルクエリ（実行は任意）
/*
-- 請求書の明細と合計を確認
SELECT
  i.invoice_number,
  ii.display_order,
  ii.item_name,
  p.name as product_name,
  ii.quantity,
  ii.unit,
  ii.unit_price,
  ii.amount
FROM invoices i
JOIN invoice_items ii ON i.id = ii.invoice_id
LEFT JOIN products p ON ii.product_id = p.id
WHERE i.id = 'YOUR_INVOICE_ID'
ORDER BY ii.display_order;

-- 請求書の合計金額を確認
SELECT * FROM invoice_totals WHERE invoice_id = 'YOUR_INVOICE_ID';
*/