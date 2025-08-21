'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function TestApiTagsV2Page() {
  const [customers, setCustomers] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
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
        setSelectedCustomer('')
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
      <h1 className="text-3xl font-bold">顧客とタグのJOIN API テスト（改良版）</h1>

      {/* タグ付与セクション */}
      <Card>
        <CardHeader>
          <CardTitle>タグ付与テスト</CardTitle>
          <CardDescription>顧客にタグを付与できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-select">顧客を選択</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger id="customer-select">
                <SelectValue placeholder="顧客を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.customer_type === 'company' ? '法人' : '個人'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>タグを選択（複数可）</Label>
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-600">
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <Checkbox
                    id={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTags([...selectedTags, tag.id])
                      } else {
                        setSelectedTags(selectedTags.filter(id => id !== tag.id))
                      }
                    }}
                  />
                  <Label
                    htmlFor={tag.id}
                    className="text-sm font-normal cursor-pointer text-foreground dark:text-gray-200 select-none"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={attachTags} 
            disabled={!selectedCustomer || selectedTags.length === 0}
            className="w-full"
          >
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
    </div>
  )
}