'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, FileText } from 'lucide-react'
import { CustomerSelector } from '@/components/invoices/customer-selector'
import { InvoiceItemsTable, InvoiceItem } from '@/components/invoices/invoice-items-table'

interface InvoiceForm {
  issue_date: string
  billing_name: string
  billing_address?: string
  billing_honorific?: string
  customer_id?: string | null
  items: InvoiceItem[]
}

export default function InvoiceCreatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const today = new Date().toISOString().split('T')[0]
  
  const [form, setForm] = useState<InvoiceForm>({
    issue_date: today,
    billing_name: '',
    billing_address: '',
    billing_honorific: '様',
    customer_id: null,
    items: [
      { item_name: '', quantity: 1, unit: '個', unit_price: 0, amount: 0 },
    ]
  })

  // 明細更新ハンドラー
  const handleItemsChange = (newItems: InvoiceItem[]) => {
    setForm({ ...form, items: newItems })
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '請求書の作成に失敗しました')
      }

      const result = await response.json()
      
      // 作成成功時は詳細画面へ遷移
      router.push(`/invoices/${result.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="container mx-auto py-8 px-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">請求書作成</h1>
          <p className="text-muted-foreground mt-1">新しい請求書を作成します</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              基本情報
            </CardTitle>
            <CardDescription>
              請求書の基本情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="issue_date">発行日</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                  required
                  className="max-w-xs"
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
              請求する項目の詳細を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceItemsTable
              items={form.items}
              onItemsChange={handleItemsChange}
            />
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
          <Link href="/invoices">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  )
}