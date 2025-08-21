import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'

/**
 * 顧客のタグ一覧を取得
 * GET /api/customers/[id]/tags
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: '顧客IDが指定されていません' },
        { status: 400 }
      )
    }

    // 顧客に関連付けられたタグを取得
    const { data, error } = await supabaseServer
      .from('customer_tags')
      .select(`
        tag_id,
        tags (
          id,
          name,
          created_at
        )
      `)
      .eq('customer_id', id)

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    // タグ情報のみを抽出
    const tags = (data || []).map(item => item.tags).filter(tag => tag !== null)

    return NextResponse.json({
      success: true,
      data: tags
    })
  } catch (error) {
    console.error('Get Customer Tags API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get customer tags' 
      },
      { status: 500 }
    )
  }
}

/**
 * 顧客にタグを設定（完全置換）
 * PUT /api/customers/[id]/tags
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: '顧客IDが指定されていません' },
        { status: 400 }
      )
    }

    // 入力データの型チェック
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: '不正なリクエストデータです' },
        { status: 400 }
      )
    }

    const { tagIds = [] } = body

    // tagIdsが配列かチェック
    if (!Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: 'tagIdsは配列である必要があります' },
        { status: 400 }
      )
    }

    // 顧客の存在チェック
    const { data: customer, error: customerError } = await supabaseServer
      .from('customers')
      .select('id')
      .eq('id', id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: '指定された顧客が見つかりません' },
        { status: 404 }
      )
    }

    // タグIDが有効かチェック
    if (tagIds.length > 0) {
      const { data: existingTags, error: tagsError } = await supabaseServer
        .from('tags')
        .select('id')
        .in('id', tagIds)

      if (tagsError) {
        const errorResponse = handleSupabaseError(tagsError)
        throw new Error(errorResponse.message)
      }

      const existingTagIds = existingTags?.map(tag => tag.id) || []
      const invalidTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId))

      if (invalidTagIds.length > 0) {
        return NextResponse.json(
          { error: `無効なタグIDが含まれています: ${invalidTagIds.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // 既存のタグ関連付けを削除
    const { error: deleteError } = await supabaseServer
      .from('customer_tags')
      .delete()
      .eq('customer_id', id)

    if (deleteError) {
      const errorResponse = handleSupabaseError(deleteError)
      throw new Error(`既存タグの削除に失敗しました: ${errorResponse.message}`)
    }

    // 新しいタグ関連付けを作成
    if (tagIds.length > 0) {
      const customerTags = tagIds.map(tagId => ({
        customer_id: id,
        tag_id: tagId
      }))

      const { error: insertError } = await supabaseServer
        .from('customer_tags')
        .insert(customerTags)

      if (insertError) {
        const errorResponse = handleSupabaseError(insertError)
        throw new Error(`新しいタグの関連付けに失敗しました: ${errorResponse.message}`)
      }
    }

    // 更新後のタグ一覧を取得
    const { data: updatedTags, error: getError } = await supabaseServer
      .from('customer_tags')
      .select(`
        tags (
          id,
          name,
          created_at
        )
      `)
      .eq('customer_id', id)

    if (getError) {
      console.error('Error fetching updated tags:', getError)
    }

    const tags = (updatedTags || []).map(item => item.tags).filter(tag => tag !== null)

    return NextResponse.json({
      success: true,
      data: tags,
      message: 'タグを更新しました'
    })
  } catch (error) {
    console.error('Update Customer Tags API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update customer tags' 
      },
      { status: 500 }
    )
  }
}

/**
 * 顧客にタグを追加
 * POST /api/customers/[id]/tags
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: '顧客IDが指定されていません' },
        { status: 400 }
      )
    }

    // 入力データの型チェック
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: '不正なリクエストデータです' },
        { status: 400 }
      )
    }

    const { tagIds = [] } = body

    // tagIdsが配列かチェック
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json(
        { error: '追加するタグIDを指定してください' },
        { status: 400 }
      )
    }

    // 顧客の存在チェック
    const { data: customer, error: customerError } = await supabaseServer
      .from('customers')
      .select('id')
      .eq('id', id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: '指定された顧客が見つかりません' },
        { status: 404 }
      )
    }

    // タグIDが有効かチェック
    const { data: existingTags, error: tagsError } = await supabaseServer
      .from('tags')
      .select('id')
      .in('id', tagIds)

    if (tagsError) {
      const errorResponse = handleSupabaseError(tagsError)
      throw new Error(errorResponse.message)
    }

    const existingTagIds = existingTags?.map(tag => tag.id) || []
    const invalidTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId))

    if (invalidTagIds.length > 0) {
      return NextResponse.json(
        { error: `無効なタグIDが含まれています: ${invalidTagIds.join(', ')}` },
        { status: 400 }
      )
    }

    // 既に関連付けられているタグをチェック
    const { data: currentTags } = await supabaseServer
      .from('customer_tags')
      .select('tag_id')
      .eq('customer_id', id)

    const currentTagIds = currentTags?.map(item => item.tag_id) || []
    const newTagIds = tagIds.filter(tagId => !currentTagIds.includes(tagId))

    if (newTagIds.length === 0) {
      return NextResponse.json(
        { error: '指定されたタグは既に関連付けられています' },
        { status: 409 }
      )
    }

    // 新しいタグ関連付けを作成
    const customerTags = newTagIds.map(tagId => ({
      customer_id: id,
      tag_id: tagId
    }))

    const { error: insertError } = await supabaseServer
      .from('customer_tags')
      .insert(customerTags)

    if (insertError) {
      const errorResponse = handleSupabaseError(insertError)
      throw new Error(`タグの関連付けに失敗しました: ${errorResponse.message}`)
    }

    // 更新後のタグ一覧を取得
    const { data: updatedTags, error: getError } = await supabaseServer
      .from('customer_tags')
      .select(`
        tags (
          id,
          name,
          created_at
        )
      `)
      .eq('customer_id', id)

    if (getError) {
      console.error('Error fetching updated tags:', getError)
    }

    const tags = (updatedTags || []).map(item => item.tags).filter(tag => tag !== null)

    return NextResponse.json({
      success: true,
      data: tags,
      message: `${newTagIds.length}個のタグを追加しました`
    })
  } catch (error) {
    console.error('Add Customer Tags API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to add customer tags' 
      },
      { status: 500 }
    )
  }
}