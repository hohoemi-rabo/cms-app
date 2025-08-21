import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'
import type { Customer, Tag } from '@/types/supabase'

// 顧客とタグを含む型定義
export interface CustomerWithTags extends Customer {
  tags: Tag[]
}

/**
 * シンプルな方法でタグ情報を含む顧客一覧を取得する
 * まず顧客を取得し、その後タグ情報を別途取得して結合
 */
export async function getCustomersWithTagsSimple(limit: number = 20): Promise<CustomerWithTags[]> {
  try {
    // 1. まず顧客データを取得
    const { data: customers, error: customersError } = await supabaseServer
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (customersError) {
      const errorResponse = handleSupabaseError(customersError)
      throw new Error(errorResponse.message)
    }

    if (!customers || customers.length === 0) {
      return []
    }

    // 2. 顧客IDのリストを作成
    const customerIds = customers.map(c => c.id)

    // 3. customer_tagsとtagsを結合して取得
    const { data: customerTags, error: tagsError } = await supabaseServer
      .from('customer_tags')
      .select(`
        customer_id,
        tags (
          id,
          name,
          created_at
        )
      `)
      .in('customer_id', customerIds)

    if (tagsError) {
      console.error('Error fetching tags:', tagsError)
      // タグの取得に失敗してもcustomersは返す
      return customers.map(customer => ({
        ...customer,
        tags: []
      }))
    }

    // 4. 顧客IDごとにタグをグループ化
    const tagsByCustomerId: Record<string, Tag[]> = {}
    
    if (customerTags) {
      customerTags.forEach((ct: any) => {
        if (ct.tags) {
          if (!tagsByCustomerId[ct.customer_id]) {
            tagsByCustomerId[ct.customer_id] = []
          }
          tagsByCustomerId[ct.customer_id].push(ct.tags)
        }
      })
    }

    // 5. 顧客データにタグを結合
    const customersWithTags: CustomerWithTags[] = customers.map(customer => ({
      ...customer,
      tags: tagsByCustomerId[customer.id] || []
    }))

    return customersWithTags
  } catch (error) {
    console.error('Error fetching customers with tags:', error)
    throw error
  }
}