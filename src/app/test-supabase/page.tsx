'use client'

import { useEffect, useState } from 'react'

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/test-connection')
      .then(res => res.json())
      .then(data => {
        setConnectionStatus(data)
        setLoading(false)
      })
      .catch(error => {
        setConnectionStatus({ success: false, error: error.message })
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase接続テスト</h1>
        
        {loading ? (
          <p className="text-gray-600">接続テスト中...</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">接続状態:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  connectionStatus?.success 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {connectionStatus?.success ? '接続成功' : '接続失敗'}
                </span>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  {connectionStatus?.message}
                </p>
                {connectionStatus?.error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    エラー詳細: {connectionStatus.error}
                  </p>
                )}
              </div>

              {connectionStatus?.details && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
                  <h3 className="font-semibold mb-2">詳細情報:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Supabase接続: {connectionStatus.details.connected ? '✅ OK' : '❌ NG'}</li>
                    <li>テーブル存在: {connectionStatus.details.tablesExist ? '✅ 作成済み' : '⚠️ 未作成'}</li>
                  </ul>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">次のステップ:</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  接続は成功しています。次は「002-database-schema-creation」でデータベーステーブルを作成してください。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}