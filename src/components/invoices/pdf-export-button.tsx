'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Eye, Loader2 } from 'lucide-react'
import { InvoiceWithItems } from '@/types/invoice'
import { showToast } from '@/components/ui/toast'

interface CompanyInfo {
  company_name: string
  postal_code?: string
  address?: string
  phone?: string
  email?: string
  fax?: string
}

interface PDFExportButtonProps {
  invoice: InvoiceWithItems
  companyInfo: CompanyInfo | null
}

export function PDFExportButton({ invoice, companyInfo }: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // ブラウザ印刷機能でPDF出力
  const handlePrintPDF = async () => {
    setIsGenerating(true)
    try {
      // 新しいタブでPDF印刷用のHTMLを表示
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        showToast.error('ポップアップがブロックされました。ブラウザの設定を確認してください。')
        return
      }

      // HTML形式でPDF内容を生成
      const htmlContent = generatePrintHTML()

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

      showToast.success('PDF出力を開始しました')
    } catch (error) {
      console.error('PDF generation error:', error)
      showToast.error('PDF生成に失敗しました',
        error instanceof Error ? error.message : undefined)
    } finally {
      setIsGenerating(false)
    }
  }

  // プレビュー表示
  const handlePreview = () => {
    try {
      // 新しいタブでプレビューを表示
      const previewWindow = window.open('', '_blank')
      if (!previewWindow) {
        showToast.error('ポップアップがブロックされました。ブラウザの設定を確認してください。')
        return
      }

      // HTML形式でプレビュー内容を生成
      const htmlContent = generatePrintHTML()

      previewWindow.document.write(htmlContent)
      previewWindow.document.close()

      showToast.success('プレビューを表示しました')
    } catch (error) {
      console.error('Preview generation error:', error)
      showToast.error('プレビューの生成に失敗しました',
        error instanceof Error ? error.message : undefined)
    }
  }

  // 印刷用HTML生成
  const generatePrintHTML = (): string => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
    const tax = Math.floor(subtotal * 0.1)
    const total = subtotal + tax

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: right; margin-bottom: 30px; }
          .company-name { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .invoice-title { font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .billing-info, .invoice-info { flex: 1; }
          .invoice-info { margin-left: 20px; }
          .section-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
          .billing-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-section { width: 250px; margin-left: auto; }
          .summary-row { display: flex; justify-content: space-between; padding: 5px 10px; border-bottom: 1px solid #ccc; }
          .summary-total { display: flex; justify-content: space-between; padding: 10px; background-color: #f0f0f0; border: 2px solid #000; font-weight: bold; font-size: 14px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyInfo?.company_name || '株式会社サンプル'}</div>
          ${companyInfo?.postal_code && companyInfo?.address ? `<div>〒${companyInfo.postal_code}</div>` : ''}
          ${companyInfo?.address ? `<div>${companyInfo.address}</div>` : ''}
          ${companyInfo?.phone ? `<div>TEL: ${companyInfo.phone}</div>` : ''}
          ${companyInfo?.email ? `<div>Email: ${companyInfo.email}</div>` : ''}
        </div>

        <div class="invoice-title">請求書</div>

        <div class="info-section">
          <div class="billing-info">
            <div class="section-title">請求先</div>
            <div class="billing-name">${invoice.billing_name} ${invoice.billing_honorific || ''}</div>
            ${invoice.billing_address ? `<div>${invoice.billing_address}</div>` : ''}
          </div>
          <div class="invoice-info">
            <div class="section-title">請求書情報</div>
            <div><strong>請求書番号:</strong> ${invoice.invoice_number}</div>
            <div><strong>発行日:</strong> ${new Date(invoice.issue_date).toLocaleDateString('ja-JP')}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;" class="text-center">No.</th>
              <th>品目名</th>
              <th style="width: 60px;" class="text-right">数量</th>
              <th style="width: 40px;" class="text-center">単位</th>
              <th style="width: 80px;" class="text-right">単価</th>
              <th style="width: 100px;" class="text-right">金額</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any, index: number) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.item_name}</td>
                <td class="text-right">${item.quantity.toLocaleString()}</td>
                <td class="text-center">${item.unit || '個'}</td>
                <td class="text-right">${item.unit_price.toLocaleString()}円</td>
                <td class="text-right">¥${item.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="summary-row">
            <span>小計:</span>
            <span>¥${subtotal.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>消費税 (10%):</span>
            <span>¥${tax.toLocaleString()}</span>
          </div>
          <div class="summary-total">
            <span>合計:</span>
            <span>¥${total.toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          <div>この度は誠にありがとうございました。</div>
          <div>お支払いは請求書発行日より30日以内にお願いいたします。</div>
        </div>
      </body>
      </html>
    `
  }

  return (
    <div className="flex gap-2">
      {/* プレビューボタン */}
      <Button
        variant="outline"
        onClick={handlePreview}
        disabled={isGenerating}
      >
        <Eye className="h-4 w-4 mr-2" />
        プレビュー
      </Button>

      {/* PDF出力ボタン */}
      <Button
        onClick={handlePrintPDF}
        disabled={isGenerating}
        variant="default"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4 mr-2" />
        )}
        {isGenerating ? 'PDF生成中...' : 'PDF出力'}
      </Button>
    </div>
  )
}