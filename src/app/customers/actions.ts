'use server'

import { revalidatePath } from 'next/cache'
import { createCustomer } from '@/lib/api/customers/create-customer'
import { updateCustomer } from '@/lib/api/customers/update-customer'
import { CustomerFormData } from '@/lib/validations/customer'

export async function createCustomerAction(formData: CustomerFormData) {
  try {
    // APIデータ形式に変換（データベースのカラムに合わせる）
    const apiData: any = {
      customer_type: formData.customer_type,
      company_name: formData.company_name || null,
      name: formData.name,
      name_kana: formData.name_kana || null,
      class: formData.class || null,
      birth_date: formData.birth_date || null,
      postal_code: formData.postal_code || null,
      prefecture: formData.prefecture || null,
      city: formData.city || null,
      address: formData.address || null,
      phone: formData.phone || null,
      email: formData.email || null,
      contract_start_date: formData.contract_start_date || null,
      invoice_method: formData.invoice_method || null,
      payment_terms: formData.payment_terms || null,
      memo: formData.memo || null,
      tagIds: formData.tagIds || []
    }

    const customer = await createCustomer(apiData)
    
    // キャッシュをクリア
    revalidatePath('/customers')
    
    // 成功フラグと顧客IDを返す
    return {
      success: true,
      customerId: customer.id
    }
  } catch (error) {
    console.error('Failed to create customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '顧客の作成に失敗しました'
    }
  }
}

export async function updateCustomerAction(id: string, formData: CustomerFormData) {
  try {
    // APIデータ形式に変換（データベースのカラムに合わせる）
    const apiData: any = {
      id,
      customer_type: formData.customer_type,
      company_name: formData.company_name || null,
      name: formData.name,
      name_kana: formData.name_kana || null,
      class: formData.class || null,
      birth_date: formData.birth_date || null,
      postal_code: formData.postal_code || null,
      prefecture: formData.prefecture || null,
      city: formData.city || null,
      address: formData.address || null,
      phone: formData.phone || null,
      email: formData.email || null,
      contract_start_date: formData.contract_start_date || null,
      invoice_method: formData.invoice_method || null,
      payment_terms: formData.payment_terms || null,
      memo: formData.memo || null,
      tagIds: formData.tagIds || []
    }

    await updateCustomer(apiData)
    
    // キャッシュをクリア
    revalidatePath('/customers')
    revalidatePath(`/customers/${id}`)
    
    // 成功フラグを返す
    return {
      success: true
    }
  } catch (error) {
    console.error('Failed to update customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '顧客の更新に失敗しました'
    }
  }
}