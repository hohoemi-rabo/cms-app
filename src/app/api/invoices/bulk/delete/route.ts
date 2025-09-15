import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer

    const { invoice_ids } = await request.json()

    // バリデーション
    if (!invoice_ids || !Array.isArray(invoice_ids) || invoice_ids.length === 0) {
      return NextResponse.json({
        error: '削除する請求書を選択してください'
      }, { status: 400 })
    }

    // 最大100件の制限
    if (invoice_ids.length > 100) {
      return NextResponse.json({
        error: '一度に削除できるのは100件までです'
      }, { status: 400 })
    }

    // トランザクション的な論理削除処理
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[]
    }

    const now = new Date().toISOString()

    // バッチ処理で論理削除（10件ずつ）
    const batchSize = 10
    for (let i = 0; i < invoice_ids.length; i += batchSize) {
      const batch = invoice_ids.slice(i, i + batchSize)

      // UUIDの形式チェック
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      const invalidIds = batch.filter(id => !uuidRegex.test(id))

      if (invalidIds.length > 0) {
        invalidIds.forEach(id => {
          results.failed.push({ id, error: '無効な請求書IDです' })
        })
        continue
      }

      // 存在する請求書のみをチェック
      const { data: existingInvoices, error: fetchError } = await supabase
        .from('invoices')
        .select('id')
        .in('id', batch)
        .is('deleted_at', null)

      if (fetchError) {
        console.error('Failed to fetch invoices:', fetchError)
        batch.forEach(id => {
          results.failed.push({ id, error: '請求書の取得に失敗しました' })
        })
        continue
      }

      const existingIds = existingInvoices.map(inv => inv.id)
      const nonExistentIds = batch.filter(id => !existingIds.includes(id))

      // 存在しない請求書を失敗リストに追加
      nonExistentIds.forEach(id => {
        results.failed.push({ id, error: '請求書が見つかりません' })
      })

      if (existingIds.length === 0) continue

      // 明細の論理削除を試行（deleted_atカラムが存在する場合）
      let itemsDeleteSuccess = false

      // まず論理削除を試行
      const { error: itemsLogicalDeleteError } = await supabase
        .from('invoice_items')
        .update({
          deleted_at: now,
          updated_at: now
        })
        .in('invoice_id', existingIds)

      if (!itemsLogicalDeleteError) {
        itemsDeleteSuccess = true
      } else {
        // 論理削除に失敗した場合（deleted_atカラムが存在しない場合）、物理削除にフォールバック
        console.warn('明細の論理削除に失敗しました。物理削除にフォールバックします:', itemsLogicalDeleteError)

        const { error: itemsPhysicalDeleteError } = await supabase
          .from('invoice_items')
          .delete()
          .in('invoice_id', existingIds)

        if (!itemsPhysicalDeleteError) {
          itemsDeleteSuccess = true
        } else {
          console.error('明細の物理削除も失敗しました:', itemsPhysicalDeleteError)
        }
      }

      if (!itemsDeleteSuccess) {
        existingIds.forEach(id => {
          results.failed.push({ id, error: '明細の削除に失敗しました' })
        })
        continue
      }

      // 請求書本体を論理削除
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          deleted_at: now,
          updated_at: now
        })
        .in('id', existingIds)

      if (invoiceError) {
        console.error('Failed to delete invoices:', invoiceError)
        existingIds.forEach(id => {
          results.failed.push({ id, error: '請求書の削除に失敗しました' })
        })
      } else {
        results.success.push(...existingIds)
      }
    }

    // 結果のサマリー
    const totalDeleted = results.success.length
    const totalFailed = results.failed.length

    if (totalFailed > 0 && totalDeleted === 0) {
      return NextResponse.json({
        error: 'すべての請求書の削除に失敗しました',
        details: results
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${totalDeleted}件の請求書を削除しました${totalFailed > 0 ? `（${totalFailed}件失敗）` : ''}`,
      results
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}