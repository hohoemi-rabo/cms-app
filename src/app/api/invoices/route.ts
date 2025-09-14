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
    
    // 詳細バリデーション
    if (!body.billing_name || typeof body.billing_name !== 'string') {
      return NextResponse.json(
        { success: false, error: '請求先名は必須です' },
        { status: 400 }
      )
    }

    if (!body.issue_date || typeof body.issue_date !== 'string') {
      return NextResponse.json(
        { success: false, error: '発行日は必須です' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: '明細を最低1行は入力してください' },
        { status: 400 }
      )
    }

    // 明細のバリデーション
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i]
      
      if (!item.item_name || typeof item.item_name !== 'string') {
        return NextResponse.json(
          { success: false, error: `明細${i + 1}行目: 品目名は必須です` },
          { status: 400 }
        )
      }

      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { success: false, error: `明細${i + 1}行目: 数量は0より大きい数値である必要があります` },
          { status: 400 }
        )
      }

      if (typeof item.unit_price !== 'number' || item.unit_price < 0) {
        return NextResponse.json(
          { success: false, error: `明細${i + 1}行目: 単価は0以上の数値である必要があります` },
          { status: 400 }
        )
      }
    }
    
    const data: InvoiceCreateInput = {
      issue_date: body.issue_date,
      billing_name: body.billing_name.trim(),
      customer_id: body.customer_id || undefined,
      billing_address: body.billing_address || undefined,
      billing_honorific: body.billing_honorific || '様',
      items: body.items.map((item: any) => ({
        item_name: item.item_name.trim(),
        quantity: item.quantity,
        unit_price: item.unit_price
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