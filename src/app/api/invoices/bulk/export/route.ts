import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const {
      invoice_ids,
      format = 'csv',
      fields = ['invoice_number', 'issue_date', 'billing_name', 'total_amount'],
      encoding = 'utf-8'
    } = await request.json()

    // バリデーション
    if (!invoice_ids || !Array.isArray(invoice_ids) || invoice_ids.length === 0) {
      return NextResponse.json({
        error: 'エクスポートする請求書を選択してください'
      }, { status: 400 })
    }

    // 請求書データを取得
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (
          item_name,
          quantity,
          unit,
          unit_price,
          amount
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

    // エクスポートデータの準備
    const exportData = invoices.map(invoice => {
      const row: Record<string, any> = {}

      // 選択されたフィールドのみ含める
      fields.forEach(field => {
        switch (field) {
          case 'invoice_number':
            row['請求書番号'] = invoice.invoice_number
            break
          case 'issue_date':
            row['発行日'] = invoice.issue_date
            break
          case 'billing_name':
            row['請求先'] = invoice.billing_name
            break
          case 'billing_address':
            row['請求先住所'] = invoice.billing_address || ''
            break
          case 'total_amount':
            row['合計金額'] = invoice.total_amount
            break
          case 'items_count':
            row['明細数'] = invoice.invoice_items?.length || 0
            break
          case 'items':
            // 明細を文字列として結合
            row['明細'] = invoice.invoice_items
              ?.map((item: any) => `${item.item_name}×${item.quantity}`)
              .join(', ') || ''
            break
          default:
            if (invoice[field] !== undefined) {
              row[field] = invoice[field]
            }
        }
      })

      return row
    })

    // CSV形式に変換
    if (format === 'csv') {
      const csv = Papa.unparse(exportData, {
        header: true,
        delimiter: ',',
        newline: '\r\n'
      })

      // エンコーディング処理
      let csvContent = csv
      if (encoding === 'shift-jis') {
        // Shift-JIS変換（BOM付き）
        csvContent = '\uFEFF' + csv // BOM追加でExcelでの文字化け防止
      }

      // レスポンスヘッダーの設定
      const headers = new Headers()
      headers.set('Content-Type', 'text/csv; charset=' + encoding)
      headers.set('Content-Disposition', `attachment; filename="invoices_${new Date().toISOString().split('T')[0]}.csv"`)

      return new NextResponse(csvContent, {
        status: 200,
        headers
      })
    }

    // JSON形式（将来のExcel対応用）
    return NextResponse.json({
      data: exportData,
      count: exportData.length
    })
  } catch (error) {
    console.error('Bulk export error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}