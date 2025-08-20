# 009 - 顧客データとタグの結合取得API

## 概要
顧客データ取得時にタグ情報も含めて取得するAPI実装

## 対象範囲
- 顧客とタグの結合クエリ
- タグ情報の整形
- パフォーマンス最適化

## 実装タスク

### TODO
- [ ] 顧客とタグのJOINクエリ実装
- [ ] タグ情報の配列形式への整形
- [ ] 単一顧客取得時のタグ情報含有
- [ ] 一覧取得時のタグ情報含有
- [ ] N+1問題の回避策実装
- [ ] レスポンス型定義の更新

## 技術仕様
```typescript
// lib/api/customers/get-customers-with-tags.ts
interface CustomerWithTags extends Customer {
  tags: Tag[]
}

export async function getCustomersWithTags(): Promise<CustomerWithTags[]> {
  // 顧客データ取得
  // customer_tagsとtagsをJOIN
  // データ整形
}

// 効率的なクエリ例
const { data } = await supabase
  .from('customers')
  .select(`
    *,
    customer_tags (
      tags (*)
    )
  `)
  .is('deleted_at', null)
```

## 依存関係
- 008-customer-api-get-all.md が完了していること
- データベースにタグ関連テーブルが存在すること

## 動作確認項目
- [ ] 顧客データにタグ配列が含まれる
- [ ] タグがない顧客は空配列を返す
- [ ] 複数タグを持つ顧客が正しく表示される
- [ ] パフォーマンスが許容範囲内

## 注意事項
- 大量のタグがある場合のパフォーマンスを考慮
- タグ情報のキャッシュ戦略を検討
- フロントエンドでの表示方法を考慮した構造