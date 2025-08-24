import Papa from 'papaparse'
import { z } from 'zod'
import type { ParsedCustomerData } from './csv-import-server'

// インポート結果の型定義
export interface ImportResult {
  success: number
  failed: number
  errors: ImportError[]
  data: ParsedCustomerData[]
}

export interface ImportError {
  row: number
  field?: string
  message: string
  data?: Record<string, unknown>
}

// CSVヘッダーのマッピング定義
const HEADER_MAPPING: Record<string, string> = {
  '顧客ID': 'id',
  '顧客種別': 'customer_type',
  '会社名': 'company_name',
  '氏名': 'name',
  'フリガナ': 'name_kana',
  'クラス': 'class',
  '生年月日': 'birth_date',
  '郵便番号': 'postal_code',
  '都道府県': 'prefecture',
  '市区町村': 'city',
  '番地・建物名': 'address',
  '電話番号': 'phone',
  'メールアドレス': 'email',
  '契約開始日': 'contract_start_date',
  '請求書送付方法': 'invoice_delivery_method',
  '支払い条件': 'payment_terms',
  'タグ': 'tags',
  '備考': 'notes',
}

// 必須ヘッダー
const REQUIRED_HEADERS = ['氏名', '顧客種別']

// バリデーションスキーマ
const customerImportSchema = z.object({
  customer_type: z.enum(['個人', '法人', 'personal', 'company']),
  company_name: z.string().optional().nullable(),
  name: z.string().min(1, '氏名は必須です'),
  name_kana: z.string().optional().nullable(),
  class: z.string().optional().nullable(),
  birth_date: z.string().optional().nullable(),
  postal_code: z.string().regex(/^\d{3}-?\d{4}$/, '郵便番号の形式が不正です').optional().nullable().or(z.literal('')),
  prefecture: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().regex(/^[\d-]+$/, '電話番号の形式が不正です').optional().nullable().or(z.literal('')),
  email: z.string().email('メールアドレスの形式が不正です').optional().nullable().or(z.literal('')),
  contract_start_date: z.string().optional().nullable(),
  invoice_delivery_method: z.string().optional().nullable(),
  payment_terms: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// 顧客種別の正規化
function normalizeCustomerType(type: string): 'personal' | 'company' {
  const normalizedType = type.trim().toLowerCase()
  if (normalizedType === '個人' || normalizedType === 'personal') {
    return 'personal'
  }
  if (normalizedType === '法人' || normalizedType === 'company') {
    return 'company'
  }
  throw new Error(`不正な顧客種別: ${type}`)
}

// 日付形式の変換 (YYYY/MM/DD または YYYY-MM-DD をISO形式に)
function convertDateToISO(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.trim() === '') return null
  
  // 既にISO形式の場合はそのまま返す
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  // YYYY/MM/DD形式の場合は変換
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('/')
    const year = parts[0]
    const month = parts[1].padStart(2, '0')
    const day = parts[2].padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return dateStr
}

// CSVデータを顧客データ形式に変換
function mapRowToCustomerData(headers: string[], values: string[]): any {
  const data: any = {}
  
  headers.forEach((header, index) => {
    const fieldName = HEADER_MAPPING[header]
    if (fieldName) {
      let value = values[index]?.trim() || null
      
      // 特別な変換処理
      if (fieldName === 'customer_type' && value) {
        try {
          value = normalizeCustomerType(value)
        } catch (error) {
          // バリデーションで処理
        }
      }
      
      // 日付フィールドの変換
      if ((fieldName === 'birth_date' || fieldName === 'contract_start_date') && value) {
        value = convertDateToISO(value)
      }
      
      // 空文字列はnullに変換
      if (value === '') {
        value = null
      }
      
      data[fieldName] = value
    }
  })
  
  return data
}

// CSVファイルのパースとバリデーション
export async function parseCustomerCSV(file: File): Promise<{
  data: any[]
  errors: ImportError[]
  headers: string[]
}> {
  return new Promise((resolve, reject) => {
    const errors: ImportError[] = []
    const validData: any[] = []
    let headers: string[] = []
    
    Papa.parse(file, {
      encoding: 'UTF-8',
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          results.errors.forEach((error) => {
            errors.push({
              row: error.row ?? 0,
              message: error.message,
            })
          })
        }
        
        const rows = results.data as string[][]
        
        if (rows.length === 0) {
          reject(new Error('CSVファイルが空です'))
          return
        }
        
        // ヘッダー行の取得
        headers = rows[0].map(h => h.trim())
        
        // 必須ヘッダーのチェック
        const missingHeaders = REQUIRED_HEADERS.filter(
          required => !headers.includes(required)
        )
        
        if (missingHeaders.length > 0) {
          reject(new Error(`必須列が不足しています: ${missingHeaders.join(', ')}`))
          return
        }
        
        // データ行の処理
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i]
          
          // 空行はスキップ
          if (values.every(v => !v || v.trim() === '')) {
            continue
          }
          
          try {
            // データマッピング
            const rowData = mapRowToCustomerData(headers, values)
            
            // バリデーション
            const validationResult = customerImportSchema.safeParse(rowData)
            
            if (validationResult.success) {
              validData.push(validationResult.data)
            } else {
              validationResult.error.issues.forEach((issue) => {
                errors.push({
                  row: i + 1,
                  field: issue.path.join('.'),
                  message: issue.message,
                  data: rowData,
                })
              })
            }
          } catch (error) {
            errors.push({
              row: i + 1,
              message: error instanceof Error ? error.message : '行の処理中にエラーが発生しました',
              data: { values },
            })
          }
        }
        
        resolve({
          data: validData,
          errors,
          headers,
        })
      },
      error: (error) => {
        reject(new Error(`CSVパースエラー: ${error.message}`))
      },
    })
  })
}

