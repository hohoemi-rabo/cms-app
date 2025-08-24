/**
 * アプリケーション共通のエラークラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, new.target.prototype)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details
    }
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'バリデーションエラーが発生しました',
    public errors: Array<{ field?: string; message: string }> = []
  ) {
    super(message, 'VALIDATION_ERROR', 400, errors)
    this.name = 'ValidationError'
  }
}

/**
 * リソースが見つからないエラー
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string = 'リソース',
    identifier?: string
  ) {
    const message = identifier
      ? `${resource}（ID: ${identifier}）が見つかりません`
      : `${resource}が見つかりません`
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

/**
 * データベースエラー
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = 'データベースエラーが発生しました',
    originalError?: any
  ) {
    super(message, 'DATABASE_ERROR', 500, originalError)
    this.name = 'DatabaseError'
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = '認証が必要です'
  ) {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

/**
 * 認可エラー
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'この操作を実行する権限がありません'
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

/**
 * 外部APIエラー
 */
export class ExternalAPIError extends AppError {
  constructor(
    service: string,
    message: string = '外部サービスとの通信に失敗しました',
    originalError?: any
  ) {
    super(`${service}: ${message}`, 'EXTERNAL_API_ERROR', 502, originalError)
    this.name = 'ExternalAPIError'
  }
}

/**
 * レート制限エラー
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = 'リクエスト数が制限を超えました。しばらく待ってから再試行してください',
    retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter })
    this.name = 'RateLimitError'
  }
}

/**
 * ビジネスロジックエラー
 */
export class BusinessLogicError extends AppError {
  constructor(
    message: string,
    details?: any
  ) {
    super(message, 'BUSINESS_LOGIC_ERROR', 400, details)
    this.name = 'BusinessLogicError'
  }
}