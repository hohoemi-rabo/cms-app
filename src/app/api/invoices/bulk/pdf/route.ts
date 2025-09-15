import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { invoice_ids } = await request.json()

    // バリデーション
    if (!invoice_ids || !Array.isArray(invoice_ids) || invoice_ids.length === 0) {
      return NextResponse.json({
        error: 'PDFを生成する請求書を選択してください'
      }, { status: 400 })
    }

    // 最大10件の制限（PDF生成は重い処理のため）
    if (invoice_ids.length > 10) {
      return NextResponse.json({
        error: '一度にPDF生成できるのは10件までです'
      }, { status: 400 })
    }

    // 請求書データを取得
    const { data: invoices, error } = await supabase
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
      .in('id', invoice_ids)
      .order('invoice_number', { ascending: true })

    if (error) {
      console.error('Failed to fetch invoices:', error)
      return NextResponse.json({
        error: 'データの取得に失敗しました'
      }, { status: 500 })
    }

    if (!invoices || invoices.length === 0) {
      return NextResponse.json({
        error: '指定された請求書が見つかりません'
      }, { status: 404 })
    }

    // 自社情報を取得
    const { data: companyInfo } = await supabase
      .from('company_settings')
      .select('*')
      .single()

    // 請求書データと自社情報を返す（クライアントサイドでPDF生成）
    return NextResponse.json({
      success: true,
      invoices: invoices.map(invoice => ({
        ...invoice,
        items: invoice.invoice_items || []
      })),
      companyInfo
    })
  } catch (error) {
    console.error('Bulk PDF generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({
      error: 'PDF生成中にエラーが発生しました',
      message: errorMessage
    }, { status: 500 })
  }
}