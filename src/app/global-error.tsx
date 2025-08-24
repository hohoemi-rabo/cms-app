'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーログを記録（consoleのみ使用、loggerが利用できない可能性があるため）
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                システムエラー
              </h1>
              <p className="text-muted-foreground">
                アプリケーションで重大なエラーが発生しました。
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="p-4 bg-muted rounded-lg text-left">
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={reset}
                className="w-full"
              >
                アプリケーションを再起動
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                ホームに戻る
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              問題が続く場合は、ブラウザを更新するか、
              キャッシュをクリアしてください。
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}