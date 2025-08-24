import React, { useCallback, useRef, useState } from 'react'
import { useErrorHandler } from './use-error-handler'
import { logger } from '@/lib/utils/logger'

export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: Error | null
}

export interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  initialData?: T | null
  immediate?: boolean
  showErrorToast?: boolean
}

/**
 * 非同期処理のローディング状態とエラーハンドリングを管理するフック
 */
export function useAsync<T = any>(
  asyncFunction?: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    initialData = null,
    immediate = false,
    showErrorToast = true
  } = options

  const { handleError } = useErrorHandler()
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: immediate,
    error: null
  })

  const cancelRef = useRef<boolean>(false)

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      if (!asyncFunction) {
        logger.warn('useAsync: No async function provided')
        return
      }

      cancelRef.current = false
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const data = await asyncFunction(...args)
        
        if (!cancelRef.current) {
          setState({ data, loading: false, error: null })
          onSuccess?.(data)
        }
        
        return data
      } catch (error) {
        if (!cancelRef.current) {
          const errorObj = error instanceof Error ? error : new Error(String(error))
          setState(prev => ({ ...prev, loading: false, error: errorObj }))
          
          if (showErrorToast) {
            handleError(errorObj)
          }
          
          onError?.(errorObj)
        }
        
        throw error
      }
    },
    [asyncFunction, onSuccess, onError, showErrorToast, handleError]
  )

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null })
  }, [initialData])

  const cancel = useCallback(() => {
    cancelRef.current = true
    setState(prev => ({ ...prev, loading: false }))
  }, [])

  // immediate実行
  const hasExecuted = useRef(false)
  if (immediate && !hasExecuted.current && asyncFunction) {
    hasExecuted.current = true
    execute()
  }

  return {
    ...state,
    execute,
    reset,
    cancel,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !state.loading && !state.error && state.data !== null
  }
}

/**
 * 複数の非同期処理を並列実行するフック
 */
export function useAsyncParallel<T extends readonly unknown[] | []>(
  asyncFunctions: { [K in keyof T]: () => Promise<T[K]> },
  options: UseAsyncOptions<T> = {}
) {
  return useAsync(
    async () => {
      const results = await Promise.all(
        asyncFunctions.map(fn => fn())
      )
      return results as T
    },
    options
  )
}

/**
 * データフェッチング専用のフック
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncOptions<T> & {
    refetchInterval?: number
    refetchOnWindowFocus?: boolean
  } = {}
) {
  const {
    refetchInterval,
    refetchOnWindowFocus = false,
    ...asyncOptions
  } = options

  const asyncState = useAsync(fetcher, { ...asyncOptions, immediate: true })
  const intervalRef = useRef<NodeJS.Timeout>()

  // 定期的な再フェッチ
  const startPolling = useCallback(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        asyncState.execute()
      }, refetchInterval)
    }
  }, [refetchInterval, asyncState])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [])

  // ウィンドウフォーカス時の再フェッチ
  const handleFocus = useCallback(() => {
    if (refetchOnWindowFocus && !asyncState.loading) {
      asyncState.execute()
    }
  }, [refetchOnWindowFocus, asyncState])

  // エフェクトの設定
  React.useEffect(() => {
    startPolling()
    
    if (refetchOnWindowFocus) {
      window.addEventListener('focus', handleFocus)
    }

    return () => {
      stopPolling()
      if (refetchOnWindowFocus) {
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [startPolling, stopPolling, handleFocus, refetchOnWindowFocus])

  return {
    ...asyncState,
    refetch: asyncState.execute,
    startPolling,
    stopPolling
  }
}