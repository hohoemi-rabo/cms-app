'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { logger } from '@/lib/utils/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーログを記録
    logger.error('Application error', error)
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">エラーが発生しました</CardTitle>
          <CardDescription>
            申し訳ございません。予期しないエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 開発環境ではエラーメッセージを表示 */}
          {isDevelopment && error.message && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={reset}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              もう一度試す
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              ホームに戻る
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              問題が続く場合は、サポートまでお問い合わせください。
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-1">
                エラーID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}