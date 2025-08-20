# 010 - 顧客検索API実装

## 概要
顧客データの検索機能を提供するAPIの実装

## 対象範囲
- テキスト検索（氏名、フリガナ、電話番号、メール）
- フィルタ機能（顧客種別、クラス、タグ）
- 複合検索条件の処理

## 実装タスク

### TODO
- [ ] lib/api/customers/search-customers.tsの作成
- [ ] テキスト検索の実装
  - [ ] 氏名での部分一致検索
  - [ ] フリガナでの部分一致検索
  - [ ] 電話番号での部分一致検索
  - [ ] メールアドレスでの部分一致検索
  - [ ] OR条件での複合検索
- [ ] フィルタ機能の実装
  - [ ] 顧客種別フィルタ
  - [ ] クラスフィルタ
  - [ ] タグフィルタ（複数選択可）
- [ ] 検索とフィルタの組み合わせ
- [ ] 検索結果のページネーション対応

## 技術仕様
```typescript
// lib/api/customers/search-customers.ts
interface SearchCustomersParams {
  searchText?: string
  customerType?: 'company' | 'personal'
  class?: string
  tagIds?: string[]
  page?: number
  limit?: number
}

export async function searchCustomers(params: SearchCustomersParams): Promise<GetCustomersResponse> {
  let query = supabase.from('customers').select('*', { count: 'exact' })
  
  // テキスト検索（OR条件）
  if (params.searchText) {
    query = query.or(`name.ilike.%${params.searchText}%,name_kana.ilike.%${params.searchText}%,phone.ilike.%${params.searchText}%,email.ilike.%${params.searchText}%`)
  }
  
  // フィルタ条件
  if (params.customerType) {
    query = query.eq('customer_type', params.customerType)
  }
  
  // タグフィルタ（サブクエリ必要）
  // ...
}
```

## 依存関係
- 009-customer-api-get-with-tags.md が完了していること

## 動作確認項目
- [ ] 各検索条件が正しく機能する
- [ ] 複数条件の組み合わせが正しく動作する
- [ ] 空の検索で全件が返る
- [ ] タグフィルタが正しく機能する
- [ ] ページネーションと組み合わせて動作する

## 注意事項
- SQLインジェクション対策を確実に実施
- 検索パフォーマンスの最適化（インデックス設定）
- 検索文字列のサニタイズ処理