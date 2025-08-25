import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import { getCustomerById, type CustomerWithTags } from './get-customer'
import type { Customer } from '@/types/supabase'

export interface UpdateCustomerInput {
  id: string
  customer_type?: 'company' | 'personal'
  company_name?: string | null
  name?: string
  name_kana?: string | null
  class?: string | null
  birth_date?: string | null
  postal_code?: string | null
  prefecture?: string | null
  city?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  contract_start_date?: string | null
  invoice_method?: 'mail' | 'email' | null
  payment_terms?: string | null
  memo?: string | null
  tagIds?: string[]
}

export interface UpdateValidationError {
  field: string
  message: string
}

/**
 * 更新用入力データのバリデーション
 */
export function validateUpdateCustomerInput(input: UpdateCustomerInput): UpdateValidationError[] {
  const errors: UpdateValidationError[] = []

  // IDは必須
  if (!input.id || input.id.trim() === '') {
    errors.push({ field: 'id', message: 'IDは必須です' })
  }

  // UUIDフォーマットチェック
  if (input.id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(input.id)) {
      errors.push({ field: 'id', message: 'IDの形式が正しくありません' })
    }
  }

  // nameが指定されている場合は必須チェック
  if (input.name !== undefined && (!input.name || input.name.trim() === '')) {
    errors.push({ field: 'name', message: '名前は必須です' })
  }

  // 顧客種別と会社名の整合性チェック
  if (input.customer_type === 'company' && input.company_name !== undefined && (!input.company_name || input.company_name.trim() === '')) {
    errors.push({ field: 'company_name', message: '法人の場合は会社名が必須です' })
  }

  // メールアドレス形式チェック
  if (input.email !== undefined && input.email !== null && input.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      errors.push({ field: 'email', message: 'メールアドレスの形式が正しくありません' })
    }
  }

  // 電話番号の基本的なチェック
  if (input.phone !== undefined && input.phone !== null && input.phone.trim() !== '') {
    const phoneRegex = /^[\d-]+$/
    if (!phoneRegex.test(input.phone.trim())) {
      errors.push({ field: 'phone', message: '電話番号は数字とハイフンのみ使用できます' })
    }
  }

  // 郵便番号の形式チェック
  if (input.postal_code !== undefined && input.postal_code !== null && input.postal_code.trim() !== '') {
    const postalRegex = /^\d{3}-\d{4}$/
    if (!postalRegex.test(input.postal_code.trim())) {
      errors.push({ field: 'postal_code', message: '郵便番号は000-0000の形式で入力してください' })
    }
  }

  return errors
}

/**
 * 顧客のタグを更新する（完全置換）
 */
async function updateCustomerTags(customerId: string, tagIds: string[]): Promise<void> {
  const supabase = supabaseServer
  try {
    console.log(`Deleting existing tags for customer ${customerId}`)
    // 既存のタグ関連を削除
    const { error: deleteError } = await supabase
      .from('customer_tags')
      .delete()
      .eq('customer_id', customerId)

    if (deleteError) {
      console.error('Error deleting existing tags:', deleteError)
      const errorResponse = handleSupabaseError(deleteError)
      throw new Error(`既存タグの削除に失敗しました: ${errorResponse.message}`)
    }
    console.log(`Deleted existing tags for customer ${customerId}`)

    // 新しいタグ関連を作成
    if (tagIds.length > 0) {
      const customerTags = tagIds.map(tagId => ({
        customer_id: customerId,
        tag_id: tagId
      }))
      console.log(`Inserting ${tagIds.length} new tags for customer ${customerId}:`, customerTags)

      const { error: insertError } = await supabase
        .from('customer_tags')
        .insert(customerTags)

      if (insertError) {
        console.error('Error inserting new tags:', insertError)
        const errorResponse = handleSupabaseError(insertError)
        throw new Error(`新しいタグの関連付けに失敗しました: ${errorResponse.message}`)
      }
      console.log(`Successfully inserted ${tagIds.length} tags`)
    } else {
      console.log(`No new tags to insert for customer ${customerId}`)
    }
  } catch (error) {
    console.error('Error updating customer tags:', error)
    throw error
  }
}

