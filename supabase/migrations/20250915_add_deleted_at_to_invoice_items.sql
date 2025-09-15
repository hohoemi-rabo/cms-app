-- invoice_itemsテーブルに論理削除用のdeleted_atカラムを追加

-- 1. deleted_atカラムを追加
ALTER TABLE invoice_items
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. deleted_atカラム用のインデックスを作成（検索性能向上のため）
CREATE INDEX idx_invoice_items_deleted_at ON invoice_items(deleted_at);

-- 3. 既存のupdated_atトリガーが動作することを確認
-- （invoice_itemsには既にupdated_atトリガーが設定済み）

-- 4. コメントを追加
COMMENT ON COLUMN invoice_items.deleted_at IS '論理削除用タイムスタンプ（NULLの場合は削除されていない）';