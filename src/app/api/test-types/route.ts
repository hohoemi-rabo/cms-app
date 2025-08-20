import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import type { Customer, Tag, CustomerInsert } from '@/types/supabase'

export async function GET() {
  try {
    // 型定義を使ったクエリのテスト
    const { data: customers, error: customersError } = await supabaseServer
      .from('customers')
      .select('*')
      .limit(1)
      .returns<Customer[]>()
    
    const { data: tags, error: tagsError } = await supabaseServer
      .from('tags')
      .select('*')
      .returns<Tag[]>()
    
    // 型チェックのテスト
    const testCustomer: CustomerInsert = {
      customer_type: 'personal',
      name: '型定義テスト',
      email: 'type-test@example.com'
    }
    
    return NextResponse.json({
      success: true,
      message: '型定義が正しく機能しています',
      tests: {
        customerType: {
          success: !!customers,
          hasType: customers ? typeof customers[0]?.name === 'string' : false
        },
        tagType: {
          success: !!tags,
          count: tags?.length || 0
        },
        typeInference: {
          customerInsertValid: true,
          testData: testCustomer
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '型定義のテスト中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}