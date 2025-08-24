'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { parseCustomerCSV, checkDuplicates, ImportError } from '@/lib/utils/csv-import'

interface PreviewData {
  headers: string[]
  data: any[]
  errors: ImportError[]
  duplicates: Array<{ indices: number[], field: string, value: string }>
}

export default function ImportCustomersPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // ファイル選択ハンドラー
  const handleFileChange = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null)
      setPreview(null)
      return
    }

    // ファイルタイプチェック
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('CSVファイルを選択してください')
      return
    }

    // ファイルサイズチェック（10MB制限）
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('ファイルサイズは10MB以下にしてください')
      return
    }

    setFile(selectedFile)

    try {
      // CSVをパース
      const { data, errors, headers } = await parseCustomerCSV(selectedFile)
      
      // 重複チェック
      const { duplicates } = checkDuplicates(data)
      
      setPreview({
        headers,
        data: data.slice(0, 5), // 最初の5件のみプレビュー
        errors,
        duplicates
      })

      if (errors.length > 0) {
        toast.warning(`${errors.length}件のエラーが検出されました`)
      }
    } catch (error) {
      console.error('Parse error:', error)
      toast.error(error instanceof Error ? error.message : 'ファイルの解析に失敗しました')
      setFile(null)
      setPreview(null)
    }
  }, [])

  // ドラッグ&ドロップハンドラー
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileChange(files[0])
    }
  }

  // インポート実行
  const handleImport = async () => {
    if (!file || !preview) return

    setImporting(true)
    setImportProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/customers/import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        
        // 成功したら顧客一覧へ遷移
        setTimeout(() => {
          router.push('/customers')
        }, 1500)
      } else {
        toast.error(result.message || 'インポートに失敗しました')
        
        // エラー詳細を表示
        if (result.errors && result.errors.length > 0) {
          console.error('Import errors:', result.errors)
        }
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('インポート処理中にエラーが発生しました')
    } finally {
      setImporting(false)
      setImportProgress(0)
    }
  }

  // テンプレートダウンロード
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/customers/template')
      
      if (!response.ok) {
        throw new Error('テンプレートのダウンロードに失敗しました')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'customer_import_template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('テンプレートをダウンロードしました')
    } catch (error) {
      console.error('Template download error:', error)
      toast.error('テンプレートのダウンロードに失敗しました')
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/customers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">顧客データインポート</h1>
            <p className="text-muted-foreground mt-1">
              CSVファイルから顧客データを一括登録
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          テンプレートをダウンロード
        </Button>
      </div>

      {/* ファイルアップロードエリア */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileSpreadsheet className="h-5 w-5" />
            CSVファイルを選択
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            顧客データが含まれるCSVファイルをアップロードしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                ファイルをドラッグ&ドロップ、または
              </p>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary hover:underline">ファイルを選択</span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                CSV形式（最大10MB）
              </p>
            </div>

            {file && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{file.name}</span>
                <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* プレビューとエラー */}
      {preview && (
        <>
          {/* エラー表示 */}
          {preview.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>エラーが検出されました</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1">
                  {preview.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-sm">
                      行 {error.row}: {error.field && `${error.field} - `}{error.message}
                    </div>
                  ))}
                  {preview.errors.length > 5 && (
                    <div className="text-sm font-medium">
                      他 {preview.errors.length - 5} 件のエラー
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 重複警告 */}
          {preview.duplicates.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>重複データが検出されました</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1">
                  {preview.duplicates.map((dup, index) => (
                    <div key={index} className="text-sm">
                      {dup.field}: {dup.value} (行 {dup.indices.map(i => i + 2).join(', ')})
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* データプレビュー */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">データプレビュー</CardTitle>
              <CardDescription className="text-muted-foreground">
                最初の5件を表示しています
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium text-foreground">行</th>
                      <th className="text-left p-2 font-medium text-foreground">顧客種別</th>
                      <th className="text-left p-2 font-medium text-foreground">会社名</th>
                      <th className="text-left p-2 font-medium text-foreground">氏名</th>
                      <th className="text-left p-2 font-medium text-foreground">メール</th>
                      <th className="text-left p-2 font-medium text-foreground">電話番号</th>
                      <th className="text-center p-2 font-medium text-foreground">状態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {preview.data.map((row, index) => {
                      const hasError = preview.errors.some(e => e.row === index + 2)
                      return (
                        <tr key={index}>
                          <td className="p-2 text-foreground">{index + 2}</td>
                          <td className="p-2 text-foreground">
                            <Badge variant={row.customer_type === 'company' ? 'default' : 'secondary'}>
                              {row.customer_type === 'company' ? '法人' : '個人'}
                            </Badge>
                          </td>
                          <td className="p-2 text-foreground">{row.company_name || '-'}</td>
                          <td className="p-2 text-foreground">{row.name}</td>
                          <td className="p-2 text-foreground">{row.email || '-'}</td>
                          <td className="p-2 text-foreground">{row.phone || '-'}</td>
                          <td className="p-2 text-center">
                            {hasError ? (
                              <XCircle className="h-4 w-4 text-destructive inline" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* インポートボタン */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setFile(null)
                setPreview(null)
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || preview.errors.length > 0}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  インポート中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  インポート実行
                </>
              )}
            </Button>
          </div>

          {/* 進捗表示 */}
          {importing && (
            <Progress value={importProgress} className="w-full" />
          )}
        </>
      )}
    </div>
  )
}