-- 請求書検索パフォーマンス向上のためのインデックス作成

-- 発行日でのソート・検索用インデックス
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);

-- 請求書番号での検索用インデックス
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- 請求先名での検索用インデックス（部分一致検索用）
CREATE INDEX IF NOT EXISTS idx_invoices_billing_name ON invoices(billing_name);

-- 金額範囲検索用インデックス
CREATE INDEX IF NOT EXISTS idx_invoices_total_amount ON invoices(total_amount);

-- 顧客IDでの検索用インデックス
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);

-- 複合インデックス（よく使われる組み合わせ）
CREATE INDEX IF NOT EXISTS idx_invoices_date_amount ON invoices(issue_date DESC, total_amount DESC);

-- 全文検索用のGINインデックス（請求書番号、請求先名、備考）
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_invoices_search_text ON invoices
  USING gin ((invoice_number || ' ' || billing_name || ' ' || COALESCE(notes, '')) gin_trgm_ops);

-- 分析クエリ
ANALYZE invoices;