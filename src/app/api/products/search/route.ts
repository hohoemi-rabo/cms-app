import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 検索クエリが空の場合は全商品を返す
    if (!query) {
      const { data, error, count } = await supabaseServer
        .from('products')
        .select('id, name, default_price, unit, description', { count: 'exact' })
        .is('deleted_at', null)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
          { success: false, message: 'データの取得に失敗しました' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: data || [],
        total: count || 0
      })
    }

    // 検索クエリがある場合は商品名で検索
    const { data, error, count } = await supabaseServer
      .from('products')
      .select('id, name, default_price, unit, description', { count: 'exact' })
      .is('deleted_at', null)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error searching products:', error)
      return NextResponse.json(
        { success: false, message: '検索に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0
    })
  } catch (error) {
    console.error('Unexpected error in product search:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}