/**
 * 顧客データを更新する
 * @param input - 更新用の入力データ（部分更新対応）
 * @returns 更新された顧客データ（タグ情報含む）
 */
export async function updateCustomer(input: UpdateCustomerInput): Promise<CustomerWithTags> {
  const supabase = supabaseServer
  try {
    // 1. バリデーション
    const validationErrors = validateUpdateCustomerInput(input)
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(err => `${err.field}: ${err.message}`).join(', ')
      throw new Error(`入力データが正しくありません: ${errorMessages}`)
    }

    // 2. 顧客が存在するかチェック
    const existingCustomer = await getCustomerById(input.id)
    if (!existingCustomer) {
      throw new Error('指定された顧客が見つかりません')
    }

    // 3. タグIDを除いた更新データを準備
    const { id, tagIds, ...updateData } = input
    
    // 更新するフィールドのみを抽出（undefinedは除外）
    const fieldsToUpdate: Partial<Customer> = {}
    
    // 各フィールドをチェックして、undefinedでない場合のみ追加
    if (updateData.customer_type !== undefined) fieldsToUpdate.customer_type = updateData.customer_type
    if (updateData.company_name !== undefined) {
      fieldsToUpdate.company_name = updateData.company_name?.trim() || null
    }
    if (updateData.name !== undefined) fieldsToUpdate.name = updateData.name.trim()
    if (updateData.name_kana !== undefined) {
      fieldsToUpdate.name_kana = updateData.name_kana?.trim() || null
    }
    if (updateData.class !== undefined) {
      fieldsToUpdate.class = updateData.class?.trim() || null
    }
    if (updateData.birth_date !== undefined) fieldsToUpdate.birth_date = updateData.birth_date
    if (updateData.postal_code !== undefined) {
      fieldsToUpdate.postal_code = updateData.postal_code?.trim() || null
    }
    if (updateData.prefecture !== undefined) {
      fieldsToUpdate.prefecture = updateData.prefecture?.trim() || null
    }
    if (updateData.city !== undefined) {
      fieldsToUpdate.city = updateData.city?.trim() || null
    }
    if (updateData.address !== undefined) {
      fieldsToUpdate.address = updateData.address?.trim() || null
    }
    if (updateData.phone !== undefined) {
      fieldsToUpdate.phone = updateData.phone?.trim() || null
    }
    if (updateData.email !== undefined) {
      fieldsToUpdate.email = updateData.email?.trim() || null
    }
    if (updateData.contract_start_date !== undefined) {
      fieldsToUpdate.contract_start_date = updateData.contract_start_date
    }
    if (updateData.invoice_method !== undefined) fieldsToUpdate.invoice_method = updateData.invoice_method
    if (updateData.payment_terms !== undefined) {
      fieldsToUpdate.payment_terms = updateData.payment_terms?.trim() || null
    }
    if (updateData.memo !== undefined) {
      fieldsToUpdate.memo = updateData.memo?.trim() || null
    }

    // updated_atを自動設定
    fieldsToUpdate.updated_at = new Date().toISOString()

    // 4. 顧客データを更新（更新するフィールドがある場合のみ）
    if (Object.keys(fieldsToUpdate).length > 1) { // updated_at以外のフィールドがある場合
      const { error: updateError } = await supabase
        .from('customers')
        .update(fieldsToUpdate)
        .eq('id', id)
        .is('deleted_at', null)

      if (updateError) {
        const errorResponse = handleSupabaseError(updateError)
        throw new Error(`顧客データの更新に失敗しました: ${errorResponse.message}`)
      }
    }

    // 5. タグの更新（tagIdsが指定されている場合のみ）
    if (tagIds !== undefined) {
      console.log(`Updating tags for customer ${id}:`, tagIds)
      await updateCustomerTags(id, tagIds)
      console.log(`Tags updated successfully for customer ${id}`)
    }

    // 6. 更新された顧客データを取得
    const updatedCustomer = await getCustomerById(id)
    
    if (!updatedCustomer) {
      throw new Error('更新された顧客データの取得に失敗しました')
    }

    return updatedCustomer
  } catch (error) {
    console.error('Error updating customer:', error)
    throw error
  }
}