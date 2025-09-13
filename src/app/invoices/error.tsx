'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Invoice list error:', error)
  }, [error])

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>エラーが発生しました</CardTitle>
          </div>
          <CardDescription>
            請求書一覧の取得中に問題が発生しました
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {error.message || '予期しないエラーが発生しました'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={reset}>
              再試行
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              ホームに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}