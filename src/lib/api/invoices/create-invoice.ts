import { supabaseServer } from '@/lib/supabase/server'
import { InvoiceCreateInput, Invoice, InvoiceItem } from '@/types/invoice'

/**
 * 請求書を作成する
 */
export async function createInvoice(data: InvoiceCreateInput): Promise<Invoice> {
  const supabase = supabaseServer
  
  try {
    // 1. 請求書番号を生成
    const { data: invoiceNumber, error: numberError } = await supabase
      .rpc('generate_invoice_number')
    
    if (numberError) {
      throw new Error(`請求書番号生成エラー: ${numberError.message}`)
    }
    
    // 2. 合計金額を計算
    const totalAmount = data.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price)
    }, 0)
    
    // 3. 請求書を作成
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        issue_date: data.issue_date,
        billing_name: data.billing_name,
        billing_address: data.billing_address || null,
        billing_honorific: data.billing_honorific || '様',
        customer_id: data.customer_id || null,
        total_amount: totalAmount
      })
      .select()
      .single()
    
    if (invoiceError) {
      throw new Error(`請求書作成エラー: ${invoiceError.message}`)
    }
    
    // 4. 明細を作成
    if (data.items.length > 0) {
      const itemsToInsert = data.items.map((item: any, index) => ({
        invoice_id: invoice.id,
        product_id: item.product_id || null,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit || '個',
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price,
        description: item.description || null,
        display_order: index
      }))
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)
      
      if (itemsError) {
        // 請求書を削除してロールバック
        await supabase
          .from('invoices')
          .delete()
          .eq('id', invoice.id)
        
        throw new Error(`明細作成エラー: ${itemsError.message}`)
      }
    }
    
    return invoice
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw error
  }
}