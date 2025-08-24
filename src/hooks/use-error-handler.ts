import { useCallback } from 'react'
import { toast } from 'sonner'
import { handleClientError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * エラーハンドリング用のカスタムフック
 */
export function useErrorHandler() {
  /**
   * エラーを処理してトースト通知を表示
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorInfo = handleClientError(error)
    
    // ログを記録
    logger.error('Client error', error)
    
    // トースト通知
    toast.error(customMessage || errorInfo.title, {
      description: errorInfo.description,
      action: errorInfo.action ? {
        label: errorInfo.action,
        onClick: () => {
          if (errorInfo.action === '再試行') {
            window.location.reload()
          } else if (errorInfo.action === 'ログインページへ移動') {
            window.location.href = '/login'
          }
        }
      } : undefined
    })
  }, [])

  /**
   * APIエラーレスポンスを処理
   */
  const handleApiError = useCallback(async (response: Response) => {
    if (!response.ok) {
      let errorMessage = `エラーが発生しました (${response.status})`
      
      try {
        const errorData = await response.json()
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message
          }
        }
      } catch {
        // JSONパースエラーは無視
      }
      
      throw new Error(errorMessage)
    }
  }, [])

  /**
   * 非同期処理をラップしてエラーハンドリング
   */
  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      onSuccess?: (data: T) => void
      onError?: (error: unknown) => void
    }
  ): Promise<T | undefined> => {
    const { 
      loadingMessage,
      successMessage,
      errorMessage,
      onSuccess,
      onError
    } = options || {}

    // ローディング通知
    const loadingToastId = loadingMessage ? toast.loading(loadingMessage) : undefined

    try {
      const result = await asyncFn()
      
      // ローディング通知を削除
      if (loadingToastId) {
        toast.dismiss(loadingToastId)
      }
      
      // 成功通知
      if (successMessage) {
        toast.success(successMessage)
      }
      
      // 成功コールバック
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error) {
      // ローディング通知を削除
      if (loadingToastId) {
        toast.dismiss(loadingToastId)
      }
      
      // エラー処理
      handleError(error, errorMessage)
      
      // エラーコールバック
      if (onError) {
        onError(error)
      }
      
      return undefined
    }
  }, [handleError])

  return {
    handleError,
    handleApiError,
    executeAsync
  }
}