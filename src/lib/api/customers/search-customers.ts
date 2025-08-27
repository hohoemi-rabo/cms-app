import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import type { Customer, Tag } from '@/types/supabase'

// 検索結果用の顧客型（タグ情報含む）
export interface CustomerWithTags extends Omit<Customer, 'id'> {
  id: string
  tags: Tag[]
}

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
  data: CustomerWithTags[]
  totalCount: number
  page: number
  totalPages: number
  limit: number
  searchParams: SearchCustomersParams
}

/**
 * 顧客を検索する - タグ情報含む
 * @param params - 検索パラメータ
 * @returns 検索結果とページング情報
 */
export async function searchCustomers(
  params: SearchCustomersParams = {}
): Promise<SearchCustomersResponse> {
  const supabase = supabaseServer
  try {
    const {
      searchText,
      customerType,
      class: customerClass,
      tagIds,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params

    const offset = (page - 1) * limit

    // 1. タグフィルタがある場合、該当する顧客IDを先に取得
    let customerIdsFromTag: string[] | undefined
    if (tagIds && tagIds.length > 0) {
      const { data: taggedCustomers, error: tagError } = await supabase
        .from('customer_tags')
        .select('customer_id')
        .in('tag_id', tagIds)
      
      if (tagError) {
        const errorResponse = handleSupabaseError(tagError)
        throw new Error(errorResponse.message)
      }
      
      customerIdsFromTag = taggedCustomers?.map(tc => tc.customer_id) || []
      
      // タグフィルタで顧客が0件の場合、早期リターン
      if (customerIdsFromTag.length === 0) {
        return {
          data: [],
          totalCount: 0,
          page,
          totalPages: 0,
          limit,
          searchParams: params
        }
      }
    }

    // 2. 顧客の基本情報を取得
    let query = supabase
      .from('customers')
      .select('*')
    
    // タグフィルタがある場合、顧客IDでフィルタリング
    if (customerIdsFromTag) {
      query = query.in('id', customerIdsFromTag)
    }
    
    // 3. テキスト検索条件を適用（複数フィールド対応）
    if (searchText && searchText.trim()) {
      const searchPattern = `%${searchText.trim()}%`
      
      // 複数フィールドでOR検索（名前、会社名、メール、電話番号）
      query = query.or(
        `name.ilike.${searchPattern},company_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`
      )
    }
    
    // 4. その他のフィルタ条件を適用
    if (customerType) {
      query = query.eq('customer_type', customerType)
    }
    
    if (customerClass) {
      query = query.eq('class', customerClass)  
    }
    
    // 5. ソートとページネーション
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: customers, error: customersError } = await query

    if (customersError) {
      const errorResponse = handleSupabaseError(customersError)
      throw new Error(errorResponse.message)
    }

    // 4. 各顧客のタグを取得
    const customersWithTags: CustomerWithTags[] = []
    
    if (customers && customers.length > 0) {
      for (const customer of customers) {
        // 各顧客のタグを取得
        const { data: customerTags, error: tagsError } = await supabase
          .from('customer_tags')
          .select(`
            tags (
              id,
              name,
              created_at
            )
          `)
          .eq('customer_id', customer.id)

        let tags: Tag[] = []
        if (tagsError) {
          // タグの取得に失敗してもエラーにしない
        } else if (customerTags && Array.isArray(customerTags)) {
          // タグ情報を整形
          customerTags.forEach((ct) => {
            const tagData = ct.tags as unknown
            if (tagData && typeof tagData === 'object' && 'id' in tagData) {
              tags.push(tagData as Tag)
            }
          })
        }

        customersWithTags.push({
          ...customer,
          tags
        })
      }
    }

    // 6. 総数を取得（同じフィルタ条件で）
    let countQuery = supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
    
    // タグフィルタがある場合、顧客IDでフィルタリング
    if (customerIdsFromTag) {
      countQuery = countQuery.in('id', customerIdsFromTag)
    }
    
    // 総数クエリにも同じフィルタを適用
    if (searchText && searchText.trim()) {
      const searchPattern = `%${searchText.trim()}%`
      countQuery = countQuery.or(
        `name.ilike.${searchPattern},company_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`
      )
    }
    
    if (customerType) {
      countQuery = countQuery.eq('customer_type', customerType)
    }
    
    if (customerClass) {
      countQuery = countQuery.eq('class', customerClass)
    }

    const { count } = await countQuery

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      data: customersWithTags,
      totalCount,
      page,
      totalPages,
      limit,
      searchParams: params
    }
  } catch (error) {
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
    throw error
  }
}