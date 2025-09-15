import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 請求書データを取得
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (
          id,
          item_name,
          quantity,
          unit,
          unit_price,
          amount,
          description,
          display_order
        )
      `)
      .eq('id', id)
      .single()

    if (error || !invoice) {
      return NextResponse.json({
        error: '請求書が見つかりません'
      }, { status: 404 })
    }

    // 明細をソート
    if (invoice.invoice_items) {
      invoice.invoice_items.sort((a: any, b: any) => a.display_order - b.display_order)
    }

    // 自社情報を取得
    const { data: companyInfo } = await supabase
      .from('company_settings')
      .select('*')
      .single()

    // クライアントサイドでPDF生成するためのデータを返す
    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        items: invoice.invoice_items || []
      },
      companyInfo
    })
  } catch (error) {
    console.error('PDF data fetch error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}