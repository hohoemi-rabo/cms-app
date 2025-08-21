'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CustomerResponse {
  data: any[]
  totalCount: number
  page: number
  totalPages: number
  limit: number
}

export default function TestApiCustomersPage() {
  const [response, setResponse] = useState<CustomerResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        sortBy,
        sortOrder
      })
      
      const res = await fetch(`/api/customers?${params}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch')
      }
      
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [page, sortBy, sortOrder])

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">顧客一覧API テスト</h1>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>API パラメータ</CardTitle>
          <CardDescription>取得条件を設定してテスト</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">ソート項目</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">名前</SelectItem>
                  <SelectItem value="name_kana">フリガナ</SelectItem>
                  <SelectItem value="created_at">登録日</SelectItem>
                  <SelectItem value="updated_at">更新日</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">並び順</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">昇順</SelectItem>
                  <SelectItem value="desc">降順</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchCustomers} disabled={loading}>
              {loading ? '読み込み中...' : '再取得'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">エラー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Response Info */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>レスポンス情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="font-medium">総件数:</span> {response.totalCount}
              </div>
              <div>
                <span className="font-medium">現在ページ:</span> {response.page}
              </div>
              <div>
                <span className="font-medium">総ページ数:</span> {response.totalPages}
              </div>
              <div>
                <span className="font-medium">表示件数:</span> {response.data.length}
              </div>
              <div>
                <span className="font-medium">1ページあたり:</span> {response.limit}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {response && response.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>取得データ</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>名前</TableHead>
                  <TableHead>メール</TableHead>
                  <TableHead>登録日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {response.data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-xs">
                      {customer.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {customer.customer_type === 'company' ? '法人' : '個人'}
                    </TableCell>
                    <TableCell>{customer.name || '-'}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString('ja-JP') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {response && response.totalPages > 1 && (
        <Card>
          <CardContent className="flex justify-center gap-2 pt-6">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              前へ
            </Button>
            <span className="flex items-center px-4">
              {page} / {response.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(response.totalPages, p + 1))}
              disabled={page === response.totalPages || loading}
            >
              次へ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {response && response.data.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">顧客データがありません</p>
            <p className="text-sm text-muted-foreground mt-2">
              まだ顧客が登録されていないか、すべて削除されています
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}