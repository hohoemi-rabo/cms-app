import { NextRequest, NextResponse } from 'next/server'
import { createCustomer } from '@/lib/api/customers/create-customer'
import { parseCustomerCSVText, checkDuplicates } from '@/lib/utils/csv-import-server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }
    
    // ファイルタイプの確認
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'CSVファイルを選択してください' },
        { status: 400 }
      )
    }
    
    // FileをTextに変換してからパース
    const text = await file.text()
    
    // CSVのパース
    const { data, errors: parseErrors } = await parseCustomerCSVText(text)
    
    if (parseErrors.length > 0 && data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'CSVファイルの解析に失敗しました',
          errors: parseErrors,
          imported: 0,
          failed: parseErrors.length
        },
        { status: 400 }
      )
    }
    
    // 重複チェック
    const { duplicates, unique } = checkDuplicates(data)
    
    // インポート処理
    const results = {
      success: 0,
      failed: 0,
      errors: [...parseErrors],
      imported: [] as any[],
      skipped: duplicates.length
    }
    
    // 一括インポート（トランザクション処理は今回省略）
    for (let i = 0; i < unique.length; i++) {
      const customerData = unique[i]
      
      try {
        // タグの処理（カンマ区切りのテキストから配列に変換）
        // 注：現在はタグ名からタグIDへの変換は省略（タグ管理APIが必要）
        if (customerData.tags) {
          delete customerData.tags // 一旦タグは除外
        }
        
        // フィールド名はすでに正しくマッピングされている
        const createInput = customerData
        
        // 顧客作成
        const customer = await createCustomer(createInput)
        results.imported.push(customer)
        results.success++
        
      } catch (error) {
        results.failed++
        results.errors.push({
          row: i + 2, // ヘッダー行を考慮
          message: error instanceof Error ? error.message : '顧客の作成に失敗しました',
          data: customerData
        })
      }
    }
    
    // 結果のサマリー
    const summary = {
      total: data.length,
      success: results.success,
      failed: results.failed + parseErrors.length,
      skipped: results.skipped,
      errors: results.errors,
      message: `${results.success}件のデータをインポートしました`
    }
    
    if (results.failed > 0) {
      summary.message += `（${results.failed}件失敗）`
    }
    
    if (results.skipped > 0) {
      summary.message += `（${results.skipped}件の重複をスキップ）`
    }
    
    return NextResponse.json(summary, {
      status: results.success > 0 ? 200 : 400
    })
    
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error: 'インポート処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}