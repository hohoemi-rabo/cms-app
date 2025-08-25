import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import type { Tag } from '@/types/supabase'

// 実際のデータベースフィールドに基づく顧客型定義
export interface CustomerWithTags {
  id: string
  customer_type: 'company' | 'personal'
  company_name?: string | null
  name: string
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
  created_at: string
  updated_at?: string | null
  deleted_at?: string | null
  tags: Tag[]
}

/**
 * IDを指定して特定の顧客データを取得する
 * @param id 顧客ID (UUID形式)
 * @returns 顧客データ（タグ情報含む）またはnull
 */
export async function getCustomerById(id: string): Promise<CustomerWithTags | null> {
  const supabase = supabaseServer
  try {
    // IDの基本的なバリデーション（空文字チェックなど）
    if (!id || typeof id !== 'string') {
      return null
    }

    // 1. 顧客の基本情報を取得
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (customerError) {
      console.error('Supabase customer fetch error:', customerError)
      if (customerError.code === 'PGRST116') {
        // データが見つからない場合
        return null
      }
      // エラーの詳細をログ出力
      console.error('Customer ID:', id)
      console.error('Error code:', customerError.code)
      console.error('Error message:', customerError.message)
      
      const errorResponse = handleSupabaseError(customerError)
      throw new Error(errorResponse.message)
    }

    if (!customer) {
      return null
    }

    // 2. 関連タグを取得
    console.log(`Fetching tags for customer ${id}`)
    const { data: customerTags, error: tagsError } = await supabase
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

    console.log(`Customer tags data for ${id}:`, customerTags)

    // 3. タグ情報を整形
    const tags: Tag[] = []
    if (customerTags && Array.isArray(customerTags)) {
      customerTags.forEach((ct) => {
        // Supabaseのクエリは単一オブジェクトを返すことがある
        const tagData = ct.tags as unknown
        if (tagData && typeof tagData === 'object' && 'id' in tagData) {
          tags.push(tagData as Tag)
        }
      })
    }
    
    console.log(`Formatted tags for ${id}:`, tags)

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
    if (!id || typeof id !== 'string') {
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