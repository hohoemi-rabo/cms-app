# 013 - 顧客更新API実装

## 概要
既存顧客データを更新するAPIの実装

## 対象範囲
- 顧客データの部分更新
- タグの更新処理
- 楽観的ロック機能
- 更新履歴の記録準備

## 実装タスク

### TODO
- [ ] lib/api/customers/update-customer.tsの作成
- [ ] 部分更新の実装（PATCHセマンティクス）
- [ ] バリデーション処理
- [ ] タグの更新処理
  - [ ] 既存タグの削除
  - [ ] 新規タグの追加
  - [ ] 差分更新の最適化
- [ ] updated_atの自動更新
- [ ] 楽観的ロックの検討
- [ ] エラーハンドリング

## 技術仕様
```typescript
// lib/api/customers/update-customer.ts
interface UpdateCustomerInput {
  id: string
  customer_type?: 'company' | 'personal'
  company_name?: string
  name?: string
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

export async function updateCustomer(input: UpdateCustomerInput): Promise<CustomerWithTags> {
  const { id, tagIds, ...updateData } = input
  
  // 顧客データの更新
  const { error } = await supabase
    .from('customers')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .is('deleted_at', null)
  
  if (error) throw error
  
  // タグの更新（差分処理）
  if (tagIds !== undefined) {
    await updateCustomerTags(id, tagIds)
  }
  
  return getCustomerById(id)
}
```

## 依存関係
- 011-customer-api-get-by-id.md が完了していること
- 012-customer-api-create.md が完了していること

## 動作確認項目
- [ ] 部分更新が正しく機能する
- [ ] 未指定のフィールドが変更されない
- [ ] タグの追加/削除が正しく動作する
- [ ] updated_atが更新される
- [ ] 存在しないIDでエラーになる
- [ ] 削除済みデータが更新されない

## 注意事項
- 同時更新の競合処理
- NULL値の明示的な設定
- タグ更新のパフォーマンス最適化
- 更新前後の差分記録（監査ログ）