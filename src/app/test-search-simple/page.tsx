'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

export default function TestSearchSimplePage() {
  const [searchText, setSearchText] = useState('')
  const [customerType, setCustomerType] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const [searchResults, setSearchResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<any[]>([])
  const [classes, setClasses] = useState<string[]>([])

  // メタデータ取得
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [tagsRes, classesRes] = await Promise.all([
          fetch('/api/tags'),
          fetch('/api/customers/classes')
        ])
        
        const [tagsData, classesData] = await Promise.all([
          tagsRes.json(),
          classesRes.json()
        ])
        
        setTags(tagsData.data || [])
        setClasses(classesData.data || [])
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
      }
    }

    fetchMetadata()
  }, [])

  // 検索実行
  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (searchText.trim()) params.set('searchText', searchText.trim())
      if (customerType) params.set('customerType', customerType)
      if (selectedClass) params.set('class', selectedClass)
      if (selectedTagIds.length > 0) params.set('tagIds', selectedTagIds.join(','))
      params.set('limit', '10')
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const response = await fetch(`/api/customers/search?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResults(data)
        toast.success(`${data.totalCount}件の検索結果が見つかりました`)
      } else {
        toast.error(data.error || '検索に失敗しました')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('検索中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // 検索条件をクリア
  const handleClear = () => {
    setSearchText('')
    setCustomerType('')
    setSelectedClass('')
    setSelectedTagIds([])
    setSortBy('created_at')
    setSortOrder('desc')
    setSearchResults(null)
  }

  // タグ選択の切り替え
  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId))
    } else {
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  // ページ変更
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || (searchResults && newPage > searchResults.totalPages)) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (searchText.trim()) params.set('searchText', searchText.trim())
      if (customerType) params.set('customerType', customerType)
      if (selectedClass) params.set('class', selectedClass)
      if (selectedTagIds.length > 0) params.set('tagIds', selectedTagIds.join(','))
      params.set('limit', '10')
      params.set('page', newPage.toString())
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const response = await fetch(`/api/customers/search?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResults(data)
        toast.success(`ページ${newPage}を表示しました`)
      } else {
        toast.error(data.error || '検索に失敗しました')
      }
    } catch (error) {
      console.error('Page change error:', error)
      toast.error('ページ変更中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">顧客検索API テスト（シンプル版）</h1>

      {/* 検索フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            検索条件
          </CardTitle>
          <CardDescription>複数の条件を組み合わせて顧客を検索できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* テキスト検索 */}
          <div className="space-y-2">
            <Label htmlFor="search-text">テキスト検索</Label>
            <Input
              id="search-text"
              placeholder="名前、フリガナ、電話番号、メール、会社名で検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 顧客種別 */}
            <div className="space-y-2">
              <Label>顧客種別</Label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value)}
                className="w-full p-2 border rounded bg-background text-foreground dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="">全て</option>
                <option value="personal">個人</option>
                <option value="company">法人</option>
              </select>
            </div>

            {/* クラス */}
            <div className="space-y-2">
              <Label>クラス</Label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border rounded bg-background text-foreground dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="">全て</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* ソート項目 */}
            <div className="space-y-2">
              <Label>ソート項目</Label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border rounded bg-background text-foreground dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="name">名前</option>
                <option value="name_kana">フリガナ</option>
                <option value="created_at">登録日</option>
                <option value="updated_at">更新日</option>
              </select>
            </div>

            {/* 並び順 */}
            <div className="space-y-2">
              <Label>並び順</Label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full p-2 border rounded bg-background text-foreground dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="desc">降順</option>
                <option value="asc">昇順</option>
              </select>
            </div>
          </div>

          {/* タグフィルタ */}
          <div className="space-y-2">
            <Label>タグフィルタ</Label>
            <div className="space-y-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
              {tags.map(tag => (
                <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={loading} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              {loading ? '検索中...' : '検索'}
            </Button>
            <Button onClick={handleClear} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              クリア
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 検索結果 */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>検索結果</CardTitle>
            <CardDescription>
              {searchResults.totalCount}件中 {((searchResults.page - 1) * searchResults.limit) + 1}-
              {Math.min(searchResults.page * searchResults.limit, searchResults.totalCount)}件を表示
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>クラス</TableHead>
                  <TableHead>連絡先</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.data.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.name_kana && (
                          <div className="text-sm text-muted-foreground">{customer.name_kana}</div>
                        )}
                        {customer.company_name && (
                          <div className="text-sm text-muted-foreground">{customer.company_name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.customer_type === 'company' ? 'default' : 'secondary'}>
                        {customer.customer_type === 'company' ? '法人' : '個人'}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.class || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.email && <div>{customer.email}</div>}
                        {customer.phone && <div>{customer.phone}</div>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* ページネーション */}
            {searchResults.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(searchResults.page - 1)}
                  disabled={searchResults.page === 1 || loading}
                >
                  前へ
                </Button>
                <span className="flex items-center px-4">
                  {searchResults.page} / {searchResults.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(searchResults.page + 1)}
                  disabled={searchResults.page === searchResults.totalPages || loading}
                >
                  次へ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}