# 008 - 顧客一覧取得API実装

## 概要
顧客データの一覧を取得するAPIレイヤーの実装

## 対象範囲
- 顧客一覧取得関数
- ページネーション対応
- 基本的なエラーハンドリング

## 実装タスク

### TODO
- [ ] lib/api/customers/get-customers.tsの作成
- [ ] 基本的な全件取得の実装
- [ ] ページネーション機能の追加
  - [ ] limit/offsetパラメータ
  - [ ] 総件数の取得
- [ ] ソート機能の実装
  - [ ] 氏名順
  - [ ] フリガナ順
  - [ ] 登録日順
  - [ ] 更新日順
- [ ] 論理削除されたデータの除外
- [ ] エラーハンドリング
- [ ] レスポンス型定義

## 技術仕様
```typescript
// lib/api/customers/get-customers.ts
interface GetCustomersParams {
  page?: number
  limit?: number
  sortBy?: 'name' | 'name_kana' | 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

interface GetCustomersResponse {
  data: Customer[]
  totalCount: number
  page: number
  totalPages: number
}

export async function getCustomers(params: GetCustomersParams): Promise<GetCustomersResponse> {
  // 実装
}
```

## 依存関係
- 004-supabase-client-setup.md が完了していること
- 005-database-types-generation.md が完了していること

## 動作確認項目
- [ ] 顧客データが正しく取得できる
- [ ] ページネーションが機能する
- [ ] ソートが正しく動作する
- [ ] 削除済みデータが含まれない
- [ ] エラー時に適切なエラーメッセージが返る

## 注意事項
- N+1問題を避けるため、関連データは必要に応じてJOINで取得
- パフォーマンスを考慮し、必要なフィールドのみ取得
- 大量データ対応のため、デフォルトのlimitを設定