import { NextRequest, NextResponse } from 'next/server'
import { createInvoice } from '@/lib/api/invoices/create-invoice'
import { getInvoices } from '@/lib/api/invoices/get-invoice'
import { InvoiceCreateInput } from '@/types/invoice'

/**
 * GET /api/invoices - 請求書一覧を取得
 */
export async function GET() {
  try {
    const invoices = await getInvoices()
    
    return NextResponse.json({
      success: true,
      data: invoices
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '請求書一覧の取得に失敗しました'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invoices - 請求書を作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // バリデーション（簡易版）
    if (!body.issue_date || !body.billing_name || !body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '必須項目が入力されていません'
        },
        { status: 400 }
      )
    }
    
    const data: InvoiceCreateInput = {
      issue_date: body.issue_date,
      billing_name: body.billing_name,
      items: body.items.map((item: any) => ({
        item_name: item.item_name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price)
      }))
    }
    
    const invoice = await createInvoice(data)
    
    return NextResponse.json({
      success: true,
      data: invoice
    }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '請求書の作成に失敗しました'
      },
      { status: 500 }
    )
  }
}