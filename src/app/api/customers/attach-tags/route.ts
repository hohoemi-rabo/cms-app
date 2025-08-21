import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * 顧客にタグを付与するAPI
 * POST /api/customers/attach-tags
 * body: { customerId: string, tagIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, tagIds } = body

    if (!customerId || !tagIds || !Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: 'customerId and tagIds are required' },
        { status: 400 }
      )
    }

    // 既存のタグ関連を削除
    const { error: deleteError } = await supabaseServer
      .from('customer_tags')
      .delete()
      .eq('customer_id', customerId)

    if (deleteError) {
      throw deleteError
    }

    // 新しいタグ関連を作成
    if (tagIds.length > 0) {
      const customerTags = tagIds.map(tagId => ({
        customer_id: customerId,
        tag_id: tagId
      }))

      const { error: insertError } = await supabaseServer
        .from('customer_tags')
        .insert(customerTags)

      if (insertError) {
        throw insertError
      }
    }

    return NextResponse.json({
      success: true,
      message: `${tagIds.length}個のタグを付与しました`
    })
  } catch (error) {
    console.error('API Error:', error)
    
    // より詳細なエラー情報を返す
    const errorMessage = error instanceof Error ? error.message : 'Failed to attach tags'
    const errorDetails = error && typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)
    
    console.error('Error details:', errorDetails)
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}