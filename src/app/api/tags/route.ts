import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * タグ一覧を取得
 * GET /api/tags
 */
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('tags')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tags' 
      },
      { status: 500 }
    )
  }
}