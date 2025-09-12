import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  try {
    // 顧客数を取得（論理削除されていない顧客のみ）
    const { data: customersData, error: customersError } = await supabaseServer
      .from('customers')
      .select('id')
      .is('deleted_at', null)

    if (customersError) {
      console.error('Customers count error:', customersError)
      // エラーでも0を返す
      return NextResponse.json({
        customers: 0,
        tags: 0,
      })
    }

    // タグ数を取得
    const { data: tagsData, error: tagsError } = await supabaseServer
      .from('tags')
      .select('id')

    if (tagsError) {
      console.error('Tags count error:', tagsError)
      // エラーでも顧客数だけは返す
      return NextResponse.json({
        customers: customersData?.length || 0,
        tags: 0,
      })
    }

    return NextResponse.json({
      customers: customersData?.length || 0,
      tags: tagsData?.length || 0,
    })

  } catch (error) {
    console.error('Stats API Error:', error)
    // エラーが発生しても200 OKで0を返す
    return NextResponse.json({
      customers: 0,
      tags: 0,
    })
  }
}