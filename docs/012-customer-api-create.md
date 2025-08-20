# 012 - 顧客作成API実装

## 概要
新規顧客データを作成するAPIの実装

## 対象範囲
- 顧客データの新規作成
- バリデーション処理
- タグの関連付け
- トランザクション処理

## 実装タスク

### TODO
- [ ] lib/api/customers/create-customer.tsの作成
- [ ] 入力データのバリデーション
  - [ ] 必須項目チェック
  - [ ] データ型チェック
  - [ ] 形式チェック（メール、電話番号など）
- [ ] 顧客データの挿入処理
- [ ] タグの関連付け処理
- [ ] トランザクション処理の実装
- [ ] エラーハンドリング
- [ ] 作成後のデータ取得

## 技術仕様
```typescript
// lib/api/customers/create-customer.ts
interface CreateCustomerInput {
  customer_type: 'company' | 'personal'
  company_name?: string
  name: string
  name_kana?: string
  class?: string
  birth_date?: string
  postal_code?: string
  prefecture?: string
  city?: string
  address?: string
  phone?: string
  email?: string
  contract_start_date?: string
  invoice_method?: 'mail' | 'email'
  payment_terms?: string
  memo?: string
  tagIds?: string[]
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerWithTags> {
  // バリデーション
  validateCustomerInput(input)
  
  // トランザクション開始
  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  
  // タグの関連付け
  if (input.tagIds?.length) {
    await attachTagsToCustomer(customer.id, input.tagIds)
  }
  
  return getCustomerById(customer.id)
}
```

## 依存関係
- 011-customer-api-get-by-id.md が完了していること
- バリデーションライブラリの選定（zodなど）

## 動作確認項目
- [ ] 正常なデータで顧客が作成される
- [ ] 必須項目が不足している場合エラーになる
- [ ] 不正なデータ形式でエラーになる
- [ ] タグが正しく関連付けられる
- [ ] トランザクションが正しく機能する
- [ ] 作成後のデータが正しく返される

## 注意事項
- 重複チェックの必要性を検討
- メールアドレスの一意性制約
- 電話番号の形式統一
- エラーメッセージのローカライズ