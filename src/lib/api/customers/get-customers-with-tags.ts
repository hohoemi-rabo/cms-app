import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import type { Customer, Tag } from '@/types/supabase'
import type { GetCustomersParams, GetCustomersResponse } from './get-customers'

// 顧客とタグを含む型定義
export interface CustomerWithTags extends Customer {
  tags: Tag[]
}

export interface GetCustomersWithTagsResponse {
  data: CustomerWithTags[]
  totalCount: number
  page: number
  totalPages: number
  limit: number
}

/**
 * タグ情報を含む顧客一覧を取得する
 * @param params - 取得パラメータ（ページネーション、ソート）
 * @returns タグを含む顧客一覧とページング情報
 */
export async function getCustomersWithTags(
  params: GetCustomersParams = {}
): Promise<GetCustomersWithTagsResponse> {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params

    // オフセット計算
    const offset = (page - 1) * limit

    // 顧客データとタグを結合して取得
    let query = supabaseServer
      .from('customers')
      .select(`
        *,
        customer_tags!left (
          tag_id,
          tags!inner (
            id,
            name,
            created_at
          )
        )
      `, { count: 'exact' })
      .is('deleted_at', null)

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

    // データ整形（ネストした構造をフラットに）
    const formattedData: CustomerWithTags[] = (data || []).map(customer => {
      const tags = customer.customer_tags
        ?.map((ct: any) => ct.tags)
        .filter((tag: any) => tag !== null) || []
      
      // customer_tagsを除外し、tagsを直接配列として追加
      const { customer_tags, ...customerData } = customer
      
      return {
        ...customerData,
        tags
      } as CustomerWithTags
    })

    // 総ページ数計算
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      data: formattedData,
      totalCount,
      page,
      totalPages,
      limit
    }
  } catch (error) {
    console.error('Error fetching customers with tags:', error)
    throw error
  }
}

/**
 * 単一の顧客をタグ情報を含めて取得する
 * @param customerId - 顧客ID
 * @returns タグを含む顧客データ
 */
export async function getCustomerWithTags(customerId: string): Promise<CustomerWithTags | null> {
  try {
    const { data, error } = await supabaseServer
      .from('customers')
      .select(`
        *,
        customer_tags!left (
          tag_id,
          tags!inner (
            id,
            name,
            created_at
          )
        )
      `)
      .eq('id', customerId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // データが見つからない
      }
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    if (!data) {
      return null
    }

    // データ整形
    const tags = data.customer_tags
      ?.map((ct: any) => ct.tags)
      .filter((tag: any) => tag !== null) || []
    
    const { customer_tags, ...customerData } = data
    
    return {
      ...customerData,
      tags
    } as CustomerWithTags
  } catch (error) {
    console.error('Error fetching customer with tags:', error)
    throw error
  }
}

/**
 * 最近登録された顧客をタグ情報を含めて取得する
 * @param limit - 取得件数（デフォルト: 5件）
 * @returns タグを含む最近登録された顧客リスト
 */
export async function getRecentCustomersWithTags(limit: number = 5): Promise<CustomerWithTags[]> {
  try {
    const { data, error } = await supabaseServer
      .from('customers')
      .select(`
        *,
        customer_tags!left (
          tag_id,
          tags!inner (
            id,
            name,
            created_at
          )
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    // データ整形
    const formattedData: CustomerWithTags[] = (data || []).map(customer => {
      const tags = customer.customer_tags
        ?.map((ct: any) => ct.tags)
        .filter((tag: any) => tag !== null) || []
      
      const { customer_tags, ...customerData } = customer
      
      return {
        ...customerData,
        tags
      } as CustomerWithTags
    })

    return formattedData
  } catch (error) {
    console.error('Error fetching recent customers with tags:', error)
    throw error
  }
}