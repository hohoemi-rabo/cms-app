'use client'

import { useState, useEffect } from 'react'
import { CustomerForm } from '@/components/customers/customer-form'
import { CustomerFormData } from '@/lib/validations/customer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomerFormTestPage() {
  const [result, setResult] = useState<string>('')
  const [tags, setTags] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // タグ一覧を取得
  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTags(data.data.map((tag: any) => ({
            id: tag.id,
            name: tag.name
          })))
        }
      })
      .catch(err => console.error('Failed to fetch tags:', err))
  }, [])

  const handleSubmit = async (data: CustomerFormData) => {
    setIsLoading(true)
    setResult('送信中...')
    
    try {
      // フォームデータをJSON形式で表示
      const formattedData = JSON.stringify(data, null, 2)
      setResult(`フォームデータ:\n${formattedData}`)
      
      // 実際のAPIコール（テスト）
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setResult(prev => prev + '\n\nAPI応答:\n' + JSON.stringify(result, null, 2))
      } else {
        setResult(prev => prev + '\n\nエラー:\n' + JSON.stringify(result, null, 2))
      }
    } catch (error) {
      setResult(prev => prev + '\n\nエラー:\n' + String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const sampleData: Partial<CustomerFormData> = {
    customer_type: 'company',
    company_name: 'テスト株式会社',
    name: '山田太郎',
    name_kana: 'ヤマダタロウ',
    class: '月-AM',
    postal_code: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    address: '千代田1-1-1',
    phone: '03-1234-5678',
    email: 'test@example.com',
    contract_start_date: '2024-01-01',
    invoice_method: 'email',
    payment_terms: '月末締め翌月末払い',
    memo: 'テスト用の顧客データです',
    tagIds: []
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">顧客フォームコンポーネントテスト</h1>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>テスト情報</CardTitle>
            <CardDescription>
              このページは顧客フォームコンポーネントのテスト用です
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• 顧客種別の切り替えで表示項目が変わります</p>
              <p>• バリデーションエラーを確認できます</p>
              <p>• 利用可能なタグ: {tags.length}個</p>
              <p>• フォーム送信時にデータがJSON形式で表示されます</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <CustomerForm
          initialData={sampleData}
          onSubmit={handleSubmit}
          submitLabel="テスト送信"
          isPending={isLoading}
          availableTags={tags}
        />
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>実行結果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs text-gray-900">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}