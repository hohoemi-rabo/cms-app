import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import type { Customer } from '@/types/supabase'

export interface SearchCustomersParams {
  searchText?: string
  customerType?: 'company' | 'personal'
  class?: string
  tagIds?: string[]
  page?: number
  limit?: number
  sortBy?: 'name' | 'name_kana' | 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchCustomersResponse {
  data: Customer[]
  totalCount: number
  page: number
  totalPages: number
  limit: number
  searchParams: SearchCustomersParams
}

/**
 * 顧客を検索する - working with-tags APIベースの実装
 * @param params - 検索パラメータ
 * @returns 検索結果とページング情報
 */
export async function searchCustomers(
  params: SearchCustomersParams = {}
): Promise<SearchCustomersResponse> {
  try {
    const {
      customerType,
      class: customerClass,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params

    const offset = (page - 1) * limit

    // 1. ベースクエリを作成
    let query = supabaseServer
      .from('customers')
      .select('*')
      .is('deleted_at', null)
    
    // 2. フィルタ条件を適用
    if (customerType) {
      query = query.eq('customer_type', customerType)
    }
    
    if (customerClass) {
      query = query.eq('class', customerClass)  
    }
    
    // 3. ソートとページネーション
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: customers, error: customersError } = await query

    if (customersError) {
      const errorResponse = handleSupabaseError(customersError)
      throw new Error(errorResponse.message)
    }

    // 2. 総数を取得（同じフィルタ条件で）
    let countQuery = supabaseServer
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
    
    // 総数クエリにも同じフィルタを適用
    if (customerType) {
      countQuery = countQuery.eq('customer_type', customerType)
    }
    
    if (customerClass) {
      countQuery = countQuery.eq('class', customerClass)
    }

    const { count, error: countError } = await countQuery
    
    if (countError) {
      console.error('Count error:', countError)
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      data: customers || [],
      totalCount,
      page,
      totalPages,
      limit,
      searchParams: params
    }
  } catch (error) {
    console.error('Error searching customers:', error)
    throw error
  }
}

/**
 * 顧客の検索候補を取得する（オートコンプリート用）
 * テキスト検索機能は一時的に無効化 - 基本リストのみ返す
 * @param searchText - 検索テキスト
 * @param limit - 最大取得件数（デフォルト: 10件）
 * @returns 検索候補の顧客リスト
 */
export async function getCustomerSuggestions(
  searchText: string,
  limit: number = 10
): Promise<Pick<Customer, 'id' | 'name' | 'name_kana' | 'customer_type' | 'company_name'>[]> {
  try {
    if (!searchText || searchText.trim().length < 1) {
      return []
    }

    // 一時的にテキスト検索を無効化し、基本リストを返す
    const { data, error } = await supabaseServer
      .from('customers')
      .select('id, name, name_kana, customer_type, company_name')
      .is('deleted_at', null)
      .order('name')
      .limit(limit)

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    return data || []
  } catch (error) {
    console.error('Error getting customer suggestions:', error)
    throw error
  }
}

/**
 * 利用可能なクラス一覧を取得する
 * @returns クラス一覧
 */
export async function getAvailableClasses(): Promise<string[]> {
  try {
    const { data, error } = await supabaseServer
      .from('customers')
      .select('class')
      .is('deleted_at', null)
      .not('class', 'is', null)
      .not('class', 'eq', '')

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    // 重複を除去してソート
    const classes = [...new Set(data?.map(c => c.class).filter(Boolean) || [])]
    return classes.sort()
  } catch (error) {
    console.error('Error getting available classes:', error)
    throw error
  }
}