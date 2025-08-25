'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleExport = async (exportAll: boolean = true) => {
    setIsExporting(true)
    setError(null)
    setSuccess(false)

    try {
      let url = '/api/customers/export'
      let method = 'GET'
      let body = undefined

      if (!exportAll) {
        // 選択エクスポートの場合（将来の実装用）
        method = 'POST'
        body = JSON.stringify({ customerIds: [] })
      }

      const response = await fetch(url, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body,
      })

      if (!response.ok) {
        throw new Error('エクスポートに失敗しました')
      }

      // CSVファイルをダウンロード
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      
      // ファイル名を取得（Content-Dispositionヘッダーから）
      const contentDisposition = response.headers.get('content-disposition')
      const fileNameMatch = contentDisposition?.match(/filename="(.+)"/)
      const fileName = fileNameMatch ? fileNameMatch[1] : `customers_${new Date().toISOString().split('T')[0]}.csv`
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エクスポート中にエラーが発生しました')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">顧客データエクスポート</h1>
        <p className="text-muted-foreground mt-2">
          顧客データをCSV形式でエクスポートします
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>エクスポートオプション</CardTitle>
              <CardDescription>
                エクスポート方法を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={() => handleExport(true)}
                  disabled={isExporting}
                  className="w-full"
                  size="lg"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      エクスポート中...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      全顧客データをエクスポート
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  すべての顧客データをCSVファイルとしてダウンロードします
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    CSVファイルのダウンロードが完了しました
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-4">
            <Link href="/customers">
              <Button variant="outline">
                顧客一覧に戻る
              </Button>
            </Link>
            <Link href="/customers/import">
              <Button variant="outline">
                CSVインポート
              </Button>
            </Link>
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>エクスポート内容</CardTitle>
              <CardDescription>
                以下の項目がCSVファイルに含まれます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                <li>• 顧客ID</li>
                <li>• 顧客種別（個人/法人）</li>
                <li>• 会社名</li>
                <li>• 氏名・フリガナ</li>
                <li>• クラス</li>
                <li>• 生年月日</li>
                <li>• 住所情報（郵便番号、都道府県、市区町村、番地）</li>
                <li>• 連絡先（電話番号、メールアドレス）</li>
                <li>• 契約情報（契約開始日、請求書送付方法、支払い条件）</li>
                <li>• タグ</li>
                <li>• 備考</li>
                <li>• 登録日時・更新日時</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}