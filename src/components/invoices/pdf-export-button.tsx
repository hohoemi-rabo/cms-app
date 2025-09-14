'use client'

import { useState } from 'react'
import { PDFDownloadLink, pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FileDown, Eye, Loader2 } from 'lucide-react'
import { InvoicePDF } from './invoice-pdf'
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // PDFファイル名生成
  const generateFileName = () => {
    return `請求書_${invoice.invoice_number}.pdf`
  }

  // PDFプレビュー生成
  const generatePreview = async () => {
    try {
      setIsGenerating(true)

      // フォント読み込み待機
      await new Promise(resolve => setTimeout(resolve, 100))

      const pdfDoc = createPDFDocument()
      if (!pdfDoc) {
        throw new Error('PDF document creation failed')
      }

      const blob = await pdf(pdfDoc).toBlob()

      // 既存のURLを解放
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      // 新しいURL生成
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setIsPreviewOpen(true)

    } catch (error) {
      console.error('PDF preview generation error:', error)
      showToast.error('プレビューの生成に失敗しました',
        error instanceof Error ? error.message : undefined)
    } finally {
      setIsGenerating(false)
    }
  }

  // ダイアログクローズ時のクリーンアップ
  const handlePreviewClose = (open: boolean) => {
    setIsPreviewOpen(open)
    if (!open && previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  // PDF生成コンポーネントを関数として遅延実行
  const createPDFDocument = () => {
    try {
      return <InvoicePDF invoice={invoice} companyInfo={companyInfo} />
    } catch (error) {
      console.error('PDF document creation error:', error)
      showToast.error('PDF生成中にエラーが発生しました')
      return null
    }
  }

  return (
    <div className="flex gap-2">
      {/* プレビューボタン */}
      <Button
        variant="outline"
        onClick={generatePreview}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Eye className="h-4 w-4 mr-2" />
        )}
        プレビュー
      </Button>

      {/* ダウンロードボタン */}
      <PDFDownloadLink
        document={createPDFDocument() || <div></div>}
        fileName={generateFileName()}
      >
        {({ loading }) => (
          <Button
            disabled={loading}
            variant="default"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            {loading ? 'PDF生成中...' : 'PDF出力'}
          </Button>
        )}
      </PDFDownloadLink>

      {/* プレビューダイアログ */}
      <Dialog open={isPreviewOpen} onOpenChange={handlePreviewClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>請求書プレビュー</DialogTitle>
            <DialogDescription>
              {invoice.invoice_number} のPDFプレビューです
            </DialogDescription>
          </DialogHeader>

          {previewUrl && (
            <div className="flex-1 min-h-[600px]">
              <iframe
                src={previewUrl}
                className="w-full h-[600px] border rounded"
                title="請求書PDFプレビュー"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}