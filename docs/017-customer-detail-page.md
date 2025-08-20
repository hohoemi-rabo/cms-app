# 017 - 顧客詳細画面実装

## 概要
個別の顧客情報を表示する詳細画面の実装

## 対象範囲
- 顧客情報の全項目表示
- タグの表示
- アクションボタン（編集、削除）
- 戻るナビゲーション

## 実装タスク

### TODO
- [ ] app/customers/[id]/page.tsxの作成
- [ ] 顧客詳細表示コンポーネント
  - [ ] components/customers/customer-detail.tsx
  - [ ] 基本情報セクション
  - [ ] 連絡先情報セクション
  - [ ] 契約情報セクション
  - [ ] タグ表示
  - [ ] 備考表示
- [ ] アクションボタン
  - [ ] 編集ボタン
  - [ ] 削除ボタン（確認ダイアログ付き）
  - [ ] 一覧に戻るボタン
- [ ] 削除確認ダイアログ
  - [ ] components/customers/delete-dialog.tsx
- [ ] エラーハンドリング
  - [ ] 404ページ
  - [ ] エラー表示

## 技術仕様
```typescript
// app/customers/[id]/page.tsx
export default async function CustomerDetailPage({
  params
}: {
  params: { id: string }
}) {
  const customer = await getCustomerById(params.id)
  
  if (!customer) {
    notFound()
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">顧客詳細</h1>
        <div className="space-x-2">
          <Link href={`/customers/${params.id}/edit`}>
            <Button>編集</Button>
          </Link>
          <DeleteButton customerId={params.id} />
        </div>
      </div>
      
      <CustomerDetail customer={customer} />
      
      <Link href="/customers">
        <Button variant="outline">一覧に戻る</Button>
      </Link>
    </div>
  )
}
```

## 依存関係
- 011-customer-api-get-by-id.md が完了していること
- 014-customer-api-delete.md が完了していること

## 動作確認項目
- [ ] 顧客情報が正しく表示される
- [ ] タグが表示される
- [ ] 編集ボタンが機能する
- [ ] 削除確認ダイアログが表示される
- [ ] 削除が正しく実行される
- [ ] 存在しないIDで404が表示される
- [ ] 一覧への戻りが機能する

## 注意事項
- 法人/個人で表示項目を切り替え
- 長いテキストの表示処理
- 削除は論理削除であることの明示
- モバイル表示での見やすさ