'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { UserX, Search, Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function TestDeleteCustomerPage() {
  const [customerId, setCustomerId] = useState('')
  const [existingCustomer, setExistingCustomer] = useState<any>(null)
  const [fetchingCustomer, setFetchingCustomer] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState(false)
  const [deleteResult, setDeleteResult] = useState<any>(null)
  const [deletedCustomers, setDeletedCustomers] = useState<any[]>([])
  const [loadingDeleted, setLoadingDeleted] = useState(false)

  // 顧客データ取得
  const fetchCustomer = async () => {
    if (!customerId.trim()) {
      toast.error('顧客IDを入力してください')
      return
    }

    setFetchingCustomer(true)
    
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      const data = await response.json()

      if (response.ok) {
        setExistingCustomer(data.data)
        setDeleteResult(null)
        toast.success('顧客データを取得しました')
      } else {
        toast.error(data.error || '顧客の取得に失敗しました')
        setExistingCustomer(null)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('通信エラーが発生しました')
      setExistingCustomer(null)
    } finally {
      setFetchingCustomer(false)
    }
  }

  // 顧客削除
  const handleDelete = async () => {
    if (!existingCustomer) {
      toast.error('先に顧客データを取得してください')
      return
    }

    // 確認ダイアログ
    if (!window.confirm(`顧客「${existingCustomer.name}」を削除してもよろしいですか？\n\nこの操作は取り消すことができます（論理削除）。`)) {
      return
    }

    setDeletingCustomer(true)
    
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setDeleteResult(data)
        setExistingCustomer(null)
        toast.success('顧客を削除しました')
        // 削除済み顧客一覧を更新
        fetchDeletedCustomers()
      } else {
        toast.error(data.error || '顧客の削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('通信エラーが発生しました')
    } finally {
      setDeletingCustomer(false)
    }
  }

  // 削除済み顧客一覧取得
  const fetchDeletedCustomers = async () => {
    setLoadingDeleted(true)
    
    try {
      // 削除済み顧客一覧用のAPIエンドポイントが必要
      // とりあえず、検索APIを使って削除済みかどうか確認用に使用
      const response = await fetch('/api/customers/search?limit=20')
      const data = await response.json()

      if (response.ok) {
        // 実際には削除済み顧客専用のAPIが必要だが、とりあえずデモ用
        setDeletedCustomers([])
      }
    } catch (error) {
      console.error('Fetch deleted customers error:', error)
    } finally {
      setLoadingDeleted(false)
    }
  }

  // 初回読み込み
  useEffect(() => {
    fetchDeletedCustomers()
  }, [])

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">顧客削除API テスト</h1>
      
      {/* 注意事項 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            重要な注意事項
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• このシステムは<strong>論理削除</strong>を採用しています</p>
            <p>• 削除された顧客データは完全には消去されず、削除フラグが設定されます</p>
            <p>• 削除された顧客は検索や一覧に表示されませんが、復元可能です</p>
            <p>• タグとの関連付けも保持され、復元時に元通りになります</p>
          </div>
        </CardContent>
      </Card>

      {/* 顧客ID入力・検索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            顧客検索
          </CardTitle>
          <CardDescription>削除する顧客のIDを入力して検索してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="顧客ID (UUID)"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={fetchCustomer} 
              disabled={fetchingCustomer}
            >
              {fetchingCustomer ? '検索中...' : '検索'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 既存顧客情報表示 */}
      {existingCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>削除対象の顧客情報</CardTitle>
            <CardDescription>以下の顧客を削除します</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div><strong>ID:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">{existingCustomer.id}</code></div>
              <div><strong>名前:</strong> {existingCustomer.name}</div>
              <div><strong>種別:</strong> {existingCustomer.customer_type === 'company' ? '法人' : '個人'}</div>
              {existingCustomer.company_name && (
                <div><strong>会社名:</strong> {existingCustomer.company_name}</div>
              )}
              <div><strong>メール:</strong> {existingCustomer.email || '未設定'}</div>
              <div><strong>電話:</strong> {existingCustomer.phone || '未設定'}</div>
              <div><strong>クラス:</strong> {existingCustomer.class || '未設定'}</div>
              <div><strong>作成日:</strong> {new Date(existingCustomer.created_at).toLocaleString('ja-JP')}</div>
            </div>
            
            {existingCustomer.tags && existingCustomer.tags.length > 0 && (
              <div className="mb-6">
                <strong>関連付けられたタグ:</strong>
                {existingCustomer.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="outline" className="ml-2">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <Button 
              onClick={handleDelete} 
              disabled={deletingCustomer}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deletingCustomer ? '削除中...' : 'この顧客を削除する'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 削除結果 */}
      {deleteResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">削除完了</CardTitle>
            <CardDescription>
              顧客が正常に削除されました（論理削除）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>削除された顧客ID:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">{deleteResult.data.customerId}</code></div>
                <div><strong>削除日時:</strong> {new Date(deleteResult.data.deletedAt).toLocaleString('ja-JP')}</div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">削除後の状態</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• 顧客データは保持されますが、deleted_atフラグが設定されました</li>
                  <li>• 通常の検索や一覧には表示されません</li>
                  <li>• タグとの関連付けも保持されています</li>
                  <li>• 管理者権限により復元可能です</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">RAW レスポンス</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(deleteResult, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 削除済み顧客の確認 */}
      <Card>
        <CardHeader>
          <CardTitle>削除の確認</CardTitle>
          <CardDescription>削除した顧客が検索できないことを確認</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              削除した顧客のIDで再度検索を試してみてください。「顧客が見つかりません」エラーが表示されるはずです。
            </p>
            
            {deleteResult && (
              <Button 
                onClick={() => {
                  setCustomerId(deleteResult.data.customerId)
                  setExistingCustomer(null)
                }}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                削除した顧客IDで再検索
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* テスト用の顧客ID一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>テスト用顧客ID</CardTitle>
          <CardDescription>以下のIDを使ってテストできます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground">これまでに作成した顧客のIDを使用してテストしてください：</p>
            <div className="grid grid-cols-1 gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded w-fit cursor-pointer hover:bg-muted/80"
                    onClick={() => setCustomerId('41f372fa-ca3d-48e7-803b-b8ea6a82a236')}>
                41f372fa-ca3d-48e7-803b-b8ea6a82a236 （更新テスト済み顧客）
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                ※ IDをクリックすると入力欄に設定されます
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}