// CSVテンプレートの生成
export function generateCSVTemplate(): string {
  const headers = [
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
    '備考'
  ]
  
  const sampleData = [
    [
      '個人',
      '',
      '山田太郎',
      'ヤマダタロウ',
      'A',
      '1990/1/1',
      '100-0001',
      '東京都',
      '千代田区',
      '千代田1-1-1',
      '03-1234-5678',
      'yamada@example.com',
      '2024/1/1',
      'メール',
      '月末締め翌月末払い',
      '新規,重要顧客',
      'サンプルデータ'
    ],
    [
      '法人',
      '株式会社サンプル',
      '佐藤花子',
      'サトウハナコ',
      'B',
      '',
      '530-0001',
      '大阪府',
      '大阪市北区',
      '梅田1-1-1',
      '06-1234-5678',
      'sato@sample.co.jp',
      '2024/2/1',
      '郵送',
      '月末締め翌々月末払い',
      'VIP',
      ''
    ]
  ]
  
  // CSVコンテンツの生成（BOM付きUTF-8）
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.map(cell => {
      // セル内にカンマ、改行、ダブルクォートが含まれる場合はクォート
      if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(','))
  ].join('\n')
  
  // BOM付きで返す（Excelでの文字化け防止）
  return '\uFEFF' + csvContent
}

// 顧客データの重複チェック
export function checkDuplicates(data: any[]): {
  duplicates: Array<{ indices: number[], field: string, value: string }>
  unique: any[]
} {
  const duplicates: Array<{ indices: number[], field: string, value: string }> = []
  const emailMap = new Map<string, number[]>()
  const phoneMap = new Map<string, number[]>()
  
  // メールアドレスと電話番号で重複チェック
  data.forEach((item, index) => {
    if (item.email) {
      const existing = emailMap.get(item.email) || []
      existing.push(index)
      emailMap.set(item.email, existing)
    }
    
    if (item.phone) {
      const normalizedPhone = item.phone.replace(/-/g, '')
      const existing = phoneMap.get(normalizedPhone) || []
      existing.push(index)
      phoneMap.set(normalizedPhone, existing)
    }
  })
  
  // 重複の検出
  emailMap.forEach((indices, email) => {
    if (indices.length > 1) {
      duplicates.push({
        indices,
        field: 'メールアドレス',
        value: email
      })
    }
  })
  
  phoneMap.forEach((indices, phone) => {
    if (indices.length > 1) {
      duplicates.push({
        indices,
        field: '電話番号',
        value: phone
      })
    }
  })
  
  // 重複を除いたユニークなデータ
  const duplicateIndices = new Set<number>()
  duplicates.forEach(dup => {
    dup.indices.slice(1).forEach(index => duplicateIndices.add(index))
  })
  
  const unique = data.filter((_, index) => !duplicateIndices.has(index))
  
  return { duplicates, unique }
}