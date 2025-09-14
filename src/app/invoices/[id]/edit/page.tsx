'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Plus, Trash2, FileText, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { InvoiceWithItems } from '@/types/invoice'
import { CustomerSelector } from '@/components/invoices/customer-selector'

interface InvoiceItem {
  item_name: string
  quantity: number
  unit_price: number
  amount: number
}

interface InvoiceForm {
  issue_date: string
  billing_name: string
  billing_address?: string
  billing_honorific?: string
  customer_id?: string | null
  items: InvoiceItem[]
}

interface InvoiceEditPageProps {
  params: Promise<{ id: string }>
}

export default function InvoiceEditPage({ params }: InvoiceEditPageProps) {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [form, setForm] = useState<InvoiceForm>({
    issue_date: '',
    billing_name: '',
    billing_address: '',
    billing_honorific: '様',
    customer_id: null,
    items: []
  })

  // パラメータとデータの初期化
  useEffect(() => {
    const initializePage = async () => {
      try {
        const resolvedParams = await params
        setId(resolvedParams.id)
        
        // 請求書データを取得
        const response = await fetch(`/api/invoices/${resolvedParams.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
            return
          }
          throw new Error('請求書の取得に失敗しました')
        }

        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || '請求書の取得に失敗しました')
        }

        const invoiceData = data.data as InvoiceWithItems
        setInvoice(invoiceData)
        
        // フォームを初期化
        setForm({
          issue_date: invoiceData.issue_date,
          billing_name: invoiceData.billing_name,
          billing_address: invoiceData.billing_address || '',
          billing_honorific: invoiceData.billing_honorific || '様',
          customer_id: invoiceData.customer_id || null,
          items: invoiceData.items.length > 0
            ? invoiceData.items.map(item => ({
                item_name: item.item_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: item.amount
              }))
            : [{ item_name: '', quantity: 0, unit_price: 0, amount: 0 }]
        })
      } catch (err) {
        console.error('Error loading invoice:', err)
        setError(err instanceof Error ? err.message : '請求書の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [params])

  // 金額計算
  const calculateItemAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  // 合計金額計算
  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + item.amount, 0)
  }

  // 明細行更新
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...form.items]
    const item = { ...updatedItems[index] }
    
    if (field === 'item_name') {
      item[field] = value as string
    } else if (field === 'quantity' || field === 'unit_price') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
      item[field] = numValue
      item.amount = calculateItemAmount(
        field === 'quantity' ? numValue : item.quantity,
        field === 'unit_price' ? numValue : item.unit_price
      )
    }
    
    updatedItems[index] = item
    setForm({ ...form, items: updatedItems })
  }

  // 行追加
  const addItem = () => {
    if (form.items.length < 10) {
      setForm({
        ...form,
        items: [...form.items, { item_name: '', quantity: 0, unit_price: 0, amount: 0 }]
      })
    }
  }

  // 行削除
  const removeItem = (index: number) => {
    if (form.items.length > 1) {
      const updatedItems = form.items.filter((_, i) => i !== index)
      setForm({ ...form, items: updatedItems })
    }
  }

  // 更新処理
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError(null)

    try {
      // バリデーション
      if (!form.billing_name.trim()) {
        throw new Error('請求先名は必須です')
      }

      const validItems = form.items.filter(item => 
        item.item_name.trim() && item.quantity > 0
      )

      if (validItems.length === 0) {
        throw new Error('明細を最低1行は入力してください')
      }

      const requestData = {
        issue_date: form.issue_date,
        billing_name: form.billing_name.trim(),
        billing_address: form.billing_address,
        billing_honorific: form.billing_honorific,
        customer_id: form.customer_id,
        items: validItems
      }

      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '請求書の更新に失敗しました')
      }

      toast.success('請求書を更新しました')
      router.push(`/invoices/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsUpdating(false)
    }
  }

  // 削除処理
  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '請求書の削除に失敗しました')
      }

      toast.success('請求書を削除しました')
      router.push('/invoices')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  // 金額フォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error && !invoice) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto border-destructive">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive">{error}</p>
            <Link href="/invoices" className="mt-4 inline-block">
              <Button variant="outline">一覧に戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/invoices/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">請求書編集</h1>
            <p className="text-muted-foreground mt-1">
              {invoice?.invoice_number}
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>請求書を削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消すことができません。請求書「{invoice?.invoice_number}」を完全に削除します。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
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

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              基本情報
            </CardTitle>
            <CardDescription>
              請求書の基本情報を編集してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_number">請求書番号</Label>
                <Input
                  id="invoice_number"
                  type="text"
                  value={invoice?.invoice_number || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="issue_date">発行日</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <CustomerSelector
              customerId={form.customer_id}
              billingName={form.billing_name}
              billingAddress={form.billing_address}
              billingHonorific={form.billing_honorific}
              onCustomerChange={(customer) => {
                setForm({
                  ...form,
                  customer_id: customer?.id || null,
                })
              }}
              onDirectInputChange={(data) => {
                setForm({
                  ...form,
                  billing_name: data.billingName,
                  billing_address: data.billingAddress || '',
                  billing_honorific: data.billingHonorific || '様',
                })
              }}
            />
          </CardContent>
        </Card>

        {/* 明細 */}
        <Card>
          <CardHeader>
            <CardTitle>明細</CardTitle>
            <CardDescription>
              請求する項目の詳細を編集してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>品目名</TableHead>
                  <TableHead className="w-[120px]">数量</TableHead>
                  <TableHead className="w-[150px]">単価</TableHead>
                  <TableHead className="w-[150px] text-right">金額</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Input
                        placeholder="商品・サービス名"
                        value={item.item_name}
                        onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                        maxLength={50}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={item.unit_price || ''}
                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={form.items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                disabled={form.items.length >= 10}
              >
                <Plus className="h-4 w-4 mr-2" />
                行を追加
              </Button>
              <div className="text-right">
                <p className="text-lg font-bold">
                  合計: {formatCurrency(calculateTotal())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* エラー表示 */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* アクションボタン */}
        <div className="flex justify-end gap-4">
          <Link href={`/invoices/${id}`}>
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isUpdating}
          >
            {isUpdating ? '更新中...' : '更新'}
          </Button>
        </div>
      </form>
    </div>
  )
}