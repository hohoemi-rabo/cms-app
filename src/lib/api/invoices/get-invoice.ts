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
    // UUIDの形式チェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return null // 無効なUUID形式の場合はnullを返す
    }

    // 1. 請求書基本情報を取得
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (invoiceError) {
      console.error('Invoice fetch error:', invoiceError)
      // PGRST116は「レコードが見つからない」を意味するので、nullを返す
      if (invoiceError.code === 'PGRST116') {
        console.log('Invoice not found (PGRST116), returning null for 404')
        return null
      }
      // その他のエラーの場合もnullを返して404扱いにする
      return null
    }
    
    if (!invoice) {
      return null
    }
    
    // 2. 明細を取得（削除済みを除外）
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (itemsError) {
      console.error('Invoice items fetch error:', itemsError.message, itemsError.code)
      // 明細取得エラーの場合も、基本情報だけで返す
      return {
        ...invoice,
        items: []
      }
    }
    
    return {
      ...invoice,
      items: items || []
    }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    // 予期しないエラーの場合もnullを返して404扱いにする
    return null
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