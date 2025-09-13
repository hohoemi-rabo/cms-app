import { NextResponse } from 'next/server'
import { createInvoice } from '@/lib/api/invoices/create-invoice'
import { getInvoices, getInvoiceById } from '@/lib/api/invoices/get-invoice'

/**
 * GET /api/invoices/test - 請求書機能のテスト
 */
export async function GET() {
  try {
    console.log('=== 請求書機能テスト開始 ===')
    
    // 1. テスト用請求書を作成
    console.log('1. テスト請求書を作成中...')
    const testInvoice = await createInvoice({
      issue_date: new Date().toISOString().split('T')[0],
      billing_name: 'テスト株式会社',
      items: [
        {
          item_name: 'テスト商品A',
          quantity: 2,
          unit_price: 1000
        },
        {
          item_name: 'テスト商品B',
          quantity: 3,
          unit_price: 500
        }
      ]
    })
    console.log('作成された請求書:', testInvoice)
    
    // 2. 請求書一覧を取得
    console.log('2. 請求書一覧を取得中...')
    const invoices = await getInvoices()
    console.log('請求書一覧件数:', invoices.length)
    
    // 3. 請求書詳細を取得（明細含む）
    console.log('3. 請求書詳細を取得中...')
    const invoiceDetail = await getInvoiceById(testInvoice.id)
    console.log('請求書詳細:', invoiceDetail)
    
    // 結果をまとめて返す
    const result = {
      success: true,
      message: '請求書機能のテストが完了しました',
      tests: {
        create: {
          success: true,
          invoice_number: testInvoice.invoice_number,
          total_amount: testInvoice.total_amount
        },
        list: {
          success: true,
          count: invoices.length
        },
        detail: {
          success: true,
          has_items: invoiceDetail?.items && invoiceDetail.items.length > 0,
          items_count: invoiceDetail?.items?.length || 0
        }
      },
      created_invoice: invoiceDetail
    }
    
    console.log('=== テスト完了 ===')
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('テストエラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'テスト中にエラーが発生しました',
        details: error
      },
      { status: 500 }
    )
  }
}