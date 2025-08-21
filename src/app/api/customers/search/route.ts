import { NextRequest, NextResponse } from 'next/server'
import { searchCustomers } from '@/lib/api/customers/search-customers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // クエリパラメータの取得
    const searchText = searchParams.get('searchText') || undefined
    const customerType = searchParams.get('customerType') as 'company' | 'personal' | undefined
    const customerClass = searchParams.get('class') || undefined
    const tagIdsParam = searchParams.get('tagIds')
    const tagIds = tagIdsParam ? tagIdsParam.split(',').filter(Boolean) : undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const sortBy = searchParams.get('sortBy') as 'name' | 'name_kana' | 'created_at' | 'updated_at' | undefined
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined

    // 検索実行
    const result = await searchCustomers({
      searchText,
      customerType,
      class: customerClass,
      tagIds,
      page,
      limit,
      sortBy,
      sortOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to search customers' 
      },
      { status: 500 }
    )
  }
}