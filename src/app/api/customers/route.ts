import { NextRequest, NextResponse } from 'next/server'
import { getCustomers } from '@/lib/api/customers/get-customers'
import { createCustomer, type CreateCustomerInput, validateCustomerInput } from '@/lib/api/customers/create-customer'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // クエリパラメータの取得
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const sortBy = searchParams.get('sortBy') as 'name' | 'created_at' | 'updated_at' | undefined
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

    const input = body as CreateCustomerInput

    // バリデーション
    const validationErrors = validateCustomerInput(input)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: '入力データが正しくありません',
          validationErrors
        },
        { status: 400 }
      )
    }

    // 顧客作成
    const customer = await createCustomer(input)

    return NextResponse.json({
      success: true,
      data: customer,
      message: '顧客を作成しました'
    }, { status: 201 })

  } catch (error) {
    console.error('Create Customer API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create customer' 
      },
      { status: 500 }
    )
  }
}