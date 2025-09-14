import { NextRequest, NextResponse } from 'next/server'
import { searchCustomers } from '@/lib/api/customers/search-customers'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // 請求書作成用の簡易検索パラメータをサポート
    const simpleQuery = searchParams.get('q')
    if (simpleQuery !== null) {
      // 請求書作成画面用の簡易検索
      const limit = parseInt(searchParams.get('limit') || '10')
      const offset = parseInt(searchParams.get('offset') || '0')

      if (!simpleQuery) {
        // 検索クエリが空の場合は最近の顧客を返す
        const { data, error } = await supabaseServer
          .from('customers')
          .select('id, customer_type, company_name, name, name_kana, email, phone, address, prefecture, city')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error fetching customers:', error)
          return NextResponse.json(
            { success: false, message: 'データの取得に失敗しました' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: data || [],
          total: data?.length || 0
        })
      }

      // 検索クエリがある場合は名前と会社名で検索
      const { data, error, count } = await supabaseServer
        .from('customers')
        .select('id, customer_type, company_name, name, name_kana, email, phone, address, prefecture, city', { count: 'exact' })
        .is('deleted_at', null)
        .or(`name.ilike.%${simpleQuery}%,company_name.ilike.%${simpleQuery}%,name_kana.ilike.%${simpleQuery}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error searching customers:', error)
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
    }

    // 既存の詳細検索パラメータ
    const searchText = searchParams.get('searchText') || undefined
    const customerClass = searchParams.get('class') || undefined
    const tagId = searchParams.get('tagId') || undefined
    const tagIds = tagId ? [tagId] : undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const sortBy = (searchParams.get('sortBy') || undefined) as 'name' | 'name_kana' | 'created_at' | 'updated_at' | undefined
    const sortOrder = (searchParams.get('sortOrder') || undefined) as 'asc' | 'desc' | undefined

    // 検索実行
    const result = await searchCustomers({
      searchText,
      class: customerClass,
      tagIds,
      page,
      limit,
      sortBy,
      sortOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to search customers'
      },
      { status: 500 }
    )
  }
}