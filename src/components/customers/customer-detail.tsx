'use client'

import { CustomerWithTags } from '@/lib/api/customers/types'

interface CustomerDetailProps {
  customer: CustomerWithTags
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  if (customer.customer_type === 'company') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">会社名</p>
            <p className="font-medium">{customer.company_name}</p>
          </div>
          {customer.name && (
            <div>
              <p className="text-sm text-muted-foreground">担当者名</p>
              <p className="font-medium">{customer.name}</p>
            </div>
          )}
        </div>
        
        {customer.name_kana && (
          <div>
            <p className="text-sm text-muted-foreground">担当者名（カナ）</p>
            <p className="font-medium">{customer.name_kana}</p>
          </div>
        )}
      </div>
    )
  }

  // 個人顧客の場合
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">氏名</p>
          <p className="font-medium">{customer.name}</p>
        </div>
        {customer.name_kana && (
          <div>
            <p className="text-sm text-muted-foreground">氏名（カナ）</p>
            <p className="font-medium">{customer.name_kana}</p>
          </div>
        )}
      </div>
      
      {customer.birth_date && (
        <div>
          <p className="text-sm text-muted-foreground">生年月日</p>
          <p className="font-medium">
            {new Date(customer.birth_date).toLocaleDateString('ja-JP')}
          </p>
        </div>
      )}
    </div>
  )
}