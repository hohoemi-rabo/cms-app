import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/error-handler'

/**
 * タグの使用統計を取得
 * GET /api/tags/stats
 */
export async function GET() {
  try {
    // タグごとの使用回数を集計
    const { data: tagStats, error: statsError } = await supabaseServer
      .from('tags')
      .select(`
        id,
        name,
        created_at,
        customer_tags(count)
      `)
      .order('name')

    if (statsError) {
      const errorResponse = handleSupabaseError(statsError)
      throw new Error(errorResponse.message)
    }

    // 使用回数でソートしたデータも提供
    const statsWithUsage = (tagStats || []).map(tag => ({
      id: tag.id,
      name: tag.name,
      created_at: tag.created_at,
      usage_count: Array.isArray(tag.customer_tags) ? tag.customer_tags.length : 0
    }))

    // 使用頻度順にソート
    const sortedByUsage = [...statsWithUsage].sort((a, b) => b.usage_count - a.usage_count)

    // 統計情報
    const totalTags = statsWithUsage.length
    const totalUsage = statsWithUsage.reduce((sum, tag) => sum + tag.usage_count, 0)
    const averageUsage = totalTags > 0 ? totalUsage / totalTags : 0
    const unusedTags = statsWithUsage.filter(tag => tag.usage_count === 0).length

    return NextResponse.json({
      success: true,
      data: {
        tags: statsWithUsage,
        tags_by_usage: sortedByUsage,
        statistics: {
          total_tags: totalTags,
          total_usage: totalUsage,
          average_usage: Math.round(averageUsage * 100) / 100,
          unused_tags: unusedTags,
          most_used_tag: sortedByUsage[0] || null,
          least_used_tag: sortedByUsage[sortedByUsage.length - 1] || null
        }
      }
    })
  } catch (error) {
    console.error('Get Tag Stats API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get tag statistics' 
      },
      { status: 500 }
    )
  }
}