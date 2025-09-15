import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeSearchQuery } from '@/lib/utils/search-utils'

export async function GET(request: NextRequest) {
  try {
    // 環境変数の確認
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({
        error: 'Configuration error'
      }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const searchParams = request.nextUrl.searchParams

    // 検索パラメータの取得
    const q = searchParams.get('q') || ''
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const amountMin = searchParams.get('amount_min')
    const amountMax = searchParams.get('amount_max')
    const customerIds = searchParams.getAll('customer_ids[]')
    const sortBy = searchParams.get('sort_by') || 'issue_date'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // ベースクエリの構築
    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (
          id,
          description,
          quantity,
          unit_price,
          amount
        )
      `, { count: 'exact' })

    // テキスト検索（請求書番号、請求先名、備考）
    // あいまい検索対応：正規化してスペースで分割
    if (q) {
      const normalizedQuery = normalizeSearchQuery(q)
      const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0)

      if (searchTerms.length === 1) {
        // 単一キーワードの場合：OR検索
        const term = searchTerms[0]
        // Supabaseのilike演算子用にエスケープ
        const escapedTerm = term.replace(/%/g, '\\%').replace(/_/g, '\\_')
        // notesフィールドは存在しないので、invoice_numberとbilling_nameのみで検索
        query = query.or(`invoice_number.ilike.%${escapedTerm}%,billing_name.ilike.%${escapedTerm}%,billing_address.ilike.%${escapedTerm}%`)
      } else {
        // 複数キーワードの場合：各キーワードをAND検索
        // 注：Supabaseの制限により、複数のAND条件は工夫が必要
        for (let i = 0; i < searchTerms.length; i++) {
          const term = searchTerms[i]
          const escapedTerm = term.replace(/%/g, '\\%').replace(/_/g, '\\_')

          if (i === 0) {
            query = query.or(`invoice_number.ilike.%${escapedTerm}%,billing_name.ilike.%${escapedTerm}%,billing_address.ilike.%${escapedTerm}%`)
          } else {
            // 追加のフィルター条件として適用（AND効果）
            query = query.filter('billing_name', 'ilike', `%${escapedTerm}%`)
          }
        }
      }
    }

    // 期間検索
    if (dateFrom) {
      query = query.gte('issue_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('issue_date', dateTo)
    }

    // 金額範囲検索
    if (amountMin) {
      query = query.gte('total_amount', parseFloat(amountMin))
    }
    if (amountMax) {
      query = query.lte('total_amount', parseFloat(amountMax))
    }

    // 顧客検索
    if (customerIds.length > 0) {
      query = query.in('customer_id', customerIds)
    }

    // ソート処理
    const orderColumn = sortBy === 'amount' ? 'total_amount' : sortBy
    query = query.order(orderColumn, { ascending: sortOrder === 'asc' })

    // ページネーション
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Invoice search error:', error)
      console.error('Query details:', { q, dateFrom, dateTo, amountMin, amountMax })
      return NextResponse.json({
        error: 'Failed to search invoices',
        details: error.message
      }, { status: 500 })
    }

    // 合計金額と件数の集計
    let statsQuery = supabase
      .from('invoices')
      .select('total_amount')

    // 同じフィルター条件を適用
    if (q) {
      const normalizedQuery = normalizeSearchQuery(q)
      const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0)

      if (searchTerms.length === 1) {
        const term = searchTerms[0]
        const escapedTerm = term.replace(/%/g, '\\%').replace(/_/g, '\\_')
        statsQuery = statsQuery.or(`invoice_number.ilike.%${escapedTerm}%,billing_name.ilike.%${escapedTerm}%,billing_address.ilike.%${escapedTerm}%`)
      } else {
        for (let i = 0; i < searchTerms.length; i++) {
          const term = searchTerms[i]
          const escapedTerm = term.replace(/%/g, '\\%').replace(/_/g, '\\_')

          if (i === 0) {
            statsQuery = statsQuery.or(`invoice_number.ilike.%${escapedTerm}%,billing_name.ilike.%${escapedTerm}%,billing_address.ilike.%${escapedTerm}%`)
          } else {
            statsQuery = statsQuery.filter('billing_name', 'ilike', `%${escapedTerm}%`)
          }
        }
      }
    }
    if (dateFrom) {
      statsQuery = statsQuery.gte('issue_date', dateFrom)
    }
    if (dateTo) {
      statsQuery = statsQuery.lte('issue_date', dateTo)
    }
    if (amountMin) {
      statsQuery = statsQuery.gte('total_amount', parseFloat(amountMin))
    }
    if (amountMax) {
      statsQuery = statsQuery.lte('total_amount', parseFloat(amountMax))
    }
    if (customerIds.length > 0) {
      statsQuery = statsQuery.in('customer_id', customerIds)
    }

    const { data: statsData } = await statsQuery
    const totalAmount = statsData?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

    return NextResponse.json({
      invoices: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: {
        totalCount: count || 0,
        totalAmount
      }
    })
  } catch (error) {
    console.error('Invoice search API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)

    return NextResponse.json({
      error: 'Internal server error',
      message: errorMessage
    }, { status: 500 })
  }
}