import { supabaseServer } from '@/lib/supabase/server'

/**
 * 請求書を論理削除する
 */
export async function deleteInvoice(id: string): Promise<void> {
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
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existingInvoice) {
      throw new Error('請求書が見つかりません')
    }

    const now = new Date().toISOString()

    // 2. 請求書を論理削除
    const { error: invoiceDeleteError } = await supabase
      .from('invoices')
      .update({ 
        deleted_at: now,
        updated_at: now
      })
      .eq('id', id)

    if (invoiceDeleteError) {
      console.error('Invoice delete error:', invoiceDeleteError)
      throw new Error('請求書の削除に失敗しました')
    }

    // 3. 明細も論理削除
    const { error: itemsDeleteError } = await supabase
      .from('invoice_items')
      .update({ 
        deleted_at: now,
        updated_at: now
      })
      .eq('invoice_id', id)

    if (itemsDeleteError) {
      console.error('Invoice items delete error:', itemsDeleteError)
      // 明細の削除に失敗した場合は警告を出すが処理は続行
      console.warn('明細の削除に失敗しましたが、請求書は削除されました')
    }

  } catch (error) {
    console.error('Error deleting invoice:', error)
    throw error instanceof Error ? error : new Error('請求書の削除に失敗しました')
  }
}