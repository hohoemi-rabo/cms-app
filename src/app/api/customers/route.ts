import { NextRequest, NextResponse } from 'next/server'
import { getCustomers } from '@/lib/api/customers/get-customers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // クエリパラメータの取得
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const sortBy = searchParams.get('sortBy') as 'name' | 'name_kana' | 'created_at' | 'updated_at' | undefined
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined

    // 顧客データ取得
    const result = await getCustomers({
      page,
      limit,
      sortBy,
      sortOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch customers' 
      },
      { status: 500 }
    )
  }
}