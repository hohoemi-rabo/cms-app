# 022 - CSVインポート機能実装

## 概要
CSVファイルから顧客データを一括インポートする機能の実装

## 対象範囲
- CSVファイルアップロード
- データパース処理
- バリデーション
- 一括登録処理
- エラーレポート

## 実装タスク

### TODO
- [ ] lib/utils/csv-import.tsの作成
- [ ] CSVパース処理
  - [ ] ヘッダー検証
  - [ ] データ型変換
  - [ ] 文字コード判定
- [ ] バリデーション処理
  - [ ] 必須項目チェック
  - [ ] データ形式チェック
  - [ ] 重複チェック
- [ ] インポート画面
  - [ ] app/customers/import/page.tsx
  - [ ] ファイルアップロードUI
  - [ ] プレビュー表示
  - [ ] エラー表示
- [ ] 一括登録処理
  - [ ] トランザクション処理
  - [ ] 進捗表示
  - [ ] 部分成功の処理
- [ ] テンプレートダウンロード

## 技術仕様
```typescript
// lib/utils/csv-import.ts
interface ImportResult {
  success: number
  failed: number
  errors: ImportError[]
}

interface ImportError {
  row: number
  field: string
  message: string
  data: any
}

export async function parseCustomerCSV(
  file: File
): Promise<{ data: any[], errors: ImportError[] }> {
  const text = await file.text()
  const lines = text.split('\n')
  const headers = parseCSVLine(lines[0])
  
  // ヘッダー検証
  const requiredHeaders = ['氏名', '顧客種別']
  const missingHeaders = requiredHeaders.filter(
    h => !headers.includes(h)
  )
  
  if (missingHeaders.length > 0) {
    throw new Error(`必須列が不足: ${missingHeaders.join(', ')}`)
  }
  
  // データパース
  const data = []
  const errors = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row = mapToCustomerData(headers, values)
    
    // バリデーション
    const validation = validateCustomerData(row)
    if (validation.errors.length > 0) {
      errors.push(...validation.errors.map(e => ({
        row: i + 1,
        ...e
      })))
    } else {
      data.push(row)
    }
  }
  
  return { data, errors }
}

// app/customers/import/page.tsx
'use client'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<ImportError[]>([])
  const [importing, setImporting] = useState(false)
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const { data, errors } = await parseCustomerCSV(file)
    setPreview(data.slice(0, 5))
    setErrors(errors)
    setFile(file)
  }
  
  const handleImport = async () => {
    if (!file || errors.length > 0) return
    
    setImporting(true)
    const result = await importCustomers(preview)
    // 結果表示
    setImporting(false)
  }
  
  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      {preview.length > 0 && <PreviewTable data={preview} />}
      {errors.length > 0 && <ErrorList errors={errors} />}
      <Button onClick={handleImport} disabled={importing || errors.length > 0}>
        インポート
      </Button>
    </div>
  )
}
```

## 依存関係
- 012-customer-api-create.md が完了していること
- CSVパースライブラリの選定（papaparse等）

## 動作確認項目
- [ ] CSVファイルがアップロードできる
- [ ] プレビューが表示される
- [ ] バリデーションエラーが表示される
- [ ] インポートが実行される
- [ ] 進捗が表示される
- [ ] エラーレポートが表示される
- [ ] テンプレートがダウンロードできる

## 注意事項
- 大量データ処理のパフォーマンス
- メモリ使用量の考慮
- 文字コードの自動判定
- 部分的な成功の処理方法
- 重複データの処理方針