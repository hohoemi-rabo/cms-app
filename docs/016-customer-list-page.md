# 016 - 顧客一覧画面実装

## 概要
顧客データの一覧表示画面の実装

## 対象範囲
- 顧客一覧の表示
- ページネーション
- 検索・フィルタUI
- ソート機能
- アクションボタン

## 実装タスク

### TODO
- [ ] app/customers/page.tsxの作成
- [ ] 顧客一覧テーブルコンポーネント
  - [ ] components/customers/customer-table.tsx
  - [ ] テーブルヘッダー
  - [ ] データ行の表示
  - [ ] 空状態の表示
- [ ] ページネーションコンポーネント
  - [ ] components/ui/pagination.tsx
  - [ ] ページ番号表示
  - [ ] 前後ページ移動
- [ ] 検索バーコンポーネント
  - [ ] components/customers/search-bar.tsx
  - [ ] テキスト入力
  - [ ] 検索ボタン
  - [ ] クリアボタン
- [ ] フィルタコンポーネント
  - [ ] components/customers/filters.tsx
  - [ ] 顧客種別フィルタ
  - [ ] クラスフィルタ
  - [ ] タグフィルタ
- [ ] ソート機能
  - [ ] カラムヘッダークリック
  - [ ] 昇順/降順切り替え
- [ ] アクションボタン
  - [ ] 詳細表示
  - [ ] 編集
  - [ ] 削除

## 技術仕様
```typescript
// app/customers/page.tsx
export default async function CustomersPage({
  searchParams
}: {
  searchParams: { page?: string; search?: string; sort?: string }
}) {
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ''
  const sort = searchParams.sort || 'created_at'
  
  const { data, totalPages } = await getCustomers({
    page,
    search,
    sortBy: sort
  })
  
  return (
    <div>
      <SearchBar defaultValue={search} />
      <Filters />
      <CustomerTable customers={data} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
```

## 依存関係
- 008-customer-api-get-all.md が完了していること
- 010-customer-api-search.md が完了していること
- shadcn/uiコンポーネントが設定済み

## 動作確認項目
- [ ] 顧客一覧が表示される
- [ ] ページネーションが機能する
- [ ] 検索が正しく動作する
- [ ] フィルタが機能する
- [ ] ソートが正しく動作する
- [ ] 各アクションボタンが機能する
- [ ] レスポンシブ表示が適切

## 注意事項
- Server Componentとして実装
- URLパラメータでの状態管理
- ローディング状態の表示
- エラー状態の適切な処理