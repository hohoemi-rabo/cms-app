import { supabaseServer } from '@/lib/supabase/server'
import { InvoiceCreateInput, InvoiceWithItems } from '@/types/invoice'

/**
 * 請求書を更新する
 */
export async function updateInvoice(id: string, data: InvoiceCreateInput): Promise<InvoiceWithItems> {
  const supabase = supabaseServer
  
  try {
    // UUIDの形式チェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      throw new Error('無効な請求書IDです')
    }

    // 1. 請求書が存在するかチェック
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existingInvoice) {
      throw new Error('請求書が見つかりません')
    }

    // 2. 明細の合計金額を計算
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

    // 3. 請求書基本情報を更新
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        issue_date: data.issue_date,
        billing_name: data.billing_name,
        total_amount: totalAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Invoice update error:', updateError)
      throw new Error('請求書の更新に失敗しました')
    }

    // 4. 既存の明細を削除
    const { error: deleteItemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id)

    if (deleteItemsError) {
      console.error('Items delete error:', deleteItemsError)
      throw new Error('明細の更新に失敗しました')
    }

    // 5. 新しい明細を作成
    const itemsToInsert = data.items.map((item, index) => ({
      invoice_id: id,
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      display_order: index + 1
    }))

    const { error: insertItemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert)

    if (insertItemsError) {
      console.error('Items insert error:', insertItemsError)
      throw new Error('明細の更新に失敗しました')
    }

    // 6. 更新された請求書を取得
    const { data: updatedInvoice, error: getError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (getError || !updatedInvoice) {
      throw new Error('更新後の請求書取得に失敗しました')
    }

    // 7. 明細を取得
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('display_order', { ascending: true })

    if (itemsError) {
      console.error('Items fetch error:', itemsError)
      // 明細取得エラーでも基本情報は返す
      return {
        ...updatedInvoice,
        items: []
      }
    }

    return {
      ...updatedInvoice,
      items: items || []
    }
  } catch (error) {
    console.error('Error updating invoice:', error)
    throw error instanceof Error ? error : new Error('請求書の更新に失敗しました')
  }
}