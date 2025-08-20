# 019 - 顧客新規登録画面実装

## 概要
新規顧客を登録する画面の実装

## 対象範囲
- 新規登録画面
- フォーム送信処理
- 成功/エラー処理
- 登録後のリダイレクト

## 実装タスク

### TODO
- [ ] app/customers/new/page.tsxの作成
- [ ] Server Action実装
  - [ ] app/customers/actions.ts
  - [ ] createCustomerAction
- [ ] フォームコンポーネントの統合
- [ ] 送信処理
  - [ ] ローディング状態
  - [ ] エラー処理
  - [ ] 成功時のリダイレクト
- [ ] トースト通知
- [ ] キャンセルボタン

## 技術仕様
```typescript
// app/customers/new/page.tsx
export default function NewCustomerPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">顧客新規登録</h1>
      <CustomerFormWrapper />
    </div>
  )
}

// app/customers/actions.ts
'use server'

export async function createCustomerAction(formData: CustomerFormData) {
  try {
    const customer = await createCustomer(formData)
    revalidatePath('/customers')
    redirect(`/customers/${customer.id}`)
  } catch (error) {
    return {
      error: 'Failed to create customer'
    }
  }
}

// components/customers/customer-form-wrapper.tsx
'use client'

export function CustomerFormWrapper() {
  const [isPending, startTransition] = useTransition()
  
  const handleSubmit = (data: CustomerFormData) => {
    startTransition(async () => {
      const result = await createCustomerAction(data)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }
  
  return (
    <CustomerForm
      onSubmit={handleSubmit}
      submitLabel="登録"
      isPending={isPending}
    />
  )
}
```

## 依存関係
- 012-customer-api-create.md が完了していること
- 018-customer-form-component.md が完了していること

## 動作確認項目
- [ ] フォームが正しく表示される
- [ ] バリデーションが機能する
- [ ] 登録処理が実行される
- [ ] 成功時に詳細画面へリダイレクトされる
- [ ] エラー時にメッセージが表示される
- [ ] ローディング中はボタンが無効化される
- [ ] キャンセルで一覧に戻る

## 注意事項
- Server Actionの使用
- revalidatePathでキャッシュクリア
- エラーの適切なハンドリング
- UXを考慮したローディング表示