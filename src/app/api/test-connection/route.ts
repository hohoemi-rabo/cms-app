import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    // Supabase接続テスト - 簡単なクエリを実行
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1)
    
    if (error) {
      // テーブルが存在しない場合も正常な接続とみなす
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          message: 'Successfully connected to Supabase. Tables not yet created.',
          details: {
            connected: true,
            tablesExist: false
          }
        })
      }
      
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to Supabase',
        error: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase',
      details: {
        connected: true,
        tablesExist: true
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}