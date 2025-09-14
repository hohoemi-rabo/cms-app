import { NextRequest, NextResponse } from 'next/server'
import { getInvoiceById } from '@/lib/api/invoices/get-invoice'
import { updateInvoice } from '@/lib/api/invoices/update-invoice'
import { deleteInvoice } from '@/lib/api/invoices/delete-invoice'
import { InvoiceCreateInput } from '@/types/invoice'

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

/**
 * PUT /api/invoices/[id] - 請求書を更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '請求書IDが指定されていません'
        },
        { status: 400 }
      )
    }

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
    
    const invoice = await updateInvoice(id, data)
    
    return NextResponse.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error && error.message.includes('見つかりません')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '請求書の更新に失敗しました'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/invoices/[id] - 請求書を削除
 */
export async function DELETE(
  _request: NextRequest,
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
    
    await deleteInvoice(id)
    
    return NextResponse.json({
      success: true,
      message: '請求書を削除しました'
    })
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error && error.message.includes('見つかりません')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '請求書の削除に失敗しました'
      },
      { status: 500 }
    )
  }
}