'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  UserPlus, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  Mail,
  Building2,
  User,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { ExportButton } from '@/components/customers/export-button'

interface Customer {
  id: string
  customer_type: 'personal' | 'company'
  company_name?: string | null
  name: string
  name_kana?: string | null
  class?: string | null
  email?: string | null
  phone?: string | null
  created_at: string
  updated_at: string
  tags?: Array<{ id: string; name: string }>
}

interface SearchResponse {
  data: Customer[]
  totalCount: number
  page: number
  totalPages: number
  limit: number
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [customerType, setCustomerType] = useState<'all' | 'personal' | 'company'>('all')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit] = useState(10)
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'name_kana'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [classes, setClasses] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // クラス一覧を取得
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/customers/classes')
        const data = await response.json()
        if (response.ok) {
          setClasses(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error)
      }
    }
    fetchClasses()
  }, [])

  // 顧客データ取得
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    
    try {
      const params = new URLSearchParams()
      
      // フィルタパラメータ
      if (searchText) params.append('searchText', searchText)
      if (customerType !== 'all') params.append('customerType', customerType)
      if (selectedClass) params.append('class', selectedClass)
      
      // ページネーション
      params.append('page', currentPage.toString())
      params.append('limit', limit.toString())
      
      // ソート
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)

      const response = await fetch(`/api/customers/search?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setCustomers(data.data || [])
        setTotalCount(data.totalCount || 0)
        setTotalPages(data.totalPages || 1)
      } else {
        // エラーが発生した場合、基本的な顧客リストを試す
        const fallbackResponse = await fetch('/api/customers')
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          setCustomers(fallbackData.data || [])
          setTotalCount(fallbackData.data?.length || 0)
          setTotalPages(1)
        } else {
          toast.error('顧客データの取得に失敗しました')
          setCustomers([])
        }
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('通信エラーが発生しました')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [searchText, customerType, selectedClass, currentPage, limit, sortBy, sortOrder])

  // 初回読み込みとフィルタ変更時の再取得
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // フィルタリセット
  const handleResetFilters = () => {
    setSearchText('')
    setCustomerType('all')
    setSelectedClass('')
    setSortBy('created_at')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  // ページング
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // 顧客詳細へ遷移
  const handleViewCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}`)
  }

  // 顧客編集へ遷移
  const handleEditCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}/edit`)
  }

  // 顧客削除
  const handleDeleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`顧客「${customer.name}」を削除してもよろしいですか？`)) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('顧客を削除しました')
        fetchCustomers()
      } else {
        const data = await response.json()
        toast.error(data.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('通信エラーが発生しました')
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">顧客一覧</h1>
          <p className="text-muted-foreground mt-1">
            全{totalCount}件の顧客データ
          </p>
        </div>
        <div className="flex gap-3">
          <ExportButton totalCount={totalCount} variant="outline" />
          <Button onClick={() => router.push('/customers/new')} size="lg">
            <UserPlus className="h-5 w-5 mr-2" />
            新規顧客登録
          </Button>
        </div>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              検索・フィルター
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'フィルターを隠す' : 'フィルターを表示'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 検索ボックス */}
          <div className="flex gap-2">
            <Input
              placeholder="名前、メール、電話番号で検索..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                setCurrentPage(1)
              }}
              className="flex-1"
            />
            <Button onClick={fetchCustomers}>
              <Search className="h-4 w-4 mr-2" />
              検索
            </Button>
          </div>

          {/* フィルターオプション */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* 顧客種別 */}
              <div className="space-y-2">
                <Label>顧客種別</Label>
                <select
                  value={customerType}
                  onChange={(e) => {
                    setCustomerType(e.target.value as typeof customerType)
                    setCurrentPage(1)
                  }}
                  className="w-full p-2 border rounded bg-background"
                >
                  <option value="all">すべて</option>
                  <option value="personal">個人</option>
                  <option value="company">法人</option>
                </select>
              </div>

              {/* クラス */}
              <div className="space-y-2">
                <Label>クラス</Label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full p-2 border rounded bg-background"
                >
                  <option value="">すべて</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* ソート項目 */}
              <div className="space-y-2">
                <Label>並び順</Label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as typeof sortBy)
                    setCurrentPage(1)
                  }}
                  className="w-full p-2 border rounded bg-background"
                >
                  <option value="created_at">登録日</option>
                  <option value="name">名前</option>
                  <option value="name_kana">フリガナ</option>
                </select>
              </div>

              {/* ソート順 */}
              <div className="space-y-2">
                <Label>表示順</Label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as typeof sortOrder)
                    setCurrentPage(1)
                  }}
                  className="w-full p-2 border rounded bg-background"
                >
                  <option value="desc">降順</option>
                  <option value="asc">昇順</option>
                </select>
              </div>

              {/* リセットボタン */}
              <div className="md:col-span-3 lg:col-span-4">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="w-full md:w-auto"
                >
                  フィルターをリセット
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 顧客リスト */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              読み込み中...
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              顧客データがありません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4">顧客情報</th>
                    <th className="text-left p-4 hidden md:table-cell">連絡先</th>
                    <th className="text-left p-4 hidden lg:table-cell">クラス</th>
                    <th className="text-left p-4 hidden xl:table-cell">タグ</th>
                    <th className="text-left p-4 hidden lg:table-cell">登録日</th>
                    <th className="text-center p-4">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {customer.customer_type === 'company' ? (
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <User className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            {customer.name_kana && (
                              <div className="text-sm text-muted-foreground">{customer.name_kana}</div>
                            )}
                            {customer.company_name && (
                              <div className="text-sm text-muted-foreground">{customer.company_name}</div>
                            )}
                            <Badge variant="outline" className="mt-1 md:hidden">
                              {customer.customer_type === 'company' ? '法人' : '個人'}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {customer.class ? (
                          <Badge variant="secondary">{customer.class}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 hidden xl:table-cell">
                        {customer.tags && customer.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {customer.tags.map((tag) => (
                              <Badge key={tag.id} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(customer.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCustomer(customer.id)}
                            title="詳細"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCustomer(customer.id)}
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer)}
                            title="削除"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ページネーション */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">
              {totalCount}件中 {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalCount)}件を表示
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}