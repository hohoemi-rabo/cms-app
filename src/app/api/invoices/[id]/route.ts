import { NextRequest, NextResponse } from 'next/server'
import { getInvoiceById } from '@/lib/api/invoices/get-invoice'

/**
 * GET /api/invoices/[id] - 請求書詳細を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '請求書IDが指定されていません'
        },
        { status: 400 }
      )
    }
    
    const invoice = await getInvoiceById(id)
    
    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: '請求書が見つかりません'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '請求書の取得に失敗しました'
      },
      { status: 500 }
    )
  }
}