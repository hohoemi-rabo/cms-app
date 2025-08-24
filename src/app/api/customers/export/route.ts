import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { generateCustomerCSV, generateCSVFileName, type ExportOptions } from '@/lib/utils/csv-export'
import { CustomerWithTags } from '@/lib/api/customers/get-customer'

/**
 * 全顧客データをタグ情報付きで取得する
 */
async function getAllCustomersWithTags(): Promise<CustomerWithTags[]> {
  try {
    // 1. 顧客の基本情報を取得
    const { data: customers, error: customerError } = await supabaseServer
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (customerError) {
      console.error('Error fetching customers:', customerError)
      throw new Error('顧客データの取得に失敗しました')
    }

    if (!customers || customers.length === 0) {
      return []
    }

    // 2. 各顧客のタグ情報を取得
    const customersWithTags: CustomerWithTags[] = await Promise.all(
      customers.map(async (customer) => {
        const { data: customerTags } = await supabaseServer
          .from('customer_tags')
          .select(`
            tags (
              id,
              name,
              created_at
            )
          `)
          .eq('customer_id', customer.id)

        // タグ情報を整形
        const tags = customerTags?.map((ct: any) => ct.tags).filter(Boolean) || []

        return {
          ...customer,
          tags
        }
      })
    )

    return customersWithTags
  } catch (error) {
    console.error('Error fetching customers with tags:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // エクスポートオプションを取得
    const options: ExportOptions = {
      encoding: (searchParams.get('encoding') as 'utf8' | 'sjis') || 'utf8',
      includeDeleted: searchParams.get('includeDeleted') === 'true',
      dateFormat: (searchParams.get('dateFormat') as 'iso' | 'japanese') || 'japanese'
    }

    // 顧客データを取得
    const customers = await getAllCustomersWithTags()

    if (customers.length === 0) {
      return NextResponse.json(
        { error: 'エクスポートする顧客データがありません' },
        { status: 404 }
      )
    }

    // CSV生成
    const csvContent = generateCustomerCSV(customers, options)
    const fileName = generateCSVFileName('customers')

    // レスポンスヘッダーを設定
    const headers = new Headers({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })

    return new Response(csvContent, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('CSV export error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'CSVエクスポートに失敗しました' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerIds, options = {} } = body

    if (!customerIds || !Array.isArray(customerIds)) {
      return NextResponse.json(
        { error: '顧客IDの配列が必要です' },
        { status: 400 }
      )
    }

    // 指定された顧客のみを取得
    const { data: customers, error: customerError } = await supabaseServer
      .from('customers')
      .select('*')
      .in('id', customerIds)

    if (customerError) {
      throw new Error('顧客データの取得に失敗しました')
    }

    // タグ情報を取得
    const customersWithTags: CustomerWithTags[] = await Promise.all(
      (customers || []).map(async (customer) => {
        const { data: customerTags } = await supabaseServer
          .from('customer_tags')
          .select(`
            tags (
              id,
              name,
              created_at
            )
          `)
          .eq('customer_id', customer.id)

        const tags = customerTags?.map((ct: any) => ct.tags).filter(Boolean) || []

        return {
          ...customer,
          tags
        }
      })
    )

    // CSV生成
    const csvContent = generateCustomerCSV(customersWithTags, options)
    const fileName = generateCSVFileName('selected_customers')

    const headers = new Headers({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })

    return new Response(csvContent, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('CSV export error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'CSVエクスポートに失敗しました' 
      },
      { status: 500 }
    )
  }
}