'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

export default function TestApiTagsPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 顧客データ（タグ付き）を取得
  const fetchCustomersWithTags = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/customers/with-tags?limit=10')
      const data = await res.json()
      setCustomers(data.data || [])
    } catch (error) {
      console.error(error)
      toast.error('顧客データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // タグ一覧を取得
  const fetchTags = async () => {
    try {
      const { data } = await fetch('/api/tags').then(res => res.json())
      setTags(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  // タグを顧客に付与
  const attachTags = async () => {
    if (!selectedCustomer || selectedTags.length === 0) {
      toast.error('顧客とタグを選択してください')
      return
    }

    try {
      const res = await fetch('/api/customers/attach-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer,
          tagIds: selectedTags
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchCustomersWithTags() // 再取得
        setSelectedCustomer(null)
        setSelectedTags([])
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('タグの付与に失敗しました')
    }
  }

  useEffect(() => {
    fetchCustomersWithTags()
    fetchTags()
  }, [])

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">顧客とタグのJOIN API テスト</h1>

      {/* タグ付与セクション */}
      <Card>
        <CardHeader>
          <CardTitle>タグ付与テスト</CardTitle>
          <CardDescription>顧客にタグを付与できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">顧客を選択</label>
            <select 
              className="w-full mt-1 p-2 border rounded bg-background text-foreground dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              value={selectedCustomer || ''}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">選択してください</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.customer_type === 'company' ? '法人' : '個人'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">タグを選択（複数可）</label>
            <div className="mt-2 space-y-2">
              {tags.map(tag => (
                <label key={tag.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.id])
                      } else {
                        setSelectedTags(selectedTags.filter(id => id !== tag.id))
                      }
                    }}
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={attachTags} disabled={!selectedCustomer || selectedTags.length === 0}>
            タグを付与
          </Button>
        </CardContent>
      </Card>

      {/* 顧客一覧（タグ付き） */}
      <Card>
        <CardHeader>
          <CardTitle>顧客一覧（タグ情報付き）</CardTitle>
          <CardDescription>JOINクエリで取得したデータ</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>読み込み中...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名前</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>タグ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-xs">
                      {customer.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>
                      {customer.customer_type === 'company' ? '法人' : '個人'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.map((tag: any) => (
                            <Badge key={tag.id} variant="secondary">
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">タグなし</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* API情報 */}
      <Card>
        <CardHeader>
          <CardTitle>API情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-sm">
          <p>GET /api/customers/with-tags - タグ情報を含む顧客一覧</p>
          <p>POST /api/customers/attach-tags - 顧客にタグを付与</p>
          <p>GET /api/tags - タグ一覧（要実装）</p>
        </CardContent>
      </Card>
    </div>
  )
}