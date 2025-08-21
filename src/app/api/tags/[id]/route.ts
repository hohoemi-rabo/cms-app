import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'

/**
 * 単一タグを取得
 * GET /api/tags/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'タグIDが指定されていません' },
        { status: 400 }
      )
    }

    // UUIDフォーマットチェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'タグIDの形式が正しくありません' },
        { status: 400 }
      )
    }

    // タグデータ取得
    const { data, error } = await supabaseServer
      .from('tags')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '指定されたタグが見つかりません' },
          { status: 404 }
        )
      }
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Get Tag API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get tag' 
      },
      { status: 500 }
    )
  }
}

/**
 * タグを更新
 * PUT /api/tags/[id]
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
        { error: 'タグIDが指定されていません' },
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

    const { name } = body

    // バリデーション
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'タグ名は必須です' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // 文字数制限
    if (trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'タグ名は50文字以内で入力してください' },
        { status: 400 }
      )
    }

    // 既存タグの存在チェック
    const { data: existingTag } = await supabaseServer
      .from('tags')
      .select('id, name')
      .eq('id', id)
      .single()

    if (!existingTag) {
      return NextResponse.json(
        { error: '指定されたタグが見つかりません' },
        { status: 404 }
      )
    }

    // 名前が変更されている場合、重複チェック
    if (trimmedName !== existingTag.name) {
      const { data: duplicateTag } = await supabaseServer
        .from('tags')
        .select('id')
        .eq('name', trimmedName)
        .neq('id', id)
        .single()

      if (duplicateTag) {
        return NextResponse.json(
          { error: 'このタグ名は既に存在します' },
          { status: 409 }
        )
      }
    }

    // タグ更新
    const { data, error } = await supabaseServer
      .from('tags')
      .update({ name: trimmedName })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'タグを更新しました'
    })
  } catch (error) {
    console.error('Update Tag API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update tag' 
      },
      { status: 500 }
    )
  }
}

/**
 * タグを削除
 * DELETE /api/tags/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'タグIDが指定されていません' },
        { status: 400 }
      )
    }

    // UUIDフォーマットチェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'タグIDの形式が正しくありません' },
        { status: 400 }
      )
    }

    // タグが使用中かチェック
    const { data: usageCount, error: countError } = await supabaseServer
      .from('customer_tags')
      .select('customer_id', { count: 'exact', head: true })
      .eq('tag_id', id)

    if (countError) {
      console.error('Usage count check error:', countError)
    }

    const usage = usageCount || 0

    // 使用中のタグは削除を警告（ただし削除は実行）
    if (usage > 0) {
      // 関連する customer_tags レコードを先に削除
      const { error: customerTagsError } = await supabaseServer
        .from('customer_tags')
        .delete()
        .eq('tag_id', id)

      if (customerTagsError) {
        const errorResponse = handleSupabaseError(customerTagsError)
        throw new Error(`関連データの削除に失敗しました: ${errorResponse.message}`)
      }
    }

    // タグ削除
    const { data, error } = await supabaseServer
      .from('tags')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '指定されたタグが見つかりません' },
          { status: 404 }
        )
      }
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    return NextResponse.json({
      success: true,
      data,
      message: usage > 0 
        ? `タグを削除しました（${usage}件の顧客から関連付けを解除）`
        : 'タグを削除しました'
    })
  } catch (error) {
    console.error('Delete Tag API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to delete tag' 
      },
      { status: 500 }
    )
  }
}