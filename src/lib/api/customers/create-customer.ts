import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import { getCustomerById, type CustomerWithTags } from './get-customer'
import type { Customer } from '@/types/supabase'

export interface CreateCustomerInput {
  customer_type: 'company' | 'personal'
  company_name?: string
  name: string
  name_kana?: string
  class?: string
  birth_date?: string
  postal_code?: string
  prefecture?: string
  city?: string
  address?: string
  phone?: string
  email?: string
  contract_start_date?: string
  invoice_method?: 'mail' | 'email'
  payment_terms?: string
  memo?: string
  tagIds?: string[]
}

export interface ValidationError {
  field: string
  message: string
}

/**
 * 入力データのバリデーション
 */
export function validateCustomerInput(input: CreateCustomerInput): ValidationError[] {
  const errors: ValidationError[] = []

  // 必須項目チェック
  if (!input.customer_type) {
    errors.push({ field: 'customer_type', message: '顧客種別は必須です' })
  }

  if (!input.name || input.name.trim() === '') {
    errors.push({ field: 'name', message: '名前は必須です' })
  }

  // 顧客種別固有のバリデーション
  if (input.customer_type === 'company' && (!input.company_name || input.company_name.trim() === '')) {
    errors.push({ field: 'company_name', message: '法人の場合は会社名が必須です' })
  }

  // メールアドレス形式チェック
  if (input.email && input.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      errors.push({ field: 'email', message: 'メールアドレスの形式が正しくありません' })
    }
  }

  // 電話番号の基本的なチェック（ハイフンと数字のみ）
  if (input.phone && input.phone.trim() !== '') {
    const phoneRegex = /^[\d-]+$/
    if (!phoneRegex.test(input.phone.trim())) {
      errors.push({ field: 'phone', message: '電話番号は数字とハイフンのみ使用できます' })
    }
  }

  // 郵便番号の形式チェック
  if (input.postal_code && input.postal_code.trim() !== '') {
    const postalRegex = /^\d{3}-\d{4}$/
    if (!postalRegex.test(input.postal_code.trim())) {
      errors.push({ field: 'postal_code', message: '郵便番号は000-0000の形式で入力してください' })
    }
  }

  return errors
}

/**
 * タグを顧客に関連付ける
 */
async function attachTagsToCustomer(customerId: string, tagIds: string[]): Promise<void> {
  if (!tagIds || tagIds.length === 0) return

  const customerTags = tagIds.map(tagId => ({
    customer_id: customerId,
    tag_id: tagId
  }))

  const { error } = await supabaseServer
    .from('customer_tags')
    .insert(customerTags)

  if (error) {
    console.error('Error attaching tags:', error)
    const errorResponse = handleSupabaseError(error)
    throw new Error(`タグの関連付けに失敗しました: ${errorResponse.message}`)
  }
}

/**
 * 新規顧客を作成する
 * @param input - 顧客作成用の入力データ
 * @returns 作成された顧客データ（タグ情報含む）
 */
export async function createCustomer(input: CreateCustomerInput): Promise<CustomerWithTags> {
  try {
    // 1. バリデーション
    const validationErrors = validateCustomerInput(input)
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(err => `${err.field}: ${err.message}`).join(', ')
      throw new Error(`入力データが正しくありません: ${errorMessages}`)
    }

    // 2. タグIDを除いた顧客データを準備
    const { tagIds, ...customerData } = input
    
    // 3. 顧客データを挿入
    const { data: customer, error: insertError } = await supabaseServer
      .from('customers')
      .insert({
        ...customerData,
        // トリム処理
        name: customerData.name.trim(),
        name_kana: customerData.name_kana?.trim() || null,
        company_name: customerData.company_name?.trim() || null,
        email: customerData.email?.trim() || null,
        phone: customerData.phone?.trim() || null,
        postal_code: customerData.postal_code?.trim() || null,
        prefecture: customerData.prefecture?.trim() || null,
        city: customerData.city?.trim() || null,
        address: customerData.address?.trim() || null,
        payment_terms: customerData.payment_terms?.trim() || null,
        memo: customerData.memo?.trim() || null,
        class: customerData.class?.trim() || null
      })
      .select()
      .single()

    if (insertError) {
      const errorResponse = handleSupabaseError(insertError)
      throw new Error(`顧客の作成に失敗しました: ${errorResponse.message}`)
    }

    if (!customer) {
      throw new Error('顧客の作成に失敗しました: データが返されませんでした')
    }

    // 4. タグの関連付け
    if (tagIds && tagIds.length > 0) {
      await attachTagsToCustomer(customer.id, tagIds)
    }

    // 5. 作成された顧客データを取得（タグ情報含む）
    const createdCustomer = await getCustomerById(customer.id)
    
    if (!createdCustomer) {
      throw new Error('作成された顧客データの取得に失敗しました')
    }

    return createdCustomer
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}