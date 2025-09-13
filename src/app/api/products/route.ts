import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { ProductCreateInput } from '@/types/product'

// 商品一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    let query = supabaseServer
      .from('products')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('商品一覧取得エラー:', error)
    return NextResponse.json(
      { success: false, message: '商品一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 商品新規作成
export async function POST(request: NextRequest) {
  try {
    const body: ProductCreateInput = await request.json()

    // バリデーション
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: '商品名は必須です' },
        { status: 400 }
      )
    }

    if (body.name.length > 100) {
      return NextResponse.json(
        { success: false, message: '商品名は100文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (body.default_price === undefined || body.default_price < 0) {
      return NextResponse.json(
        { success: false, message: '単価は0以上の数値を入力してください' },
        { status: 400 }
      )
    }

    if (!body.unit || body.unit.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: '単位は必須です' },
        { status: 400 }
      )
    }

    if (body.unit.length > 50) {
      return NextResponse.json(
        { success: false, message: '単位は50文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (body.description && body.description.length > 500) {
      return NextResponse.json(
        { success: false, message: '説明文は500文字以内で入力してください' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        name: body.name.trim(),
        default_price: body.default_price,
        unit: body.unit.trim(),
        description: body.description?.trim() || null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error) {
    console.error('商品作成エラー:', error)
    return NextResponse.json(
      { success: false, message: '商品の作成に失敗しました' },
      { status: 500 }
    )
  }
}