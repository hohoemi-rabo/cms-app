'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerForm } from '@/components/customers/customer-form'
import { CustomerFormData } from '@/lib/validations/customer'
import { createCustomerAction } from '@/app/customers/actions'
import { toast } from 'sonner'

interface CustomerFormWrapperProps {
  availableTags: { id: string; name: string }[]
  availableClasses: string[]
}

export function CustomerFormWrapper({ availableTags, availableClasses }: CustomerFormWrapperProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const handleSubmit = async (data: CustomerFormData) => {
    startTransition(async () => {
      const result = await createCustomerAction(data)
      
      if (result.success) {
        toast.success('顧客を登録しました')
        // クライアント側でリダイレクト
        router.push(`/customers/${result.customerId}`)
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  const handleCancel = () => {
    router.push('/customers')
  }
  
  return (
    <CustomerForm
      onSubmit={handleSubmit}
      submitLabel="登録"
      isPending={isPending}
      availableTags={availableTags}
      availableClasses={availableClasses}
    />
  )
}