import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const tests = []
    
    // 1. SELECT テスト
    const { data: selectData, error: selectError } = await supabase
      .from('customers')
      .select('*')
      .limit(1)
    
    tests.push({
      operation: 'SELECT',
      success: !selectError,
      error: selectError?.message
    })
    
    // 2. INSERT テスト
    const testCustomer = {
      customer_type: 'personal',
      name: 'RLSテストユーザー',
      email: 'rls-test@example.com'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('customers')
      .insert(testCustomer)
      .select()
    
    tests.push({
      operation: 'INSERT',
      success: !insertError,
      error: insertError?.message
    })
    
    // 3. UPDATE テスト（挿入したデータがあれば）
    if (insertData && insertData[0]) {
      const { error: updateError } = await supabase
        .from('customers')
        .update({ name: 'RLSテスト更新' })
        .eq('id', insertData[0].id)
      
      tests.push({
        operation: 'UPDATE',
        success: !updateError,
        error: updateError?.message
      })
      
      // 4. DELETE テスト（テストデータをクリーンアップ）
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', insertData[0].id)
      
      tests.push({
        operation: 'DELETE',
        success: !deleteError,
        error: deleteError?.message
      })
    }
    
    // 5. タグテーブルのテスト
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('*')
    
    tests.push({
      operation: 'SELECT tags',
      success: !tagsError,
      error: tagsError?.message,
      count: tagsData?.length || 0
    })
    
    // 全体の成功判定
    const allSuccess = tests.every(test => test.success)
    
    return NextResponse.json({
      success: allSuccess,
      message: allSuccess 
        ? 'RLSポリシーが正しく設定されています' 
        : 'RLSポリシーに問題があります',
      tests
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'RLSテスト中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}