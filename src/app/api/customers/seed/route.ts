import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// テストデータ生成用API（開発環境のみ）
export async function POST() {
  try {
    // サンプルデータ
    const sampleCustomers = [
      {
        customer_type: 'personal',
        name: '山田太郎',
        name_kana: 'ヤマダタロウ',
        class: '月-AM',
        email: 'yamada@example.com',
        phone: '090-1234-5678',
        postal_code: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '千代田1-1-1'
      },
      {
        customer_type: 'personal',
        name: '佐藤花子',
        name_kana: 'サトウハナコ',
        class: '火-PM',
        email: 'sato@example.com',
        phone: '090-2345-6789',
        postal_code: '150-0001',
        prefecture: '東京都',
        city: '渋谷区',
        address: '渋谷1-1-1'
      },
      {
        customer_type: 'company',
        company_name: '株式会社テスト',
        name: '鈴木一郎',
        name_kana: 'スズキイチロウ',
        class: '水-AM',
        email: 'suzuki@test-company.com',
        phone: '03-1234-5678',
        postal_code: '106-0032',
        prefecture: '東京都',
        city: '港区',
        address: '六本木1-1-1'
      },
      {
        customer_type: 'personal',
        name: '田中美咲',
        name_kana: 'タナカミサキ',
        class: '木-PM',
        email: 'tanaka@example.com',
        phone: '080-3456-7890',
        postal_code: '160-0022',
        prefecture: '東京都',
        city: '新宿区',
        address: '新宿3-3-3'
      },
      {
        customer_type: 'company',
        company_name: 'サンプル商事株式会社',
        name: '高橋健太',
        name_kana: 'タカハシケンタ',
        class: '金-AM',
        email: 'takahashi@sample-corp.com',
        phone: '03-9876-5432',
        postal_code: '100-0005',
        prefecture: '東京都',
        city: '千代田区',
        address: '丸の内2-2-2'
      }
    ]

    // データの挿入
    const { data, error } = await supabaseServer
      .from('customers')
      .insert(sampleCustomers)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `${data.length}件のテストデータを作成しました`,
      data
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to seed data' 
      },
      { status: 500 }
    )
  }
}