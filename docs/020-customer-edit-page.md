# 020 - 顧客編集画面実装

## 概要
既存顧客情報を編集する画面の実装

## 対象範囲
- 編集画面
- 既存データの読み込み
- 更新処理
- 変更確認機能

## 実装タスク

### TODO
- [ ] app/customers/[id]/edit/page.tsxの作成
- [ ] Server Action実装
  - [ ] updateCustomerAction
- [ ] 既存データの取得と表示
- [ ] フォームの初期値設定
- [ ] 更新処理
  - [ ] 変更検知
  - [ ] 差分更新
  - [ ] 成功/エラー処理
- [ ] キャンセル処理
- [ ] 変更破棄の確認

## 技術仕様
```typescript
// app/customers/[id]/edit/page.tsx
export default async function EditCustomerPage({
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
      <h1 className="text-2xl font-bold mb-6">顧客情報編集</h1>
      <EditCustomerFormWrapper customer={customer} />
    </div>
  )
}

// app/customers/actions.ts
export async function updateCustomerAction(
  id: string,
  formData: CustomerFormData
) {
  try {
    await updateCustomer({
      id,
      ...formData
    })
    revalidatePath('/customers')
    revalidatePath(`/customers/${id}`)
    redirect(`/customers/${id}`)
  } catch (error) {
    return {
      error: 'Failed to update customer'
    }
  }
}

// components/customers/edit-customer-form-wrapper.tsx
'use client'

export function EditCustomerFormWrapper({ customer }: { customer: CustomerWithTags }) {
  const [isPending, startTransition] = useTransition()
  const [isDirty, setIsDirty] = useState(false)
  
  const handleSubmit = (data: CustomerFormData) => {
    startTransition(async () => {
      const result = await updateCustomerAction(customer.id, data)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }
  
  return (
    <>
      <CustomerForm
        initialData={customer}
        onSubmit={handleSubmit}
        onChange={() => setIsDirty(true)}
        submitLabel="更新"
        isPending={isPending}
      />
      {isDirty && <UnsavedChangesDialog />}
    </>
  )
}
```

## 依存関係
- 013-customer-api-update.md が完了していること
- 018-customer-form-component.md が完了していること

## 動作確認項目
- [ ] 既存データが正しく表示される
- [ ] タグが正しく選択されている
- [ ] 更新処理が実行される
- [ ] 成功時に詳細画面へリダイレクトされる
- [ ] エラー時にメッセージが表示される
- [ ] 未保存の変更がある場合に警告が出る
- [ ] キャンセルで詳細画面に戻る

## 注意事項
- 楽観的更新の検討
- 同時編集の競合処理
- 変更箇所の強調表示
- フォームの差分検知