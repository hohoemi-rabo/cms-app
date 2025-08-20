# 018 - 顧客フォームコンポーネント実装

## 概要
顧客の新規登録・編集で共通利用するフォームコンポーネントの実装

## 対象範囲
- フォームフィールドの実装
- バリデーション
- 顧客種別による表示切り替え
- タグ選択UI

## 実装タスク

### TODO
- [ ] components/customers/customer-form.tsxの作成
- [ ] フォームスキーマ定義（zod）
  - [ ] lib/validations/customer.ts
  - [ ] 必須項目の定義
  - [ ] 形式バリデーション
- [ ] 基本情報フィールド
  - [ ] 顧客種別ラジオボタン
  - [ ] 会社名（法人時のみ）
  - [ ] 氏名
  - [ ] フリガナ
  - [ ] クラス選択
  - [ ] 生年月日
- [ ] 連絡先フィールド
  - [ ] 郵便番号
  - [ ] 都道府県
  - [ ] 市区町村
  - [ ] 番地・建物名
  - [ ] 電話番号
  - [ ] メールアドレス
- [ ] 契約情報フィールド
  - [ ] 契約開始日
  - [ ] 請求書送付方法
  - [ ] 支払い条件
- [ ] タグ選択
  - [ ] チェックボックスリスト
  - [ ] 新規タグ追加機能
- [ ] 備考フィールド
- [ ] エラー表示
- [ ] 送信ボタン

## 技術仕様
```typescript
// lib/validations/customer.ts
import { z } from 'zod'

export const customerSchema = z.object({
  customer_type: z.enum(['company', 'personal']),
  company_name: z.string().optional(),
  name: z.string().min(1, '氏名は必須です'),
  name_kana: z.string().optional(),
  class: z.string().optional(),
  birth_date: z.string().optional(),
  postal_code: z.string().regex(/^\d{3}-?\d{4}$/).optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('有効なメールアドレスを入力してください').optional(),
  contract_start_date: z.string().optional(),
  invoice_method: z.enum(['mail', 'email']).optional(),
  payment_terms: z.string().optional(),
  memo: z.string().optional(),
  tagIds: z.array(z.string()).optional()
}).refine(
  (data) => {
    if (data.customer_type === 'company' && !data.company_name) {
      return false
    }
    return true
  },
  {
    message: '法人の場合、会社名は必須です',
    path: ['company_name']
  }
)

// components/customers/customer-form.tsx
interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>
  onSubmit: (data: CustomerFormData) => Promise<void>
  submitLabel?: string
}
```

## 依存関係
- react-hook-formとzodのインストール
- shadcn/uiのFormコンポーネント
- 015-tag-api-operations.md が完了していること

## 動作確認項目
- [ ] 全フィールドが正しく表示される
- [ ] 顧客種別切り替えで表示が変わる
- [ ] バリデーションが機能する
- [ ] エラーメッセージが表示される
- [ ] タグ選択が機能する
- [ ] フォーム送信が正しく動作する
- [ ] 初期値が正しく設定される（編集時）

## 注意事項
- アクセシビリティの考慮
- タブ順序の適切な設定
- 必須項目の明確な表示
- 入力補助（プレースホルダー、ヒント）