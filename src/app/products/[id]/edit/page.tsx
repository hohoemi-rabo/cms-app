'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Product, ProductUpdateInput } from '@/types/product'

interface ProductEditPageProps {
  params: Promise<{ id: string }>
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductUpdateInput>({
    name: '',
    default_price: 0,
    unit: '',
    description: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ProductUpdateInput, string>>>({})

  // 商品データ取得
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${resolvedParams.id}`)
        const data = await response.json()

        if (data.success) {
          setProduct(data.data)
          setForm({
            name: data.data.name,
            default_price: data.data.default_price,
            unit: data.data.unit,
            description: data.data.description || ''
          })
        } else {
          toast.error('商品が見つかりません')
          router.push('/products')
        }
      } catch (error) {
        console.error('商品取得エラー:', error)
        toast.error('商品の取得に失敗しました')
        router.push('/products')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [resolvedParams.id, router])

  // バリデーション
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductUpdateInput, string>> = {}

    if (form.name !== undefined) {
      if (!form.name.trim()) {
        newErrors.name = '商品名は必須です'
      } else if (form.name.length > 100) {
        newErrors.name = '商品名は100文字以内で入力してください'
      }
    }

    if (form.default_price !== undefined && form.default_price < 0) {
      newErrors.default_price = '単価は0以上の数値を入力してください'
    }

    if (form.unit !== undefined) {
      if (!form.unit.trim()) {
        newErrors.unit = '単位は必須です'
      } else if (form.unit.length > 50) {
        newErrors.unit = '単位は50文字以内で入力してください'
      }
    }

    if (form.description !== undefined && form.description && form.description.length > 500) {
      newErrors.description = '説明文は500文字以内で入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/products/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        toast.success('商品を更新しました')
        router.push('/products')
      } else {
        const error = await response.json()
        toast.error(error.message || '更新に失敗しました')
      }
    } catch (error) {
      console.error('更新エラー:', error)
      toast.error('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">商品編集</h1>
          <p className="text-muted-foreground mt-1">
            商品・サービス情報の編集
          </p>
        </div>
      </div>

      {/* フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            商品情報
          </CardTitle>
          <CardDescription>
            商品・サービスの情報を編集してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 商品名 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                商品名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例: ウェブサイト制作"
                disabled={saving}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* 単価と単位 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default_price">
                  単価 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="default_price"
                  type="number"
                  value={form.default_price}
                  onChange={(e) => setForm({ ...form, default_price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="1"
                  disabled={saving}
                />
                {errors.default_price && (
                  <p className="text-sm text-destructive">{errors.default_price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">
                  単位 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="例: 個、時間、月"
                  disabled={saving}
                />
                {errors.unit && (
                  <p className="text-sm text-destructive">{errors.unit}</p>
                )}
              </div>
            </div>

            {/* 説明文 */}
            <div className="space-y-2">
              <Label htmlFor="description">説明文</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="商品・サービスの詳細説明（任意）"
                rows={4}
                disabled={saving}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {form.description?.length || 0} / 500文字
              </p>
            </div>

            {/* ボタン */}
            <div className="flex justify-end gap-4">
              <Link href="/products">
                <Button type="button" variant="outline" disabled={saving}>
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? '更新中...' : '更新'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}