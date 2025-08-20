# 021 - CSVエクスポート機能実装

## 概要
顧客データをCSV形式でエクスポートする機能の実装

## 対象範囲
- CSVデータ生成
- ダウンロード処理
- 文字コード対応
- エクスポート範囲の選択

## 実装タスク

### TODO
- [ ] lib/utils/csv-export.tsの作成
- [ ] CSV生成処理
  - [ ] ヘッダー行の生成
  - [ ] データ行の生成
  - [ ] タグの文字列化
  - [ ] 日付フォーマット
- [ ] 文字コード対応
  - [ ] UTF-8 BOM付き
  - [ ] Shift-JIS対応（Excel用）
- [ ] エクスポートAPI
  - [ ] app/api/customers/export/route.ts
- [ ] UIコンポーネント
  - [ ] components/customers/export-button.tsx
  - [ ] エクスポート範囲選択
  - [ ] プログレス表示

## 技術仕様
```typescript
// lib/utils/csv-export.ts
interface ExportOptions {
  encoding?: 'utf8' | 'sjis'
  includeDeleted?: boolean
  columns?: string[]
}

export function generateCustomerCSV(
  customers: CustomerWithTags[],
  options: ExportOptions = {}
): string {
  const headers = [
    '顧客ID',
    '顧客種別',
    '会社名',
    '氏名',
    'フリガナ',
    'クラス',
    '生年月日',
    '郵便番号',
    '都道府県',
    '市区町村',
    '番地・建物名',
    '電話番号',
    'メールアドレス',
    '契約開始日',
    '請求書送付方法',
    '支払い条件',
    'タグ',
    '備考',
    '登録日',
    '更新日'
  ]
  
  const rows = customers.map(customer => [
    customer.id,
    customer.customer_type === 'company' ? '法人' : '個人',
    customer.company_name || '',
    customer.name,
    customer.name_kana || '',
    customer.class || '',
    formatDate(customer.birth_date),
    customer.postal_code || '',
    customer.prefecture || '',
    customer.city || '',
    customer.address || '',
    customer.phone || '',
    customer.email || '',
    formatDate(customer.contract_start_date),
    customer.invoice_method === 'mail' ? '郵送' : 'メール',
    customer.payment_terms || '',
    customer.tags.map(t => t.name).join(','),
    customer.memo || '',
    formatDate(customer.created_at),
    formatDate(customer.updated_at)
  ])
  
  // CSV生成
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  // BOM付きUTF-8
  return '\uFEFF' + csvContent
}

// app/api/customers/export/route.ts
export async function GET(request: Request) {
  const customers = await getCustomersWithTags()
  const csv = generateCustomerCSV(customers)
  
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="customers_${Date.now()}.csv"`
    }
  })
}
```

## 依存関係
- 009-customer-api-get-with-tags.md が完了していること

## 動作確認項目
- [ ] CSVファイルがダウンロードされる
- [ ] Excelで正しく開ける
- [ ] 日本語が文字化けしない
- [ ] タグが正しく出力される
- [ ] 空値が適切に処理される
- [ ] 大量データでも正常動作する

## 注意事項
- Excelでの文字化け対策
- 改行やカンマを含むデータのエスケープ
- ファイル名に日時を含める
- ブラウザ互換性の確認