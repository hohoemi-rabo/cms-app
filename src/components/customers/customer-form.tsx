'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerFormData } from '@/lib/validations/customer'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, User, Phone, Mail, Calendar, Tag, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>
  onSubmit: (data: CustomerFormData) => Promise<void>
  submitLabel?: string
  isPending?: boolean
  availableTags?: { id: string; name: string }[]
  availableClasses?: string[]
}

export function CustomerForm({
  initialData,
  onSubmit,
  submitLabel = '保存',
  isPending = false,
  availableTags = [],
  availableClasses = ['月-AM', '月-PM', '火-AM', '火-PM', '水-AM', '水-PM', '木-AM', '木-PM', '金-AM', '金-PM', '個別'] // Updated
}: CustomerFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tagIds || [])
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_type: 'personal',
      ...initialData,
      tagIds: selectedTags
    }
  })

  const customerType = watch('customer_type')

  useEffect(() => {
    setValue('tagIds', selectedTags)
  }, [selectedTags, setValue])

  const handleFormSubmit = async (data: CustomerFormData) => {
    await onSubmit({
      ...data,
      tagIds: selectedTags
    })
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 顧客種別 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {customerType === 'company' ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
            基本情報
          </CardTitle>
          <CardDescription>顧客の基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>顧客種別 *</Label>
            <RadioGroup
              defaultValue={initialData?.customer_type || 'personal'}
              onValueChange={(value) => setValue('customer_type', value as 'company' | 'personal')}
            >
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal">個人</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company">法人</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* 法人の場合のみ会社名表示 */}
          {customerType === 'company' && (
            <div>
              <Label htmlFor="company_name">会社名 *</Label>
              <Input
                id="company_name"
                {...register('company_name')}
                className={cn(errors.company_name && 'border-red-500')}
              />
              {errors.company_name && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.company_name.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                {customerType === 'company' ? '担当者名' : '氏名'} *
              </Label>
              <Input
                id="name"
                {...register('name')}
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="name_kana">
                {customerType === 'company' ? '担当者名（カナ）' : '氏名（カナ）'}
              </Label>
              <Input
                id="name_kana"
                {...register('name_kana')}
                placeholder="カタカナで入力"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class">クラス</Label>
              <Select
                onValueChange={(value) => setValue('class', value)}
                defaultValue={initialData?.class}
              >
                <SelectTrigger>
                  <SelectValue placeholder="クラスを選択" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {customerType === 'personal' && (
              <div>
                <Label htmlFor="birth_date">生年月日</Label>
                <Input
                  id="birth_date"
                  type="date"
                  {...register('birth_date')}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 連絡先情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            連絡先情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postal_code">郵便番号</Label>
              <Input
                id="postal_code"
                {...register('postal_code')}
                placeholder="123-4567"
                className={cn(errors.postal_code && 'border-red-500')}
              />
              {errors.postal_code && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.postal_code.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="prefecture">都道府県</Label>
              <Input
                id="prefecture"
                {...register('prefecture')}
                placeholder="東京都"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">市区町村</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="千代田区"
              />
            </div>

            <div>
              <Label htmlFor="address">番地・建物名</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="千代田1-1-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="090-1234-5678"
                className={cn(errors.phone && 'border-red-500')}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="example@email.com"
                className={cn(errors.email && 'border-red-500')}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 契約情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            契約情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract_start_date">契約開始日</Label>
              <Input
                id="contract_start_date"
                type="date"
                {...register('contract_start_date')}
              />
            </div>

            <div>
              <Label htmlFor="invoice_method">請求書送付方法</Label>
              <Select
                onValueChange={(value) => setValue('invoice_method', value as 'mail' | 'email')}
                defaultValue={initialData?.invoice_method || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="送付方法を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mail">郵送</SelectItem>
                  <SelectItem value="email">メール</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="payment_terms">支払い条件</Label>
            <Input
              id="payment_terms"
              {...register('payment_terms')}
              placeholder="例: 月末締め翌月末払い"
            />
          </div>
        </CardContent>
      </Card>

      {/* タグ */}
      {availableTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              タグ
            </CardTitle>
            <CardDescription>該当するタグを選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableTags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <Label
                    htmlFor={tag.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 備考 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            備考
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('memo')}
            placeholder="備考やメモを入力してください"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* 送信ボタン */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isPending}
        >
          キャンセル
        </Button>
        <LoadingButton 
          type="submit" 
          loading={isPending}
          loadingText="処理中..."
        >
          {submitLabel}
        </LoadingButton>
      </div>
    </form>
  )
}