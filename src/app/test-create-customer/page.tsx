'use client'

import { useState, useEffect } from 'react'
import type { CreateCustomerInput, ValidationError } from '@/lib/api/customers/create-customer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Send, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

export default function TestCreateCustomerPage() {
  const [formData, setFormData] = useState<CreateCustomerInput>({
    customer_type: 'personal',
    name: '',
    name_kana: '',
    company_name: '',
    class: '',
    email: '',
    phone: '',
    postal_code: '',
    prefecture: '',
    city: '',
    address: '',
    memo: '',
    tagIds: []
  })

  const [loading, setLoading] = useState(false)
  const [createdCustomer, setCreatedCustomer] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [classes, setClasses] = useState<string[]>([])

  // タグとクラスのデータ取得
  useEffect(() => {
    const fetchData = async () => {
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

    fetchData()
  }, [])

  // 入力変更ハンドラ
  const handleInputChange = (field: keyof CreateCustomerInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // バリデーションエラーをクリア
    setValidationErrors(prev => prev.filter(err => err.field !== field))
  }

  // タグ選択ハンドラ
  const handleTagToggle = (tagId: string) => {
    setFormData(prev => {
      const currentTagIds = prev.tagIds || []
      const newTagIds = currentTagIds.includes(tagId)
        ? currentTagIds.filter(id => id !== tagId)
        : [...currentTagIds, tagId]
      
      return { ...prev, tagIds: newTagIds }
    })
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setValidationErrors([])
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setCreatedCustomer(data.data)
        toast.success('顧客を作成しました')
        // フォームをリセット
        setFormData({
          customer_type: 'personal',
          name: '',
          name_kana: '',
          company_name: '',
          class: '',
          email: '',
          phone: '',
          postal_code: '',
          prefecture: '',
          city: '',
          address: '',
          memo: '',
          tagIds: []
        })
      } else {
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors)
          toast.error('入力データに問題があります')
        } else {
          toast.error(data.error || '顧客の作成に失敗しました')
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // フォームリセット
  const handleReset = () => {
    setFormData({
      customer_type: 'personal',
      name: '',
      name_kana: '',
      company_name: '',
      class: '',
      email: '',
      phone: '',
      postal_code: '',
      prefecture: '',
      city: '',
      address: '',
      memo: '',
      tagIds: []
    })
    setValidationErrors([])
    setCreatedCustomer(null)
  }

  // エラー取得ヘルパー
  const getFieldError = (field: string) => {
    return validationErrors.find(err => err.field === field)?.message
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">顧客作成API テスト</h1>

      {/* 作成フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            新規顧客作成
          </CardTitle>
          <CardDescription>必要な情報を入力して新しい顧客を作成します</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 顧客種別 */}
            <div className="space-y-2">
              <Label htmlFor="customer_type">顧客種別 *</Label>
              <select
                id="customer_type"
                value={formData.customer_type}
                onChange={(e) => handleInputChange('customer_type', e.target.value as 'personal' | 'company')}
                className="w-full p-2 border rounded bg-background text-foreground dark:bg-gray-800 dark:border-gray-600"
                required
              >
                <option value="personal">個人</option>
                <option value="company">法人</option>
              </select>
              {getFieldError('customer_type') && (
                <p className="text-sm text-red-500">{getFieldError('customer_type')}</p>
              )}
            </div>

            {/* 会社名（法人の場合のみ） */}
            {formData.customer_type === 'company' && (
              <div className="space-y-2">
                <Label htmlFor="company_name">会社名 *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name || ''}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="株式会社○○"
                />
                {getFieldError('company_name') && (
                  <p className="text-sm text-red-500">{getFieldError('company_name')}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 名前 */}
              <div className="space-y-2">
                <Label htmlFor="name">名前 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="山田太郎"
                  required
                />
                {getFieldError('name') && (
                  <p className="text-sm text-red-500">{getFieldError('name')}</p>
                )}
              </div>

              {/* フリガナ */}
              <div className="space-y-2">
                <Label htmlFor="name_kana">フリガナ</Label>
                <Input
                  id="name_kana"
                  value={formData.name_kana || ''}
                  onChange={(e) => handleInputChange('name_kana', e.target.value)}
                  placeholder="ヤマダタロウ"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* メールアドレス */}
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@test.com"
                />
                {getFieldError('email') && (
                  <p className="text-sm text-red-500">{getFieldError('email')}</p>
                )}
              </div>

              {/* 電話番号 */}
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="090-1234-5678"
                />
                {getFieldError('phone') && (
                  <p className="text-sm text-red-500">{getFieldError('phone')}</p>
                )}
              </div>

              {/* クラス */}
              <div className="space-y-2">
                <Label htmlFor="class">クラス</Label>
                <select
                  id="class"
                  value={formData.class || ''}
                  onChange={(e) => handleInputChange('class', e.target.value)}
                  className="w-full p-2 border rounded bg-background text-foreground dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="">選択してください</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 住所情報 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">郵便番号</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="123-4567"
                />
                {getFieldError('postal_code') && (
                  <p className="text-sm text-red-500">{getFieldError('postal_code')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefecture">都道府県</Label>
                <Input
                  id="prefecture"
                  value={formData.prefecture || ''}
                  onChange={(e) => handleInputChange('prefecture', e.target.value)}
                  placeholder="東京都"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">市区町村</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="渋谷区"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">住所</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="渋谷1-1-1"
                />
              </div>
            </div>

            {/* タグ選択 */}
            <div className="space-y-2">
              <Label>タグ</Label>
              <div className="space-y-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                {tags.map(tag => (
                  <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.tagIds || []).includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* メモ */}
            <div className="space-y-2">
              <Label htmlFor="memo">メモ</Label>
              <Textarea
                id="memo"
                value={formData.memo || ''}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                placeholder="備考・メモ"
                rows={3}
              />
            </div>

            {/* アクションボタン */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                {loading ? '作成中...' : '顧客を作成'}
              </Button>
              <Button type="button" onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                リセット
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 作成結果 */}
      {createdCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>作成完了</CardTitle>
            <CardDescription>
              新しい顧客が正常に作成されました
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">作成された顧客情報</h3>
                <p><strong>ID:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">{createdCustomer.id}</code></p>
                <p><strong>名前:</strong> {createdCustomer.name}</p>
                <p><strong>種別:</strong> <Badge variant={createdCustomer.customer_type === 'company' ? 'default' : 'secondary'}>
                  {createdCustomer.customer_type === 'company' ? '法人' : '個人'}
                </Badge></p>
                {createdCustomer.tags && createdCustomer.tags.length > 0 && (
                  <div>
                    <strong>タグ:</strong> {createdCustomer.tags.map((tag: any) => (
                      <Badge key={tag.id} variant="outline" className="ml-1">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium">RAW データ</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(createdCustomer, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}