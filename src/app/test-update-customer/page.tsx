'use client'

import { useState, useEffect } from 'react'
import type { UpdateCustomerInput, UpdateValidationError } from '@/lib/api/customers/update-customer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { UserCheck, Send, RotateCcw, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function TestUpdateCustomerPage() {
  const [customerId, setCustomerId] = useState('')
  const [existingCustomer, setExistingCustomer] = useState<any>(null)
  const [formData, setFormData] = useState<Omit<UpdateCustomerInput, 'id'>>({
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
  const [fetchingCustomer, setFetchingCustomer] = useState(false)
  const [updatedCustomer, setUpdatedCustomer] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<UpdateValidationError[]>([])
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

  // 顧客データ取得
  const fetchCustomer = async () => {
    if (!customerId.trim()) {
      toast.error('顧客IDを入力してください')
      return
    }

    setFetchingCustomer(true)
    
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      const data = await response.json()

      if (response.ok) {
        setExistingCustomer(data.data)
        // フォームに既存データを設定
        setFormData({
          customer_type: data.data.customer_type,
          name: data.data.name || '',
          name_kana: data.data.name_kana || '',
          company_name: data.data.company_name || '',
          class: data.data.class || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          postal_code: data.data.postal_code || '',
          prefecture: data.data.prefecture || '',
          city: data.data.city || '',
          address: data.data.address || '',
          memo: data.data.memo || '',
          tagIds: data.data.tags?.map((tag: any) => tag.id) || []
        })
        setUpdatedCustomer(null)
        setValidationErrors([])
        toast.success('顧客データを取得しました')
      } else {
        toast.error(data.error || '顧客の取得に失敗しました')
        setExistingCustomer(null)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('通信エラーが発生しました')
      setExistingCustomer(null)
    } finally {
      setFetchingCustomer(false)
    }
  }

  // 入力変更ハンドラ
  const handleInputChange = (field: keyof Omit<UpdateCustomerInput, 'id'>, value: string | null) => {
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
    
    if (!existingCustomer) {
      toast.error('先に顧客データを取得してください')
      return
    }

    setLoading(true)
    setValidationErrors([])
    
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setUpdatedCustomer(data.data)
        toast.success('顧客を更新しました')
      } else {
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors)
          toast.error('入力データに問題があります')
        } else {
          toast.error(data.error || '顧客の更新に失敗しました')
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
    if (existingCustomer) {
      setFormData({
        customer_type: existingCustomer.customer_type,
        name: existingCustomer.name || '',
        name_kana: existingCustomer.name_kana || '',
        company_name: existingCustomer.company_name || '',
        class: existingCustomer.class || '',
        email: existingCustomer.email || '',
        phone: existingCustomer.phone || '',
        postal_code: existingCustomer.postal_code || '',
        prefecture: existingCustomer.prefecture || '',
        city: existingCustomer.city || '',
        address: existingCustomer.address || '',
        memo: existingCustomer.memo || '',
        tagIds: existingCustomer.tags?.map((tag: any) => tag.id) || []
      })
    }
    setValidationErrors([])
    setUpdatedCustomer(null)
  }

  // エラー取得ヘルパー
  const getFieldError = (field: string) => {
    return validationErrors.find(err => err.field === field)?.message
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">顧客更新API テスト</h1>

      {/* 顧客ID入力・検索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            顧客検索
          </CardTitle>
          <CardDescription>更新する顧客のIDを入力して検索してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="顧客ID (UUID)"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={fetchCustomer} 
              disabled={fetchingCustomer}
            >
              {fetchingCustomer ? '検索中...' : '検索'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 既存顧客情報表示 */}
      {existingCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>現在の顧客情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>名前:</strong> {existingCustomer.name}</div>
              <div><strong>種別:</strong> {existingCustomer.customer_type === 'company' ? '法人' : '個人'}</div>
              {existingCustomer.company_name && (
                <div><strong>会社名:</strong> {existingCustomer.company_name}</div>
              )}
              <div><strong>メール:</strong> {existingCustomer.email || '未設定'}</div>
              <div><strong>電話:</strong> {existingCustomer.phone || '未設定'}</div>
              <div><strong>クラス:</strong> {existingCustomer.class || '未設定'}</div>
            </div>
            {existingCustomer.tags && existingCustomer.tags.length > 0 && (
              <div className="mt-4">
                <strong>現在のタグ:</strong>
                {existingCustomer.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="outline" className="ml-2">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 更新フォーム */}
      {existingCustomer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              顧客情報更新
            </CardTitle>
            <CardDescription>変更したい項目を編集してください（未変更項目はそのまま保持されます）</CardDescription>
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
                    onChange={(e) => handleInputChange('name_kana', e.target.value || null)}
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
                    onChange={(e) => handleInputChange('email', e.target.value || null)}
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
                    onChange={(e) => handleInputChange('phone', e.target.value || null)}
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
                    onChange={(e) => handleInputChange('class', e.target.value || null)}
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
                    onChange={(e) => handleInputChange('postal_code', e.target.value || null)}
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
                    onChange={(e) => handleInputChange('prefecture', e.target.value || null)}
                    placeholder="東京都"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">市区町村</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value || null)}
                    placeholder="渋谷区"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">住所</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value || null)}
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
                  onChange={(e) => handleInputChange('memo', e.target.value || null)}
                  placeholder="備考・メモ"
                  rows={3}
                />
              </div>

              {/* アクションボタン */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? '更新中...' : '顧客を更新'}
                </Button>
                <Button type="button" onClick={handleReset} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  リセット
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 更新結果 */}
      {updatedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>更新完了</CardTitle>
            <CardDescription>
              顧客情報が正常に更新されました
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">更新された顧客情報</h3>
                <p><strong>ID:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">{updatedCustomer.id}</code></p>
                <p><strong>名前:</strong> {updatedCustomer.name}</p>
                <p><strong>種別:</strong> <Badge variant={updatedCustomer.customer_type === 'company' ? 'default' : 'secondary'}>
                  {updatedCustomer.customer_type === 'company' ? '法人' : '個人'}
                </Badge></p>
                <p><strong>更新日時:</strong> {new Date(updatedCustomer.updated_at).toLocaleString('ja-JP')}</p>
                {updatedCustomer.tags && updatedCustomer.tags.length > 0 && (
                  <div>
                    <strong>タグ:</strong> {updatedCustomer.tags.map((tag: any) => (
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
                  {JSON.stringify(updatedCustomer, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}