'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { FileText, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Invoice } from '@/types/invoice'

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  // 請求書一覧を取得
  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/invoices')
      const data = await response.json()
      
      if (data.success) {
        setInvoices(data.data)
      } else {
        toast.error('請求書の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

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

  const handleDelete = async (id: string) => {
    // TODO: 削除機能は後で実装
    toast.info('削除機能は後で実装予定です')
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

      {/* 請求書一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            請求書リスト
          </CardTitle>
          <CardDescription>
            {invoices.length > 0 
              ? `全 ${invoices.length} 件の請求書`
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
                    <TableHead>請求書番号</TableHead>
                    <TableHead>発行日</TableHead>
                    <TableHead>請求先</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
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
                            onClick={() => handleDelete(invoice.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}