# 014 - 顧客削除API実装（論理削除）

## 概要
顧客データの論理削除を行うAPIの実装

## 対象範囲
- 論理削除の実装
- 関連データの処理
- 削除の取り消し機能（将来対応）

## 実装タスク

### TODO
- [ ] lib/api/customers/delete-customer.tsの作成
- [ ] 論理削除の実装（deleted_atフラグ）
- [ ] 存在チェック
- [ ] 既に削除済みデータのチェック
- [ ] 関連タグデータの処理方針決定
- [ ] エラーハンドリング
- [ ] 削除確認の仕組み（フロントエンド連携）

## 技術仕様
```typescript
// lib/api/customers/delete-customer.ts
export async function deleteCustomer(id: string): Promise<boolean> {
  // 存在チェック
  const existing = await getCustomerById(id)
  if (!existing) {
    throw new Error('Customer not found')
  }
  
  // 論理削除
  const { error } = await supabase
    .from('customers')
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .is('deleted_at', null)
  
  if (error) throw error
  
  // タグの関連は保持（復元可能にするため）
  
  return true
}

// 将来実装：削除取り消し
export async function restoreCustomer(id: string): Promise<CustomerWithTags> {
  const { error } = await supabase
    .from('customers')
    .update({
      deleted_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
  
  if (error) throw error
  
  return getCustomerById(id)
}
```

## 依存関係
- 011-customer-api-get-by-id.md が完了していること

## 動作確認項目
- [ ] 論理削除が正しく機能する
- [ ] deleted_atに日時が設定される
- [ ] 削除済みデータが一覧に表示されない
- [ ] 削除済みデータへのアクセスが制限される
- [ ] タグの関連が保持される
- [ ] 二重削除でエラーになる

## 注意事項
- 物理削除は実装しない（データ保護の観点）
- 削除済みデータの定期クリーンアップ方針
- GDPR等の規制への対応（完全削除の必要性）
- 関連データのカスケード処理