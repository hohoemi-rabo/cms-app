import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/error-handler'

export async function GET() {
  try {
    // 顧客数を取得（論理削除されていない顧客のみ）
    const { data: customersData, error: customersError } = await supabaseServer
      .from('customers')
      .select('id')
      .is('deleted_at', null)

    if (customersError) {
      console.error('Customers count error:', customersError)
      throw new Error(`顧客数取得エラー: ${customersError.message}`)
    }

    // タグ数を取得
    const { data: tagsData, error: tagsError } = await supabaseServer
      .from('tags')
      .select('id')

    if (tagsError) {
      console.error('Tags count error:', tagsError)
      throw new Error(`タグ数取得エラー: ${tagsError.message}`)
    }

    return NextResponse.json({
      customers: customersData?.length || 0,
      tags: tagsData?.length || 0,
    })

  } catch (error) {
    console.error('Stats API Error:', error)
    return handleApiError(error)
  }
}