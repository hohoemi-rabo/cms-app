'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { InvoiceForm } from '@/components/invoices/invoice-form'
import { InvoiceFormData } from '@/lib/validations/invoice'

export default function InvoiceCreatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '請求書の作成に失敗しました')
      }

      const result = await response.json()

      // 作成成功時は詳細画面へ遷移
      router.push(`/invoices/${result.data.id}`)
    } catch (error) {
      throw error // InvoiceFormでハンドリングする
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/invoices')
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

      <InvoiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        submitLabel="請求書を作成"
      />
    </div>
  )
}