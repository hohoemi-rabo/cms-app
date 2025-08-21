import { NextRequest, NextResponse } from 'next/server'
import { getCustomersWithTagsSimple } from '@/lib/api/customers/get-customers-with-tags-simple'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20

    // シンプル版を使用してタグ情報を含む顧客データ取得
    const data = await getCustomersWithTagsSimple(limit)

    return NextResponse.json({
      success: true,
      data,
      totalCount: data.length
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch customers with tags' 
      },
      { status: 500 }
    )
  }
}