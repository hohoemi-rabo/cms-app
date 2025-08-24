import { CustomerWithTags } from '@/lib/api/customers/get-customer'

export interface ExportOptions {
  encoding?: 'utf8' | 'sjis'
  includeDeleted?: boolean
  columns?: string[]
  dateFormat?: 'iso' | 'japanese'
}

/**
 * 日付をフォーマットする
 */
function formatDate(dateString?: string | null, format: 'iso' | 'japanese' = 'japanese'): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  if (format === 'japanese') {
    return date.toLocaleDateString('ja-JP')
  }
  
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}

/**
 * CSVセル用にテキストをエスケープする
 */
function escapeCSVCell(value: any): string {
  if (value === null || value === undefined) return ''
  
  const str = String(value)
  
  // ダブルクォート、カンマ、改行が含まれている場合はエスケープが必要
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    // ダブルクォートを2つにエスケープしてから全体をダブルクォートで囲む
    return `"${str.replace(/"/g, '""')}"`
  }
  
  return str
}

/**
 * 顧客データをCSV形式で生成する
 */
export function generateCustomerCSV(
  customers: CustomerWithTags[],
  options: ExportOptions = {}
): string {
  const {
    dateFormat = 'japanese',
    includeDeleted = false
  } = options

  // 削除済み顧客をフィルタリング
  const filteredCustomers = includeDeleted 
    ? customers 
    : customers.filter(customer => !customer.deleted_at)

  // ヘッダー行
  const headers = [
    '顧客ID',
    '顧客種別',
    '会社名',
    '氏名',
    'フリガナ',
    'クラス',
    '生年月日',
    '郵便番号',
    '都道府県',
    '市区町村',
    '番地・建物名',
    '電話番号',
    'メールアドレス',
    '契約開始日',
    '請求書送付方法',
    '支払い条件',
    'タグ',
    '備考',
    '登録日',
    '更新日'
  ]
  
  // データ行を生成
  const rows = filteredCustomers.map(customer => {
    const invoiceMethodText = customer.invoice_method === 'mail' ? '郵送' : 
                             customer.invoice_method === 'email' ? 'メール' : ''
    
    const tagsText = customer.tags?.map(tag => tag.name).join('、') || ''
    
    return [
      customer.id,
      customer.customer_type === 'company' ? '法人' : '個人',
      customer.company_name || '',
      customer.name,
      customer.name_kana || '',
      customer.class || '',
      formatDate(customer.birth_date, dateFormat),
      customer.postal_code || '',
      customer.prefecture || '',
      customer.city || '',
      customer.address || '',
      customer.phone || '',
      customer.email || '',
      formatDate(customer.contract_start_date, dateFormat),
      invoiceMethodText,
      customer.payment_terms || '',
      tagsText,
      customer.memo || '',
      formatDate(customer.created_at, dateFormat),
      formatDate(customer.updated_at, dateFormat)
    ]
  })
  
  // CSV文字列を生成
  const csvLines = [headers, ...rows].map(row => 
    row.map(cell => escapeCSVCell(cell)).join(',')
  )
  
  const csvContent = csvLines.join('\n')
  
  // BOM付きUTF-8（Excel対応）
  return '\uFEFF' + csvContent
}

/**
 * CSVファイル名を生成する
 */
export function generateCSVFileName(prefix: string = 'customers'): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_')
  return `${prefix}_${dateStr}.csv`
}

/**
 * ブラウザでCSVファイルをダウンロードする
 */
export function downloadCSV(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // メモリリークを防ぐ
  URL.revokeObjectURL(url)
}

/**
 * エクスポート統計情報
 */
export interface ExportStats {
  totalCount: number
  exportedCount: number
  deletedCount: number
  companyCount: number
  personalCount: number
}

/**
 * エクスポート統計を生成する
 */
export function generateExportStats(
  customers: CustomerWithTags[],
  options: ExportOptions = {}
): ExportStats {
  const { includeDeleted = false } = options
  
  const filteredCustomers = includeDeleted 
    ? customers 
    : customers.filter(customer => !customer.deleted_at)
  
  const deletedCount = customers.filter(customer => customer.deleted_at).length
  const companyCount = filteredCustomers.filter(customer => customer.customer_type === 'company').length
  const personalCount = filteredCustomers.filter(customer => customer.customer_type === 'personal').length
  
  return {
    totalCount: customers.length,
    exportedCount: filteredCustomers.length,
    deletedCount,
    companyCount,
    personalCount
  }
}