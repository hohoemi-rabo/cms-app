import { NextResponse } from 'next/server'
import { generateCSVTemplate } from '@/lib/utils/csv-import'

export async function GET() {
  try {
    const csvContent = generateCSVTemplate()
    
    // 現在の日時をファイル名に含める
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0]
    const fileName = `customer_import_template_${timestamp}.csv`
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Template generation error:', error)
    return NextResponse.json(
      { error: 'テンプレート生成に失敗しました' },
      { status: 500 }
    )
  }
}