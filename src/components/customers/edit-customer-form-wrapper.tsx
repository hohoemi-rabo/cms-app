'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerForm } from '@/components/customers/customer-form'
import { CustomerFormData } from '@/lib/validations/customer'
import { updateCustomerAction } from '@/app/customers/actions'
import { CustomerWithTags } from '@/lib/api/customers/get-customer'
import { toast } from 'sonner'

interface EditCustomerFormWrapperProps {
  customer: CustomerWithTags
  availableTags: { id: string; name: string }[]
  availableClasses: string[]
}

export function EditCustomerFormWrapper({ 
  customer, 
  availableTags, 
  availableClasses 
}: EditCustomerFormWrapperProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  // 初期データを準備（DBの形式からフォーム形式に変換）
  const initialData: Partial<CustomerFormData> = {
    customer_type: customer.customer_type,
    company_name: customer.company_name || undefined,
    name: customer.name,
    name_kana: customer.name_kana || undefined,
    class: customer.class || undefined,
    birth_date: customer.birth_date || undefined,
    postal_code: customer.postal_code || undefined,
    prefecture: customer.prefecture || undefined,
    city: customer.city || undefined,
    address: customer.address || undefined,
    phone: customer.phone || undefined,
    email: customer.email || undefined,
    contract_start_date: customer.contract_start_date || undefined,
    invoice_method: customer.invoice_method || undefined,
    payment_terms: customer.payment_terms || undefined,
    memo: customer.memo || undefined,
    tagIds: customer.tags?.map(tag => tag.id) || []
  }
  
  const handleSubmit = async (data: CustomerFormData) => {
    startTransition(async () => {
      const result = await updateCustomerAction(customer.id, data)
      
      if (result.success) {
        toast.success('顧客情報を更新しました')
        // クライアント側でリダイレクト
        router.push(`/customers/${customer.id}`)
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }
  
  return (
    <CustomerForm
      initialData={initialData}
      onSubmit={handleSubmit}
      submitLabel="更新"
      isPending={isPending}
      availableTags={availableTags}
      availableClasses={availableClasses}
    />
  )
}