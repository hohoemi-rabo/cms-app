import { PostgrestError } from '@supabase/supabase-js'

/**
 * Supabaseエラーのタイプ
 */
export interface SupabaseErrorResponse {
  error: PostgrestError | null
  message: string
  code?: string
}

/**
 * Supabaseのエラーを処理してユーザーフレンドリーなメッセージを返す
 */
export function handleSupabaseError(error: PostgrestError | null): SupabaseErrorResponse {
  if (!error) {
    return {
      error: null,
      message: 'Success'
    }
  }

  // よくあるエラーコードの処理
  const errorMessages: Record<string, string> = {
    '23505': 'このデータは既に存在します',
    '23503': '関連するデータが存在しません',
    '23502': '必須項目が入力されていません',
    '42501': 'この操作を行う権限がありません',
    '42P01': 'テーブルが存在しません',
    'PGRST116': 'データが見つかりません',
    '22P02': '不正なデータ形式です',
    '23514': 'データの検証に失敗しました',
    '42703': '指定されたカラムが存在しません'
  }

  const message = errorMessages[error.code] || error.message || '予期しないエラーが発生しました'

  return {
    error,
    message,
    code: error.code
  }
}

/**
 * データベース操作の結果を処理する汎用関数
 */
export async function handleDatabaseOperation<T>(
  operation: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<{ data: T | null; error: SupabaseErrorResponse | null }> {
  try {
    const { data, error } = await operation
    
    if (error) {
      const errorResponse = handleSupabaseError(error)
      console.error('Database operation error:', errorResponse)
      return { data: null, error: errorResponse }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error during database operation:', error)
    return {
      data: null,
      error: {
        error: null,
        message: '予期しないエラーが発生しました',
        code: 'UNEXPECTED_ERROR'
      }
    }
  }
}

/**
 * エラーをログに記録する
 */
export function logSupabaseError(
  operation: string,
  error: PostgrestError | SupabaseErrorResponse
): void {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    operation,
    error: 'error' in error ? error.error : error,
    message: 'message' in error ? error.message : error.message
  }
  
  // 開発環境では詳細をコンソールに出力
  if (process.env.NODE_ENV === 'development') {
    console.error('Supabase Error:', errorInfo)
  }
  
  // TODO: 本番環境では外部のエラー監視サービスに送信
}