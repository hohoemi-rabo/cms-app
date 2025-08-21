'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface SearchParams {
  searchText: string
  customerType: string
  class: string
  tagIds: string[]
  page: number
  sortBy: string
  sortOrder: string
}

export default function TestSearchPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchText: '',
    customerType: '',
    class: '',
    tagIds: [],
    page: 1,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const [searchResults, setSearchResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<any[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])

  // タグ一覧とクラス一覧を取得
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // タグ取得
        const tagsRes = await fetch('/api/tags')
        const tagsData = await tagsRes.json()
        setTags(tagsData.data || [])

        // クラス取得
        const classesRes = await fetch('/api/customers/classes')
        const classesData = await classesRes.json()
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
      
      if (searchParams.searchText) params.set('searchText', searchParams.searchText)
      if (searchParams.customerType) params.set('customerType', searchParams.customerType)
      if (searchParams.class) params.set('class', searchParams.class)
      if (searchParams.tagIds.length > 0) params.set('tagIds', searchParams.tagIds.join(','))
      params.set('page', searchParams.page.toString())
      params.set('limit', '10')
      params.set('sortBy', searchParams.sortBy)
      params.set('sortOrder', searchParams.sortOrder)

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
    setSearchParams({
      searchText: '',
      customerType: '',
      class: '',
      tagIds: [],
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
    setSearchResults(null)
    setSuggestions([])
  }

  // 検索候補を取得
  const handleInputChange = async (value: string) => {
    setSearchParams(prev => ({ ...prev, searchText: value }))
    
    if (value.trim().length > 0) {
      try {
        const response = await fetch(`/api/customers/suggestions?q=${encodeURIComponent(value)}&limit=5`)
        const data = await response.json()
        if (data.success) {
          setSuggestions(data.data)
        }
      } catch (error) {
        console.error('Suggestions error:', error)
      }
    } else {
      setSuggestions([])
    }
  }

  // ページ変更
  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }))
    // 自動で検索実行
    setTimeout(() => handleSearch(), 100)
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">顧客検索API テスト</h1>

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
            <div className="relative">
              <Input
                id="search-text"
                placeholder="名前、フリガナ、電話番号、メール、会社名で検索..."
                value={searchParams.searchText}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-3 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        setSearchParams(prev => ({ ...prev, searchText: suggestion.name }))
                        setSuggestions([])
                      }}
                    >
                      <div className="font-medium">{suggestion.name}</div>
                      {suggestion.company_name && (
                        <div className="text-sm text-muted-foreground">{suggestion.company_name}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {suggestion.customer_type === 'company' ? '法人' : '個人'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 顧客種別フィルタ */}
            <div className="space-y-2">
              <Label>顧客種別</Label>
              <Select
                value={searchParams.customerType}
                onValueChange={(value) => 
                  setSearchParams(prev => ({ ...prev, customerType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全て" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全て</SelectItem>
                  <SelectItem value="personal">個人</SelectItem>
                  <SelectItem value="company">法人</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* クラスフィルタ */}
            <div className="space-y-2">
              <Label>クラス</Label>
              <Select
                value={searchParams.class}
                onValueChange={(value) => 
                  setSearchParams(prev => ({ ...prev, class: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全て" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全て</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ソート */}
            <div className="space-y-2">
              <Label>並び順</Label>
              <div className="flex gap-2">
                <Select
                  value={searchParams.sortBy}
                  onValueChange={(value) => 
                    setSearchParams(prev => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">名前</SelectItem>
                    <SelectItem value="name_kana">フリガナ</SelectItem>
                    <SelectItem value="created_at">登録日</SelectItem>
                    <SelectItem value="updated_at">更新日</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={searchParams.sortOrder}
                  onValueChange={(value) => 
                    setSearchParams(prev => ({ ...prev, sortOrder: value }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">昇順</SelectItem>
                    <SelectItem value="desc">降順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* タグフィルタ */}
          <div className="space-y-2">
            <Label>タグフィルタ</Label>
            <div className="space-y-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={searchParams.tagIds.includes(tag.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSearchParams(prev => ({
                          ...prev,
                          tagIds: [...prev.tagIds, tag.id]
                        }))
                      } else {
                        setSearchParams(prev => ({
                          ...prev,
                          tagIds: prev.tagIds.filter(id => id !== tag.id)
                        }))
                      }
                    }}
                  />
                  <Label htmlFor={`tag-${tag.id}`} className="text-sm font-normal cursor-pointer">
                    {tag.name}
                  </Label>
                </div>
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