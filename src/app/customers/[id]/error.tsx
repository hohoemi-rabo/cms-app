'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, RotateCw } from 'lucide-react'

export default function CustomerDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('Customer detail error:', error)
  }, [error])

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>エラーが発生しました</CardTitle>
          </div>
          <CardDescription>
            顧客情報の取得中にエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 rounded-lg p-4">
            <p className="text-sm font-medium text-destructive">
              エラー内容:
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.message || '予期しないエラーが発生しました'}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                エラーID: {error.digest}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={reset}>
              <RotateCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
            <Link href="/customers">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                顧客一覧に戻る
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}