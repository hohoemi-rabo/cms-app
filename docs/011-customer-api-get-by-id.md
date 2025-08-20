# 011 - 単一顧客取得API実装

## 概要
IDを指定して特定の顧客データを取得するAPIの実装

## 対象範囲
- 単一顧客データの取得
- タグ情報の含有
- 存在チェックとエラーハンドリング

## 実装タスク

### TODO
- [ ] lib/api/customers/get-customer.tsの作成
- [ ] ID指定での顧客データ取得
- [ ] タグ情報の結合取得
- [ ] 存在しないIDへの対処
- [ ] 論理削除されたデータへのアクセス制御
- [ ] エラーハンドリング
- [ ] レスポンス型定義

## 技術仕様
```typescript
// lib/api/customers/get-customer.ts
export async function getCustomerById(id: string): Promise<CustomerWithTags | null> {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      customer_tags (
        tags (*)
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null // データが見つからない
    }
    throw error
  }
  
  // タグ情報の整形
  return formatCustomerWithTags(data)
}
```

## 依存関係
- 009-customer-api-get-with-tags.md が完了していること

## 動作確認項目
- [ ] 存在するIDで正しくデータが取得できる
- [ ] 存在しないIDでnullが返る
- [ ] 削除済みデータが取得されない
- [ ] タグ情報が正しく含まれる
- [ ] エラー時に適切な処理がされる

## 注意事項
- UUIDの形式バリデーション
- 権限チェック（Phase 2で実装）
- キャッシュ戦略の検討