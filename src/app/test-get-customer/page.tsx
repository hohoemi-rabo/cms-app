'use client'

import { useState } from 'react'
import type { CustomerWithTags } from '@/lib/api/customers/get-customer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { User, Search, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function TestGetCustomerPage() {
  const [customerId, setCustomerId] = useState('')
  const [customer, setCustomer] = useState<CustomerWithTags | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastSearchId, setLastSearchId] = useState('')

  // 顧客データ取得
  const handleGetCustomer = async () => {
    if (!customerId.trim()) {
      toast.error('顧客IDを入力してください')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/customers/${encodeURIComponent(customerId.trim())}`)
      const data = await response.json()
      
      if (response.ok) {
        setCustomer(data.data)
        setLastSearchId(customerId.trim())
        toast.success('顧客データを取得しました')
      } else if (response.status === 404) {
        setCustomer(null)
        setLastSearchId(customerId.trim())
        toast.error('指定された顧客が見つかりません')
      } else {
        toast.error(data.error || '顧客データの取得に失敗しました')
      }
    } catch (error) {
      console.error('Get customer error:', error)
      toast.error('顧客データの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // フォームクリア
  const handleClear = () => {
    setCustomerId('')
    setCustomer(null)
    setLastSearchId('')
  }

  // Enterキーでの検索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGetCustomer()
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">単一顧客取得API テスト</h1>

      {/* 入力フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            顧客ID指定
          </CardTitle>
          <CardDescription>UUIDまたは顧客IDを入力して特定の顧客データを取得します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-id">顧客ID (UUID形式)</Label>
            <Input
              id="customer-id"
              placeholder="e.g. 12345678-1234-5678-9abc-123456789abc"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <p className="text-sm text-muted-foreground">
              既存の顧客IDを入力してください。UUIDでない場合や存在しないIDの場合は404エラーが返されます。
            </p>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <Button onClick={handleGetCustomer} disabled={loading} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              {loading ? '取得中...' : '顧客取得'}
            </Button>
            <Button onClick={handleClear} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              クリア
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 検索結果表示 */}
      {lastSearchId && (
        <Card>
          <CardHeader>
            <CardTitle>検索結果</CardTitle>
            <CardDescription>
              ID: {lastSearchId} の検索結果
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer ? (
              <div className="space-y-6">
                {/* 基本情報 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">基本情報</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium w-32">ID</TableCell>
                        <TableCell className="font-mono text-sm">{customer.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">名前</TableCell>
                        <TableCell>{customer.name}</TableCell>
                      </TableRow>
                      {customer.name_kana && (
                        <TableRow>
                          <TableCell className="font-medium">フリガナ</TableCell>
                          <TableCell>{customer.name_kana}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell className="font-medium">種別</TableCell>
                        <TableCell>
                          <Badge variant={customer.customer_type === 'company' ? 'default' : 'secondary'}>
                            {customer.customer_type === 'company' ? '法人' : '個人'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {customer.company_name && (
                        <TableRow>
                          <TableCell className="font-medium">会社名</TableCell>
                          <TableCell>{customer.company_name}</TableCell>
                        </TableRow>
                      )}
                      {customer.class && (
                        <TableRow>
                          <TableCell className="font-medium">クラス</TableCell>
                          <TableCell>{customer.class}</TableCell>
                        </TableRow>
                      )}
                      {customer.email && (
                        <TableRow>
                          <TableCell className="font-medium">メール</TableCell>
                          <TableCell>{customer.email}</TableCell>
                        </TableRow>
                      )}
                      {customer.phone && (
                        <TableRow>
                          <TableCell className="font-medium">電話番号</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                        </TableRow>
                      )}
                      {customer.address && (
                        <TableRow>
                          <TableCell className="font-medium">住所</TableCell>
                          <TableCell>{customer.address}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell className="font-medium">登録日</TableCell>
                        <TableCell>{new Date(customer.created_at).toLocaleString('ja-JP')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">更新日</TableCell>
                        <TableCell>{new Date(customer.updated_at).toLocaleString('ja-JP')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* タグ情報 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">関連タグ</h3>
                  {customer.tags && customer.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">タグが設定されていません</p>
                  )}
                </div>

                {/* JSON表示 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">RAW データ</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(customer, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">顧客が見つかりませんでした</p>
                <p className="text-sm text-muted-foreground mt-2">
                  • IDが正しいか確認してください<br/>
                  • 削除済みの顧客は表示されません<br/>
                  • UUID形式でない場合はエラーになります
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* テスト用のヒント */}
      <Card>
        <CardHeader>
          <CardTitle>テスト用情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>有効なIDの取得方法:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>検索API (`/test-search`) で顧客一覧を表示してIDをコピー</li>
              <li>データベースの直接確認</li>
              <li>シードデータのID確認</li>
            </ul>
            <p className="mt-4"><strong>テストケース:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>存在するID → 200 OK でデータ表示</li>
              <li>存在しないID → 404 Not Found</li>
              <li>無効な形式のID → 404 Not Found</li>
              <li>削除済みの顧客ID → 404 Not Found</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}