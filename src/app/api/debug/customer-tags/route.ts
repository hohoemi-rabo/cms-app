import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * デバッグ用: customer_tagsテーブルの状態を確認
 */
export async function GET() {
  try {
    // customer_tagsテーブルの内容を確認
    const { data: customerTags, error: customerTagsError } = await supabaseServer
      .from('customer_tags')
      .select('*')
      .limit(20)

    // customersテーブルの内容を確認
    const { data: customers, error: customersError } = await supabaseServer
      .from('customers')
      .select('id, name')
      .is('deleted_at', null)
      .limit(10)

    // tagsテーブルの内容を確認
    const { data: tags, error: tagsError } = await supabaseServer
      .from('tags')
      .select('*')

    return NextResponse.json({
      success: true,
      data: {
        customerTags: {
          data: customerTags,
          error: customerTagsError
        },
        customers: {
          data: customers,
          error: customersError
        },
        tags: {
          data: tags,
          error: tagsError
        }
      }
    })
  } catch (error) {
    console.error('Debug API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Debug failed' 
      },
      { status: 500 }
    )
  }
}