import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  const supabase = supabaseServer
  
  try {
    // customer_tagsの件数を確認
    const { data: customerTags, error: ctError } = await supabase
      .from('customer_tags')
      .select('*')
      .limit(10)
    
    if (ctError) {
      console.error('customer_tags error:', ctError)
    }
    
    // タグ情報を持つ顧客を確認
    const { data: customersWithTags, error: cwError } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        customer_tags (
          tags (
            id,
            name
          )
        )
      `)
      .limit(5)
    
    if (cwError) {
      console.error('customers with tags error:', cwError)
    }
    
    return NextResponse.json({
      customerTagsCount: customerTags?.length || 0,
      customerTagsSample: customerTags?.slice(0, 3) || [],
      customersWithTags: customersWithTags || []
    })
    
  } catch (error) {
    console.error('Test tags error:', error)
    return NextResponse.json({ error: 'Failed to test tags' }, { status: 500 })
  }
}