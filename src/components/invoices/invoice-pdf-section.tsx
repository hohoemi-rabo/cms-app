'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceWithItems } from '@/types/invoice'
import { FileDown } from 'lucide-react'

// PDFExportButtonを動的インポートで遅延読み込み
const PDFExportButton = dynamic(() => import('./pdf-export-button').then(mod => ({ default: mod.PDFExportButton })), {
  loading: () => <div className="text-sm text-muted-foreground">PDF機能を読み込み中...</div>,
  ssr: false
})

interface CompanyInfo {
  company_name: string
  postal_code?: string
  address?: string
  phone?: string
  email?: string
  fax?: string
}

interface InvoicePDFSectionProps {
  invoice: InvoiceWithItems
}

export function InvoicePDFSection({ invoice }: InvoicePDFSectionProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 自社情報を取得
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch('/api/company-settings')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCompanyInfo(data.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch company info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyInfo()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            PDF出力
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          PDF出力
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            請求書をPDF形式でダウンロードできます。プレビューで内容を確認してからダウンロードすることをお勧めします。
          </p>

          <PDFExportButton
            invoice={invoice}
            companyInfo={companyInfo}
          />

          {!companyInfo && (
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              ⚠️ 自社情報が設定されていません。
              <a href="/settings/company" className="underline ml-1">
                設定画面
              </a>
              で自社情報を入力するとPDFに反映されます。
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}