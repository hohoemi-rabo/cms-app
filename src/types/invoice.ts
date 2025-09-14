// 請求書関連の型定義

export interface Invoice {
  id: string
  invoice_number: string
  issue_date: string // ISO 8601 format (YYYY-MM-DD)
  billing_name: string
  billing_address?: string | null
  billing_honorific?: string
  customer_id?: string | null
  customer_snapshot?: any | null
  total_amount: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id?: string | null
  item_name: string
  quantity: number
  unit?: string
  unit_price: number
  amount: number
  description?: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[]
}

// フォーム用の型定義
export interface InvoiceFormData {
  issue_date: string
  billing_name: string
  billing_address?: string
  billing_honorific?: string
  customer_id?: string | null
  items: InvoiceItemFormData[]
}

export interface InvoiceItemFormData {
  product_id?: string | null
  item_name: string
  quantity: number
  unit?: string
  unit_price: number
  amount?: number // 自動計算される
  description?: string
}

// API レスポンス用の型定義
export interface InvoiceCreateInput {
  issue_date: string
  billing_name: string
  billing_address?: string
  billing_honorific?: string
  customer_id?: string
  items: Omit<InvoiceItemFormData, 'amount'>[]
}

export interface InvoiceUpdateInput {
  issue_date?: string
  billing_name?: string
  billing_address?: string
  billing_honorific?: string
  customer_id?: string | null
  items?: Omit<InvoiceItemFormData, 'amount'>[]
}