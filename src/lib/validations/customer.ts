import { z } from 'zod'

export const customerSchema = z.object({
  customer_type: z.enum(['company', 'personal']),
  company_name: z.string().optional(),
  name: z.string().min(1, '氏名は必須です'),
  name_kana: z.string().optional(),
  class: z.string().optional(),
  birth_date: z.string().optional(),
  postal_code: z.string().regex(/^\d{3}-?\d{4}$/, '郵便番号の形式が正しくありません').optional().or(z.literal('')),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().regex(/^[\d-]+$/, '電話番号の形式が正しくありません').optional().or(z.literal('')),
  email: z.string().email('有効なメールアドレスを入力してください').optional().or(z.literal('')),
  contract_start_date: z.string().optional(),
  invoice_method: z.enum(['mail', 'email']).optional().nullable(),
  payment_terms: z.string().optional(),
  memo: z.string().optional(),
  tagIds: z.array(z.string()).optional()
}).refine(
  (data) => {
    if (data.customer_type === 'company' && !data.company_name) {
      return false
    }
    return true
  },
  {
    message: '法人の場合、会社名は必須です',
    path: ['company_name']
  }
)

export type CustomerFormData = z.infer<typeof customerSchema>