'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, AlertCircle } from 'lucide-react'
import { CustomerSelector } from '@/components/invoices/customer-selector'
import { InvoiceItemsTable } from '@/components/invoices/invoice-items-table'
import { invoiceSchema, InvoiceFormData } from '@/lib/validations/invoice'
import { showToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormData>
  onSubmit: (data: InvoiceFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

export function InvoiceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = '保存'
}: InvoiceFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty }
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issue_date: today,
      billing_name: '',
      billing_address: '',
      billing_honorific: '様',
      customer_id: null,
      items: [
        { item_name: '', quantity: 1, unit: '個', unit_price: 0, amount: 0 }
      ],
      ...defaultValues
    },
    mode: 'onChange'
  })

  const watchedItems = watch('items')

  const handleFormSubmit = async (data: InvoiceFormData) => {
    try {
      await onSubmit(data)
      showToast.success('請求書を保存しました')
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存に失敗しました'
      showToast.error(message, '保存エラー')
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('未保存の変更があります。本当に戻りますか？')) {
        onCancel()
      }
    } else {
      onCancel()
    }
  }

  // フィールドエラー表示コンポーネント
  const FieldError = ({ name }: { name: string }) => {
    const error = errors[name as keyof typeof errors]
    if (!error) return null

    return (
      <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
        <AlertCircle className="h-3 w-3" />
        <span>{error.message}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
              <Label htmlFor="issue_date">
                発行日 <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="issue_date"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="issue_date"
                    type="date"
                    className={cn(
                      "max-w-xs",
                      errors.issue_date && "border-destructive focus:border-destructive"
                    )}
                    aria-invalid={!!errors.issue_date}
                    aria-describedby={errors.issue_date ? "issue_date_error" : undefined}
                  />
                )}
              />
              {errors.issue_date && (
                <FieldError name="issue_date" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="billing_name">
                請求先名 <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="billing_name"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <CustomerSelector
                      customerId={watch('customer_id')}
                      billingName={field.value}
                      billingAddress={watch('billing_address')}
                      billingHonorific={watch('billing_honorific')}
                      onCustomerChange={(customer) => {
                        setValue('customer_id', customer?.id || null, { shouldValidate: true })
                        setValue('billing_name', customer?.name || '', { shouldValidate: true })
                        setValue('billing_address', customer?.address || '', { shouldValidate: true })
                        setValue('billing_honorific', '様', { shouldValidate: true })
                      }}
                      onDirectInputChange={(data) => {
                        setValue('customer_id', null, { shouldValidate: true })
                        setValue('billing_name', data.billingName, { shouldValidate: true })
                        setValue('billing_address', data.billingAddress || '', { shouldValidate: true })
                        setValue('billing_honorific', data.billingHonorific || '様', { shouldValidate: true })
                      }}
                    />
                  </div>
                )}
              />
              {errors.billing_name && (
                <FieldError name="billing_name" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 明細 */}
      <Card>
        <CardHeader>
          <CardTitle>
            明細 <span className="text-destructive">*</span>
          </CardTitle>
          <CardDescription>
            請求する項目の詳細を入力してください（最大10件）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name="items"
            control={control}
            render={({ field }) => (
              <InvoiceItemsTable
                items={field.value}
                onItemsChange={(items) => {
                  field.onChange(items)
                }}
              />
            )}
          />
          {errors.items && (
            <div className="mt-4">
              <FieldError name="items" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isValid}
        >
          {isLoading ? '保存中...' : submitLabel}
        </Button>
      </div>

      {/* デバッグ情報（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-yellow-700">
            <div>Valid: {isValid ? 'Yes' : 'No'}</div>
            <div>Dirty: {isDirty ? 'Yes' : 'No'}</div>
            <div>Errors: {Object.keys(errors).length}</div>
            {Object.keys(errors).length > 0 && (
              <pre className="mt-2 p-2 bg-yellow-50 rounded text-xs overflow-auto">
                {JSON.stringify(errors, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </form>
  )
}