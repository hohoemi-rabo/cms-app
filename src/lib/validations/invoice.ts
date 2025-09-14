import { z } from 'zod'

// 請求書明細のバリデーションスキーマ
export const invoiceItemSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  item_name: z.string()
    .min(1, '品目名は必須です')
    .max(100, '品目名は100文字以内で入力してください'),
  quantity: z.number()
    .min(0.01, '数量は0より大きい値を入力してください')
    .max(999999, '数量は999,999以下で入力してください'),
  unit: z.string()
    .min(1, '単位は必須です')
    .max(50, '単位は50文字以内で入力してください'),
  unit_price: z.number()
    .min(0, '単価は0以上で入力してください')
    .max(99999999, '単価は99,999,999以下で入力してください'),
  amount: z.number(),
  description: z.string()
    .max(500, '説明は500文字以内で入力してください')
    .optional()
})

// 請求書のバリデーションスキーマ
export const invoiceSchema = z.object({
  issue_date: z.string()
    .min(1, '発行日は必須です')
    .refine((date) => {
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, '正しい日付形式で入力してください'),
  billing_name: z.string()
    .min(1, '宛先名は必須です')
    .max(200, '宛先名は200文字以内で入力してください'),
  billing_address: z.string()
    .max(500, '住所は500文字以内で入力してください')
    .optional(),
  billing_honorific: z.string()
    .max(20, '敬称は20文字以内で入力してください')
    .optional()
    .default('様'),
  customer_id: z.string().uuid().nullable().optional(),
  items: z.array(invoiceItemSchema)
    .min(1, '明細は最低1つ必要です')
    .max(10, '明細は最大10件まで登録できます')
    .refine(
      (items) => items.some(item => item.item_name.trim().length > 0),
      '少なくとも1つの明細に品目名を入力してください'
    )
})

// TypeScriptの型定義
export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>

// エラーメッセージのカスタマイズ
export const customErrorMessages = {
  required_error: "この項目は必須です",
  invalid_type_error: "正しい形式で入力してください"
}

// バリデーションのユーティリティ関数
export const validateInvoiceData = (data: unknown) => {
  try {
    return invoiceSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }
    throw error
  }
}

// 部分バリデーション（フィールド単位）
export const validateField = (fieldName: string, value: unknown, schema: z.ZodSchema) => {
  try {
    schema.parse(value)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'エラーが発生しました'
    }
    return 'エラーが発生しました'
  }
}