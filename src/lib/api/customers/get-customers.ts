import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import type { Customer } from '@/types/supabase'

export interface GetCustomersParams {
  page?: number
  limit?: number
  sortBy?: 'name' | 'name_kana' | 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

export interface GetCustomersResponse {
  data: Customer[]
  totalCount: number
  page: number
  totalPages: number
  limit: number
}

/**
 * 顧客一覧を取得する
 * @param params - 取得パラメータ（ページネーション、ソート）
 * @returns 顧客一覧とページング情報
 */
export async function getCustomers(
  params: GetCustomersParams = {}
): Promise<GetCustomersResponse> {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params

    // オフセット計算
    const offset = (page - 1) * limit

    // クエリビルダー
    let query = supabaseServer
      .from('customers')
      .select('*', { count: 'exact' })
      .is('deleted_at', null) // 論理削除されていないデータのみ

    // ソート設定
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // ページネーション
    query = query.range(offset, offset + limit - 1)

    // データ取得
    const { data, error, count } = await query

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    // 総ページ数計算
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      data: data || [],
      totalCount,
      page,
      totalPages,
      limit
    }
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw error
  }
}

/**
 * 顧客の総数を取得する（削除済みを除く）
 * @returns 顧客の総数
 */
export async function getCustomersCount(): Promise<number> {
  try {
    const { count, error } = await supabaseServer
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching customers count:', error)
    throw error
  }
}

/**
 * 最近登録された顧客を取得する
 * @param limit - 取得件数（デフォルト: 5件）
 * @returns 最近登録された顧客リスト
 */
export async function getRecentCustomers(limit: number = 5): Promise<Customer[]> {
  try {
    const { data, error } = await supabaseServer
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching recent customers:', error)
    throw error
  }
}