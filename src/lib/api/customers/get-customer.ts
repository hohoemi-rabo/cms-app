import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import type { Customer, Tag } from '@/types/supabase'

// 顧客とタグを含む型定義
export interface CustomerWithTags extends Customer {
  tags: Tag[]
}

/**
 * IDを指定して特定の顧客データを取得する
 * @param id 顧客ID (UUID形式)
 * @returns 顧客データ（タグ情報含む）またはnull
 */
export async function getCustomerById(id: string): Promise<CustomerWithTags | null> {
  try {
    // UUID形式の簡単なバリデーション
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return null
    }

    // 1. 顧客の基本情報を取得
    const { data: customer, error: customerError } = await supabaseServer
      .from('customers')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        // データが見つからない場合
        return null
      }
      const errorResponse = handleSupabaseError(customerError)
      throw new Error(errorResponse.message)
    }

    if (!customer) {
      return null
    }

    // 2. 関連タグを取得
    const { data: customerTags, error: tagsError } = await supabaseServer
      .from('customer_tags')
      .select(`
        tags (
          id,
          name,
          created_at
        )
      `)
      .eq('customer_id', id)

    if (tagsError) {
      console.error('Error fetching customer tags:', tagsError)
      // タグの取得に失敗しても顧客データは返す
      return {
        ...customer,
        tags: []
      }
    }

    // 3. タグ情報を整形
    const tags: Tag[] = []
    if (customerTags) {
      customerTags.forEach((ct: any) => {
        if (ct.tags) {
          tags.push(ct.tags)
        }
      })
    }

    return {
      ...customer,
      tags
    }
  } catch (error) {
    console.error('Error fetching customer by ID:', error)
    throw error
  }
}

/**
 * 顧客の存在チェック（削除済みも含む）
 * @param id 顧客ID
 * @returns 存在する場合true
 */
export async function customerExists(id: string): Promise<boolean> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return false
    }

    const { data, error } = await supabaseServer
      .from('customers')
      .select('id')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return false
      }
      throw error
    }

    return !!data
  } catch (error) {
    console.error('Error checking customer existence:', error)
    return false
  }
}