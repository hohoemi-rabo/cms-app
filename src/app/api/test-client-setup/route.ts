import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { handleDatabaseOperation } from '@/lib/supabase/error-handler'

export async function GET() {
  try {
    // Server Clientのテスト
    const serverTest = await handleDatabaseOperation(
      supabaseServer.from('tags').select('*').limit(2)
    )
    
    // エラーハンドリングのテスト（存在しないテーブル）
    const errorTest = await handleDatabaseOperation(
      supabaseServer.from('non_existent_table').select('*')
    )
    
    return NextResponse.json({
      success: true,
      message: 'Supabaseクライアント設定が完了しました',
      tests: {
        serverClient: {
          success: !!serverTest.data,
          dataCount: serverTest.data?.length || 0,
          error: serverTest.error?.message
        },
        errorHandling: {
          success: !!errorTest.error,
          errorMessage: errorTest.error?.message,
          errorCode: errorTest.error?.code
        }
      },
      summary: {
        serverClientReady: !!serverTest.data,
        errorHandlingReady: !!errorTest.error && errorTest.error.message === 'テーブルが存在しません'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'テスト中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}