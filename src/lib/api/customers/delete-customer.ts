import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import { getCustomerById, type CustomerWithTags } from './get-customer'

export interface DeleteCustomerResult {
  success: boolean
  customerId: string
  deletedAt: string
  message: string
}

/**
 * 顧客を論理削除する
 * @param id - 削除する顧客のID
 * @returns 削除結果
 */
export async function deleteCustomer(id: string): Promise<DeleteCustomerResult> {
  try {
    // 1. IDの形式チェック
    if (!id || id.trim() === '') {
      throw new Error('顧客IDが指定されていません')
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      throw new Error('顧客IDの形式が正しくありません')
    }

    // 2. 顧客の存在チェック
    const existingCustomer = await getCustomerById(id)
    if (!existingCustomer) {
      throw new Error('指定された顧客が見つかりません')
    }

    // 3. 既に削除済みかチェック
    if (existingCustomer.deleted_at) {
      throw new Error('この顧客は既に削除されています')
    }

    // 4. 論理削除の実行
    const deletedAt = new Date().toISOString()
    
    const { error: deleteError } = await supabaseServer
      .from('customers')
      .update({
        deleted_at: deletedAt,
        updated_at: deletedAt
      })
      .eq('id', id)
      .is('deleted_at', null) // 削除されていない顧客のみ対象

    if (deleteError) {
      const errorResponse = handleSupabaseError(deleteError)
      throw new Error(`顧客の削除に失敗しました: ${errorResponse.message}`)
    }

    // 5. タグの関連は保持（復元可能にするため）
    // customer_tagsテーブルのデータはそのまま残す

    return {
      success: true,
      customerId: id,
      deletedAt,
      message: '顧客を削除しました'
    }
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw error
  }
}

/**
 * 削除された顧客を復元する（将来実装用）
 * @param id - 復元する顧客のID
 * @returns 復元された顧客データ
 */
export async function restoreCustomer(id: string): Promise<CustomerWithTags> {
  try {
    // 1. IDの形式チェック
    if (!id || id.trim() === '') {
      throw new Error('顧客IDが指定されていません')
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      throw new Error('顧客IDの形式が正しくありません')
    }

    // 2. 削除済み顧客の存在チェック
    const { data: deletedCustomer, error: getError } = await supabaseServer
      .from('customers')
      .select('*')
      .eq('id', id)
      .not('deleted_at', 'is', null)
      .single()

    if (getError) {
      if (getError.code === 'PGRST116') {
        throw new Error('指定された削除済み顧客が見つかりません')
      }
      const errorResponse = handleSupabaseError(getError)
      throw new Error(`顧客データの取得に失敗しました: ${errorResponse.message}`)
    }

    if (!deletedCustomer) {
      throw new Error('指定された削除済み顧客が見つかりません')
    }

    // 3. 復元の実行
    const restoredAt = new Date().toISOString()
    
    const { error: restoreError } = await supabaseServer
      .from('customers')
      .update({
        deleted_at: null,
        updated_at: restoredAt
      })
      .eq('id', id)
      .not('deleted_at', 'is', null) // 削除済みの顧客のみ対象

    if (restoreError) {
      const errorResponse = handleSupabaseError(restoreError)
      throw new Error(`顧客の復元に失敗しました: ${errorResponse.message}`)
    }

    // 4. 復元された顧客データを取得
    const restoredCustomer = await getCustomerById(id)
    
    if (!restoredCustomer) {
      throw new Error('復元された顧客データの取得に失敗しました')
    }

    return restoredCustomer
  } catch (error) {
    console.error('Error restoring customer:', error)
    throw error
  }
}

/**
 * 削除済み顧客一覧を取得する（管理用）
 * @param limit - 取得件数の上限
 * @returns 削除済み顧客一覧
 */
export async function getDeletedCustomers(limit: number = 50): Promise<{
  data: any[]
  count: number
}> {
  try {
    // 削除済み顧客の件数を取得
    const { count, error: countError } = await supabaseServer
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null)

    if (countError) {
      const errorResponse = handleSupabaseError(countError)
      throw new Error(`削除済み顧客の件数取得に失敗しました: ${errorResponse.message}`)
    }

    // 削除済み顧客データを取得
    const { data, error: dataError } = await supabaseServer
      .from('customers')
      .select(`
        id,
        customer_type,
        company_name,
        name,
        name_kana,
        email,
        phone,
        deleted_at,
        updated_at
      `)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
      .limit(limit)

    if (dataError) {
      const errorResponse = handleSupabaseError(dataError)
      throw new Error(`削除済み顧客データの取得に失敗しました: ${errorResponse.message}`)
    }

    return {
      data: data || [],
      count: count || 0
    }
  } catch (error) {
    console.error('Error getting deleted customers:', error)
    throw error
  }
}