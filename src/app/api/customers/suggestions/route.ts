import { NextRequest, NextResponse } from 'next/server'
import { getCustomerSuggestions } from '@/lib/api/customers/search-customers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchText = searchParams.get('q') || ''
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    const suggestions = await getCustomerSuggestions(searchText, limit)

    return NextResponse.json({
      success: true,
      data: suggestions
    })
  } catch (error) {
    console.error('Suggestions API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get suggestions' 
      },
      { status: 500 }
    )
  }
}