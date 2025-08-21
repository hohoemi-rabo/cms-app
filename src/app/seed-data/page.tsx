'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const seedData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/customers/seed', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('エラーが発生しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>テストデータ作成</CardTitle>
          <CardDescription>
            開発用のサンプル顧客データを作成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={seedData} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'データ作成中...' : 'テストデータを作成（5件）'}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-semibold">結果:</p>
              <pre className="text-sm mt-2">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>作成されるデータ:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>山田太郎（個人）</li>
              <li>佐藤花子（個人）</li>
              <li>株式会社テスト - 鈴木一郎（法人）</li>
              <li>田中美咲（個人）</li>
              <li>サンプル商事株式会社 - 高橋健太（法人）</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}