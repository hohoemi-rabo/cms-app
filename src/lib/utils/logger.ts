/**
 * ログレベル
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * ログエントリーの型定義
 */
interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
  context?: Record<string, any>
}

/**
 * シンプルなロガークラス
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isClient = typeof window !== 'undefined'
  private context: Record<string, any> = {}

  /**
   * コンテキストを設定
   */
  setContext(context: Record<string, any>) {
    this.context = { ...this.context, ...context }
  }

  /**
   * コンテキストをクリア
   */
  clearContext() {
    this.context = {}
  }

  /**
   * ログエントリーを作成
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context: Object.keys(this.context).length > 0 ? this.context : undefined
    }
  }

  /**
   * ログを出力
   */
  private log(entry: LogEntry) {
    // 本番環境では、debugログは出力しない
    if (!this.isDevelopment && entry.level === LogLevel.DEBUG) {
      return
    }

    const consoleMethod = this.getConsoleMethod(entry.level)
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
    const message = `${prefix} ${entry.message}`

    if (entry.data || entry.context) {
      consoleMethod(message, {
        data: entry.data,
        context: entry.context
      })
    } else {
      consoleMethod(message)
    }

    // 本番環境では、エラーログを外部サービスに送信することも可能
    if (!this.isDevelopment && entry.level === LogLevel.ERROR) {
      this.sendToExternalService(entry)
    }
  }

  /**
   * コンソールメソッドを取得
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug
      case LogLevel.INFO:
        return console.info
      case LogLevel.WARN:
        return console.warn
      case LogLevel.ERROR:
        return console.error
      default:
        return console.log
    }
  }

  /**
   * 外部サービスにログを送信（プレースホルダー）
   */
  private sendToExternalService(entry: LogEntry) {
    // TODO: Sentry、LogRocket、DataDogなどの外部サービスへの送信を実装
    // 例：
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(entry.data)
    // }
  }

  /**
   * デバッグログ
   */
  debug(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data)
    this.log(entry)
  }

  /**
   * 情報ログ
   */
  info(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, message, data)
    this.log(entry)
  }

  /**
   * 警告ログ
   */
  warn(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, message, data)
    this.log(entry)
  }

  /**
   * エラーログ
   */
  error(message: string, error?: any, additionalData?: any) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...additionalData
    } : { error, ...additionalData }

    const entry = this.createLogEntry(LogLevel.ERROR, message, errorData)
    this.log(entry)
  }

  /**
   * パフォーマンス計測
   */
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }

  /**
   * グループログ
   */
  group(label: string) {
    if (this.isDevelopment) {
      console.group(label)
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd()
    }
  }
}

// シングルトンインスタンスをエクスポート
export const logger = new Logger()

// クライアントサイドでグローバルに利用可能にする（開発環境のみ）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).logger = logger
}