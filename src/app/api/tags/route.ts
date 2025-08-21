import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'

/**
 * タグ一覧を取得
 * GET /api/tags
 */
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('tags')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tags' 
      },
      { status: 500 }
    )
  }
}

/**
 * タグを作成
 * POST /api/tags
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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

    // 重複チェック
    const { data: existingTag } = await supabaseServer
      .from('tags')
      .select('id')
      .eq('name', trimmedName)
      .single()

    if (existingTag) {
      return NextResponse.json(
        { error: 'このタグ名は既に存在します' },
        { status: 409 }
      )
    }

    // タグ作成
    const { data, error } = await supabaseServer
      .from('tags')
      .insert({ name: trimmedName })
      .select()
      .single()

    if (error) {
      const errorResponse = handleSupabaseError(error)
      throw new Error(errorResponse.message)
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'タグを作成しました'
    }, { status: 201 })

  } catch (error) {
    console.error('Create Tag API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create tag' 
      },
      { status: 500 }
    )
  }
}