'use client'

import { useState } from 'react'
import React from 'react'
import { Trash2, Download, FileText, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

interface BulkOperationsToolbarProps {
  selectedIds: string[]
  onClearSelection: () => void
  onDeleteComplete: () => void
}

export function BulkOperationsToolbar({
  selectedIds,
  onClearSelection,
  onDeleteComplete
}: BulkOperationsToolbarProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [progress, setProgress] = useState(0)

  const selectedCount = selectedIds.length

  // 一括削除
  const handleBulkDelete = async () => {
    setIsDeleting(true)
    setProgress(0)

    try {
      const response = await fetch('/api/invoices/bulk/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_ids: selectedIds })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onClearSelection()
        onDeleteComplete()
      } else {
        toast.error(data.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('削除中にエラーが発生しました')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setProgress(0)
    }
  }

  // CSVエクスポート
  const handleExportCSV = async () => {
    setIsExporting(true)
    setProgress(0)

    try {
      const response = await fetch('/api/invoices/bulk/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_ids: selectedIds,
          format: 'csv',
          encoding: 'utf-8'
        })
      })

      if (response.ok) {
        // ダウンロード処理
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast.success('CSVファイルをダウンロードしました')
      } else {
        const data = await response.json()
        toast.error(data.error || 'エクスポートに失敗しました')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('エクスポート中にエラーが発生しました')
    } finally {
      setIsExporting(false)
      setProgress(0)
    }
  }

  // 一括PDF生成
  const handleBulkPDF = async () => {
    if (selectedCount > 10) {
      toast.error('一度にPDF生成できるのは10件までです')
      return
    }

    setIsGeneratingPDF(true)
    setProgress(0)

    try {
      // 請求書データを取得
      const response = await fetch('/api/invoices/bulk/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_ids: selectedIds })
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'データの取得に失敗しました')
        return
      }

      const { invoices } = await response.json()
      console.log('Fetched invoices:', invoices)

      // 複数のPDFを新しいタブで開いて順次ダウンロード
      toast.info(`${invoices.length}件のPDFを生成します`)

      for (let i = 0; i < invoices.length; i++) {
        const invoice = invoices[i]
        setProgress(Math.round(((i + 1) / invoices.length) * 100))

        // 新しいタブでPDF生成ページを開く
        window.open(`/invoices/${invoice.id}/pdf`, '_blank')

        // 連続生成の間隔（ブラウザのポップアップブロック対策）
        if (i < invoices.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
      }

      setProgress(100)
      toast.success('すべてのPDF生成を開始しました')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('PDF生成中にエラーが発生しました')
    } finally {
      setIsGeneratingPDF(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  if (selectedCount === 0) return null

  return (
    <>
      <Card className="sticky top-0 z-10 p-4 mb-4 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium">
              {selectedCount}件を選択中
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting || isExporting || isGeneratingPDF}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                削除
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isDeleting || isExporting || isGeneratingPDF}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                CSVエクスポート
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPDF}
                disabled={isDeleting || isExporting || isGeneratingPDF || selectedCount > 10}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                PDF生成{selectedCount > 10 && '（最大10件）'}
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isDeleting || isExporting || isGeneratingPDF}
          >
            <X className="h-4 w-4 mr-2" />
            選択解除
          </Button>
        </div>

        {/* プログレスバー */}
        {(isDeleting || isExporting || isGeneratingPDF) && progress > 0 && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {isDeleting && '削除中...'}
              {isExporting && 'エクスポート中...'}
              {isGeneratingPDF && 'PDF生成中...'}
            </p>
          </div>
        )}
      </Card>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCount}件の請求書を削除しますか？
            </AlertDialogTitle>
            <AlertDialogDescription>
              選択した請求書とその明細がすべて削除されます。
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  削除中...
                </>
              ) : (
                '削除'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}