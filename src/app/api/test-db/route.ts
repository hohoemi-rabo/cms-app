import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  try {
    // 1件だけ取得してカラム構造を確認
    const { data, error } = await supabaseServer
      .from('customers')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error
      }, { status: 500 })
    }

    // カラム名を確認
    const columns = data && data.length > 0 ? Object.keys(data[0]) : []

    return NextResponse.json({
      success: true,
      columns,
      sample: data?.[0] || null,
      count: data?.length || 0
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}