import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'

export interface Tag {
  id: string
  name: string
  created_at: string
}

/**
 * タグ名の配列からタグIDの配列を取得する
 * 存在しないタグは新規作成する
 * @param tagNames タグ名の配列
 * @returns タグIDの配列
 */
export async function createOrFindTags(tagNames: string[]): Promise<string[]> {
  if (!tagNames || tagNames.length === 0) {
    return []
  }

  // 空文字やスペースのみのタグを除外し、正規化
  const normalizedNames = tagNames
    .map(name => name.trim())
    .filter(name => name.length > 0)
    .filter(name => name.length <= 50) // 50文字制限

  if (normalizedNames.length === 0) {
    return []
  }

  try {
    // 既存のタグを取得
    const { data: existingTags, error: fetchError } = await supabaseServer
      .from('tags')
      .select('id, name')
      .in('name', normalizedNames)

    if (fetchError) {
      const errorResponse = handleSupabaseError(fetchError)
      throw new Error(`既存タグの取得に失敗: ${errorResponse.message}`)
    }

    const existingTagMap = new Map<string, string>()
    existingTags?.forEach(tag => {
      existingTagMap.set(tag.name, tag.id)
    })

    // 新規作成が必要なタグを特定
    const newTagNames = normalizedNames.filter(name => !existingTagMap.has(name))

    // 新規タグを作成
    if (newTagNames.length > 0) {
      const newTags = newTagNames.map(name => ({ name }))
      
      const { data: createdTags, error: createError } = await supabaseServer
        .from('tags')
        .insert(newTags)
        .select('id, name')

      if (createError) {
        const errorResponse = handleSupabaseError(createError)
        throw new Error(`新規タグの作成に失敗: ${errorResponse.message}`)
      }

      // 作成されたタグをマップに追加
      createdTags?.forEach(tag => {
        existingTagMap.set(tag.name, tag.id)
      })
    }

    // 全タグのIDを返す
    return normalizedNames.map(name => existingTagMap.get(name)!).filter(Boolean)

  } catch (error) {
    console.error('Error in createOrFindTags:', error)
    throw error
  }
}

/**
 * 顧客にタグを関連付ける
 * @param customerId 顧客ID
 * @param tagIds タグIDの配列
 */
export async function associateCustomerTags(customerId: string, tagIds: string[]): Promise<void> {
  if (!tagIds || tagIds.length === 0) {
    return
  }

  try {
    const customerTags = tagIds.map(tagId => ({
      customer_id: customerId,
      tag_id: tagId
    }))

    const { error } = await supabaseServer
      .from('customer_tags')
      .insert(customerTags)

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(`タグ関連付けに失敗: ${errorResponse.message}`)
    }
  } catch (error) {
    console.error('Error in associateCustomerTags:', error)
    throw error
  }
}