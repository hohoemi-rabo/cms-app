# 023 - エラーハンドリング設定

## 概要
アプリケーション全体のエラーハンドリング戦略の実装

## 対象範囲
- グローバルエラーハンドラー
- API エラー処理
- フォームエラー表示
- トースト通知
- エラーログ記録

## 実装タスク

### TODO
- [ ] app/error.tsxの作成
- [ ] app/global-error.tsxの作成
- [ ] lib/errors/custom-errors.tsの作成
- [ ] エラークラスの定義
  - [ ] ValidationError
  - [ ] NotFoundError
  - [ ] DatabaseError
  - [ ] AuthenticationError
- [ ] エラーハンドリングユーティリティ
  - [ ] lib/utils/error-handler.ts
- [ ] トースト通知設定
  - [ ] components/ui/toaster.tsx
- [ ] エラーログ記録
  - [ ] lib/utils/logger.ts

## 技術仕様
```typescript
// lib/errors/custom-errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: any[]) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

// lib/utils/error-handler.ts
export function handleApiError(error: unknown): {
  message: string
  code: string
  statusCode: number
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  }
  
  if (error instanceof Error) {
    console.error('Unexpected error:', error)
    return {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500
    }
  }
  
  return {
    message: 'Unknown error',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  }
}

// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={reset}>もう一度試す</Button>
    </div>
  )
}
```

## 依存関係
- shadcn/uiのToastコンポーネント

## 動作確認項目
- [ ] エラーページが表示される
- [ ] APIエラーが適切に処理される
- [ ] バリデーションエラーが表示される
- [ ] トースト通知が機能する
- [ ] エラーログが記録される
- [ ] リトライ機能が動作する

## 注意事項
- 本番環境でのエラー詳細の非表示
- エラーログの適切な記録
- ユーザーフレンドリーなメッセージ
- エラー監視サービスとの連携準備