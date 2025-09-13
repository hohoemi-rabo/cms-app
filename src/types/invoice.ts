// 請求書関連の型定義

export interface Invoice {
  id: string
  invoice_number: string
  issue_date: string // ISO 8601 format (YYYY-MM-DD)
  billing_name: string
  total_amount: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  item_name: string
  quantity: number
  unit_price: number
  amount: number
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
  items: InvoiceItemFormData[]
}

export interface InvoiceItemFormData {
  item_name: string
  quantity: number
  unit_price: number
  amount?: number // 自動計算される
}

// API レスポンス用の型定義
export interface InvoiceCreateInput {
  issue_date: string
  billing_name: string
  items: Omit<InvoiceItemFormData, 'amount'>[]
}

export interface InvoiceUpdateInput {
  issue_date?: string
  billing_name?: string
  items?: Omit<InvoiceItemFormData, 'amount'>[]
}