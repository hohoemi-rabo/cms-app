'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExportButton } from '@/components/customers/export-button'
import { Download, TestTube } from 'lucide-react'

export default function TestCSVExportPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // テスト用の顧客ID（実際に存在するIDに置き換えてください）
  const sampleCustomerIds = [
    '12345678-1234-5678-9012-123456789012', 
    '87654321-4321-8765-2109-876543210987'
  ]

  const testExportAPI = async (type: 'full' | 'selective') => {
    setLoading(true)
    
    try {
      let response: Response

      if (type === 'full') {
        // 全顧客エクスポートテスト
        const params = new URLSearchParams({
          encoding: 'utf8',
          includeDeleted: 'false',
          dateFormat: 'japanese'
        })
        response = await fetch(`/api/customers/export?${params}`)
      } else {
        // 選択顧客エクスポートテスト
        response = await fetch('/api/customers/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerIds: sampleCustomerIds,
            options: {
              encoding: 'utf8',
              dateFormat: 'japanese'
            }
          })
        })
      }

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        isCSV: response.headers.get('content-type')?.includes('text/csv')
      }

      if (response.ok && result.isCSV) {
        // CSVの場合は最初の数行のみ表示
        const csvText = await response.text()
        const lines = csvText.split('\n').slice(0, 5) // 最初の5行のみ
        result.preview = lines.join('\n')
        result.totalLines = csvText.split('\n').length
      } else {
        // エラーレスポンスの場合はJSON表示
        const text = await response.text()
        try {
          result.body = JSON.parse(text)
        } catch {
          result.body = text
        }
      }

      setTestResult(result)
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : 'テスト中にエラーが発生しました'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TestTube className="h-6 w-6" />
        <h1 className="text-2xl font-bold text-gray-900">CSVエクスポート機能テスト</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UI コンポーネントテスト */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">UI コンポーネントテスト</CardTitle>
            <CardDescription className="text-gray-900">
              実際のエクスポートボタンの動作確認
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-900">全顧客エクスポート</p>
              <ExportButton totalCount={100} />
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-900">選択顧客エクスポート (2件)</p>
              <ExportButton 
                customerIds={sampleCustomerIds} 
                variant="outline"
              />
            </div>
          </CardContent>
        </Card>

        {/* API テスト */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">API テスト</CardTitle>
            <CardDescription className="text-gray-900">
              エクスポートAPIの直接テスト
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => testExportAPI('full')}
                disabled={loading}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                全顧客エクスポートテスト
              </Button>
              
              <Button 
                onClick={() => testExportAPI('selective')}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                選択エクスポートテスト
              </Button>
            </div>
            
            {loading && (
              <p className="text-sm text-gray-900">テスト実行中...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* テスト結果 */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">テスト結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用方法 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">使用方法</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">1. UI コンポーネント使用例</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <code className="text-gray-900">
                {`// 全顧客エクスポート
<ExportButton totalCount={totalCount} />

// 選択顧客エクスポート
<ExportButton customerIds={selectedIds} />`}
              </code>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">2. API エンドポイント</h3>
            <div className="space-y-1 text-sm text-gray-900">
              <p><strong>全顧客:</strong> GET /api/customers/export</p>
              <p><strong>選択顧客:</strong> POST /api/customers/export</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">3. エクスポートオプション</h3>
            <ul className="text-sm text-gray-900 space-y-1 list-disc list-inside">
              <li>encoding: 'utf8' | 'sjis' (文字コード)</li>
              <li>includeDeleted: boolean (削除済み顧客を含める)</li>
              <li>dateFormat: 'iso' | 'japanese' (日付形式)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}