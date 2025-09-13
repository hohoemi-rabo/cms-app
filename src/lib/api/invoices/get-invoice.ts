import { supabaseServer } from '@/lib/supabase/server'
import { Invoice, InvoiceItem, InvoiceWithItems } from '@/types/invoice'

/**
 * 請求書一覧を取得する
 */
export async function getInvoices(): Promise<Invoice[]> {
  const supabase = supabaseServer
  
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`請求書一覧取得エラー: ${error.message}`)
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }
}

/**
 * 請求書詳細を取得する（明細含む）
 */
export async function getInvoiceById(id: string): Promise<InvoiceWithItems | null> {
  const supabase = supabaseServer
  
  try {
    // 1. 請求書基本情報を取得
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (invoiceError) {
      if (invoiceError.code === 'PGRST116') {
        return null // 見つからない場合
      }
      throw new Error(`請求書取得エラー: ${invoiceError.message}`)
    }
    
    if (!invoice) {
      return null
    }
    
    // 2. 明細を取得
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('display_order', { ascending: true })
    
    if (itemsError) {
      throw new Error(`明細取得エラー: ${itemsError.message}`)
    }
    
    return {
      ...invoice,
      items: items || []
    }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    throw error
  }
}

/**
 * 請求書番号で請求書を取得する
 */
export async function getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
  const supabase = supabaseServer
  
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`請求書取得エラー: ${error.message}`)
    }
    
    return data
  } catch (error) {
    console.error('Error fetching invoice by number:', error)
    throw error
  }
}