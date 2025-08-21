import { NextRequest, NextResponse } from 'next/server'
import { getCustomerById } from '@/lib/api/customers/get-customer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: '顧客IDが指定されていません' },
        { status: 400 }
      )
    }

    const customer = await getCustomerById(id)

    if (!customer) {
      return NextResponse.json(
        { error: '指定された顧客が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: customer
    })
  } catch (error) {
    console.error('Get Customer API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get customer' 
      },
      { status: 500 }
    )
  }
}