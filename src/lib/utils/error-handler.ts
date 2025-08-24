import { NextResponse } from 'next/server'
import { AppError } from '@/lib/errors/custom-errors'
import { logger } from './logger'

/**
 * エラーレスポンスの型定義
 */
export interface ErrorResponse {
  error: {
    message: string
    code: string
    statusCode: number
    details?: Record<string, unknown>
    timestamp: string
    requestId?: string
  }
}

/**
 * APIエラーをハンドリングしてレスポンスを返す
 */
export function handleApiError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  const errorInfo = parseError(error)
  
  // エラーログを記録
  logger.error('API Error', {
    ...errorInfo,
    requestId,
    stack: error instanceof Error ? error.stack : undefined
  })

  const response: ErrorResponse = {
    error: {
      message: errorInfo.message,
      code: errorInfo.code,
      statusCode: errorInfo.statusCode,
      details: errorInfo.details,
      timestamp: new Date().toISOString(),
      requestId
    }
  }

  return NextResponse.json(response, {
    status: errorInfo.statusCode
  })
}

/**
 * エラーオブジェクトをパースして統一フォーマットに変換
 */
export function parseError(error: unknown): {
  message: string
  code: string
  statusCode: number
  details?: Record<string, unknown>
} {
  // AppErrorインスタンスの場合
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    }
  }

  // Supabaseエラーの場合
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as any
    return {
      message: supabaseError.message || 'データベースエラーが発生しました',
      code: supabaseError.code || 'DATABASE_ERROR',
      statusCode: 500,
      details: supabaseError.details
    }
  }

  // 一般的なErrorインスタンスの場合
  if (error instanceof Error) {
    // 開発環境ではエラーメッセージをそのまま表示
    const isDev = process.env.NODE_ENV === 'development'
    return {
      message: isDev ? error.message : '予期しないエラーが発生しました',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      details: isDev ? { originalMessage: error.message } : undefined
    }
  }

  // その他の場合
  return {
    message: '不明なエラーが発生しました',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? { error: String(error) } : undefined
  }
}

/**
 * クライアントサイドのエラーハンドリング
 */
export function handleClientError(error: unknown): {
  title: string
  description: string
  action?: string
} {
  const errorInfo = parseError(error)

  // ステータスコードに応じてユーザーフレンドリーなメッセージを生成
  let title = 'エラーが発生しました'
  let description = errorInfo.message
  let action: string | undefined

  switch (errorInfo.statusCode) {
    case 400:
      title = '入力エラー'
      action = '入力内容を確認してください'
      break
    case 401:
      title = '認証エラー'
      description = 'ログインが必要です'
      action = 'ログインページへ移動'
      break
    case 403:
      title = '権限エラー'
      description = 'この操作を実行する権限がありません'
      break
    case 404:
      title = '見つかりません'
      description = errorInfo.message || '指定されたリソースが見つかりません'
      break
    case 429:
      title = 'リクエスト制限'
      description = 'しばらく待ってから再試行してください'
      break
    case 500:
    case 502:
    case 503:
      title = 'サーバーエラー'
      description = 'サーバーに問題が発生しました。しばらく待ってから再試行してください'
      action = '再試行'
      break
  }

  return { title, description, action }
}

/**
 * 非同期関数のエラーをキャッチするラッパー
 */
export function asyncHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      logger.error('Async handler error', error)
      throw error
    }
  }) as T
}

/**
 * リトライロジック付きの非同期処理実行
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoff?: number
    shouldRetry?: (error: unknown) => boolean
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true
  } = options

  let lastError: unknown
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (!shouldRetry(error) || attempt === maxRetries - 1) {
        throw error
      }

      const waitTime = delay * Math.pow(backoff, attempt)
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`, { error })
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError
}