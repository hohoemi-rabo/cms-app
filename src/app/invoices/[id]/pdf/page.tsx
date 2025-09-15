'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function InvoicePDFPage() {
  const params = useParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)

  // ページロード時にデータを取得（PDF生成はしない）
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/invoices/${params.id}/pdf`)
        if (!response.ok) {
          throw new Error('データの取得に失敗しました')
        }
        const data = await response.json()
        setInvoiceData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データ取得に失敗しました')
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [params.id])

  // PDF生成関数（ユーザーがボタンを押したときに実行）
  const handleGeneratePDF = async () => {
    if (!invoiceData) return

    setLoading(true)
    try {
      const { invoice, companyInfo } = invoiceData

      // 新しいタブでPDF印刷用のHTMLを表示
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('ポップアップがブロックされました')
      }

      // HTML形式でPDF内容を生成
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: right; margin-bottom: 30px; }
            .company-name { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .invoice-title { font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; }
            .invoice-info { margin-bottom: 20px; }
            .billing-info { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .text-right { text-align: right; }
            .total-section { margin-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyInfo?.company_name || '株式会社サンプル'}</div>
            ${companyInfo?.address ? `<div>${companyInfo.address}</div>` : ''}
            ${companyInfo?.phone ? `<div>TEL: ${companyInfo.phone}</div>` : ''}
          </div>

          <div class="invoice-title">請求書</div>

          <div class="invoice-info">
            <div>請求書番号: ${invoice.invoice_number}</div>
            <div>発行日: ${new Date(invoice.issue_date).toLocaleDateString('ja-JP')}</div>
          </div>

          <div class="billing-info">
            <div>請求先: ${invoice.billing_name}</div>
            ${invoice.billing_address ? `<div>${invoice.billing_address}</div>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>品名</th>
                <th class="text-right">数量</th>
                <th class="text-right">単価</th>
                <th class="text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item: { item_name: string; quantity: number; unit_price: number; amount: number }) => `
                <tr>
                  <td>${item.item_name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">¥${item.unit_price.toLocaleString()}</td>
                  <td class="text-right">¥${item.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="text-right">
              <div>小計: ¥${invoice.items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0).toLocaleString()}</div>
              <div>消費税(10%): ¥${Math.floor(invoice.items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) * 0.1).toLocaleString()}</div>
              <div style="font-weight: bold; font-size: 18px;">
                合計: ¥${invoice.total_amount.toLocaleString()}
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // 印刷ダイアログを自動表示
      setTimeout(() => {
        printWindow.print()
        // 印刷後にタブを閉じる
        setTimeout(() => {
          printWindow.close()
        }, 2000)
      }, 1000)

    } catch (err) {
      console.error('PDF generation error:', err)
      setError(err instanceof Error ? err.message : 'PDF生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              エラーが発生しました
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="flex gap-2 justify-center">
              <Link href={`/invoices/${params.id}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  請求書詳細に戻る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (dataLoading || !invoiceData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>請求書データを読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { invoice } = invoiceData

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <FileText className="h-5 w-5" />
            PDF生成
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <p className="font-medium">{invoice.invoice_number}</p>
            <p className="text-sm text-gray-600">{invoice.billing_name}</p>
          </div>

          <p className="text-sm text-gray-600">
            下のボタンをクリックしてPDFを生成してください
          </p>

          <div className="flex gap-2 justify-center">
            <Link href={`/invoices/${params.id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <Button
              onClick={handleGeneratePDF}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  PDFを生成
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}