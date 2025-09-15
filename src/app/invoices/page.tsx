'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FileText, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Invoice } from '@/types/invoice'
import { InvoiceSearchEnhanced } from '@/components/invoices/invoice-search-enhanced'
import { InvoiceAdvancedSearch, SearchFilters } from '@/components/invoices/invoice-advanced-search'
import { Badge } from '@/components/ui/badge'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Checkbox } from '@/components/ui/checkbox'
import { BulkOperationsToolbar } from '@/components/invoices/bulk-operations-toolbar'

export default function InvoicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 検索設定をローカルストレージに保存
  const [savedFilters, setSavedFilters] = useLocalStorage<SearchFilters>(
    'invoice-search-filters',
    {
      sortBy: 'issue_date',
      sortOrder: 'desc',
      limit: 20
    }
  )

  const [filters, setFilters] = useState<SearchFilters>({
    dateFrom: searchParams.get('date_from') || undefined,
    dateTo: searchParams.get('date_to') || undefined,
    amountMin: searchParams.get('amount_min') || undefined,
    amountMax: searchParams.get('amount_max') || undefined,
    sortBy: searchParams.get('sort_by') || savedFilters.sortBy || 'issue_date',
    sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || savedFilters.sortOrder || 'desc',
    limit: parseInt(searchParams.get('limit') || String(savedFilters.limit) || '20')
  })
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [stats, setStats] = useState({
    totalCount: 0,
    totalAmount: 0
  })

  // 請求書を検索
  const searchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (searchQuery) params.append('q', searchQuery)
      if (filters.dateFrom) params.append('date_from', filters.dateFrom)
      if (filters.dateTo) params.append('date_to', filters.dateTo)
      if (filters.amountMin) params.append('amount_min', filters.amountMin)
      if (filters.amountMax) params.append('amount_max', filters.amountMax)
      if (filters.sortBy) params.append('sort_by', filters.sortBy)
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder)
      params.append('page', String(pagination.page))
      params.append('limit', String(filters.limit || 20))

      // 開発環境では相対パスを使用（Next.jsが自動的に正しいポートを使用）
      const response = await fetch(`/api/invoices/search?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setInvoices(data.invoices)
        setPagination(data.pagination)
        setStats(data.stats)

        // URLを更新
        const newParams = new URLSearchParams()
        if (searchQuery) newParams.set('q', searchQuery)
        if (filters.dateFrom) newParams.set('date_from', filters.dateFrom)
        if (filters.dateTo) newParams.set('date_to', filters.dateTo)
        if (filters.amountMin) newParams.set('amount_min', filters.amountMin)
        if (filters.amountMax) newParams.set('amount_max', filters.amountMax)
        if (filters.sortBy && filters.sortBy !== 'issue_date') newParams.set('sort_by', filters.sortBy)
        if (filters.sortOrder && filters.sortOrder !== 'desc') newParams.set('sort_order', filters.sortOrder)
        if (pagination.page > 1) newParams.set('page', String(pagination.page))
        if (filters.limit && filters.limit !== 20) newParams.set('limit', String(filters.limit))

        router.push(`/invoices${newParams.toString() ? `?${newParams.toString()}` : ''}`)
      } else {
        toast.error('請求書の検索に失敗しました')
      }
    } catch (error) {
      console.error('Error searching invoices:', error)
      toast.error('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters, pagination.page, router])

  // 検索ハンドラー
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  // フィルター変更ハンドラー
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters)
    setSavedFilters(newFilters) // ローカルストレージに保存
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [setSavedFilters])

  // フィルターリセット
  const handleResetFilters = useCallback(() => {
    setSearchQuery('')
    setFilters({
      sortBy: 'issue_date',
      sortOrder: 'desc',
      limit: 20
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  // ページ変更
  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }, [])

  // 選択処理
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(invoices.map(invoice => invoice.id))
    } else {
      setSelectedIds([])
    }
  }, [invoices])

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
    }
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const handleDeleteComplete = useCallback(() => {
    searchInvoices()
  }, [searchInvoices])

  useEffect(() => {
    searchInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters, pagination.page])

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP')
  }

  // 金額フォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  // アクションハンドラー
  const handleView = (id: string) => {
    router.push(`/invoices/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/invoices/${id}/edit`)
  }

  // 削除ダイアログを開く
  const openDeleteDialog = (invoice: Invoice) => {
    setInvoiceToDelete(invoice)
    setDeleteDialogOpen(true)
  }

  // 削除処理
  const handleDelete = async () => {
    if (!invoiceToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/invoices/${invoiceToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '請求書の削除に失敗しました')
      }

      // 成功時は一覧から削除
      setInvoices(invoices.filter(invoice => invoice.id !== invoiceToDelete.id))
      toast.success('請求書を削除しました')
      setDeleteDialogOpen(false)
      setInvoiceToDelete(null)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : '削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">請求書一覧</h1>
          <p className="text-muted-foreground mt-1">
            作成した請求書を管理します
          </p>
        </div>
        <Button
          onClick={() => router.push('/invoices/new')}
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          新規作成
        </Button>
      </div>

      {/* 検索バー */}
      <div className="mb-6">
        <InvoiceSearchEnhanced
          onSearch={handleSearch}
          onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
          defaultValue={searchQuery}
          suggestions={[
            'INV-2024',
            '株式会社',
            '請求書',
            '見積書'
          ]}
        />
        <InvoiceAdvancedSearch
          isOpen={showAdvanced}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* 一括操作ツールバー */}
      <BulkOperationsToolbar
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        onDeleteComplete={handleDeleteComplete}
      />

      {/* 検索結果サマリー */}
      {(searchQuery || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {searchQuery && (
            <Badge variant="secondary">
              検索: {searchQuery}
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary">
              開始日: {filters.dateFrom}
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary">
              終了日: {filters.dateTo}
            </Badge>
          )}
          {filters.amountMin && (
            <Badge variant="secondary">
              最小金額: ¥{parseInt(filters.amountMin).toLocaleString()}
            </Badge>
          )}
          {filters.amountMax && (
            <Badge variant="secondary">
              最大金額: ¥{parseInt(filters.amountMax).toLocaleString()}
            </Badge>
          )}
          <div className="ml-auto text-sm text-muted-foreground">
            {stats.totalCount}件 / 合計: {formatCurrency(stats.totalAmount)}
          </div>
        </div>
      )}

      {/* 請求書一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            請求書リスト
          </CardTitle>
          <CardDescription>
            {stats.totalCount > 0
              ? `全 ${stats.totalCount} 件中 ${invoices.length} 件を表示`
              : '請求書がありません'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                まだ請求書が作成されていません
              </p>
              <Button onClick={() => router.push('/invoices/new')}>
                <Plus className="h-4 w-4 mr-2" />
                最初の請求書を作成
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === invoices.length && invoices.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="すべて選択"
                      />
                    </TableHead>
                    <TableHead>請求書番号</TableHead>
                    <TableHead>発行日</TableHead>
                    <TableHead>請求先</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className={selectedIds.includes(invoice.id) ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(invoice.id)}
                          onCheckedChange={(checked) => handleSelectOne(invoice.id, checked as boolean)}
                          aria-label={`請求書 ${invoice.invoice_number} を選択`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                      <TableCell>{invoice.billing_name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(invoice.id)}
                            title="詳細"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(invoice.id)}
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(invoice)}
                            title="削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ページネーション */}
          {stats.totalCount > 0 && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, stats.totalCount)} / {stats.totalCount} 件
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>請求書を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {invoiceToDelete && (
                <>
                  請求書番号「{invoiceToDelete.invoice_number}」を削除します。
                  <br />
                  この操作は取り消せません。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '削除中...' : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}