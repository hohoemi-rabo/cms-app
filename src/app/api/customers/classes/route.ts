import { NextResponse } from 'next/server'
import { getAvailableClasses } from '@/lib/api/customers/search-customers'

export async function GET() {
  try {
    const classes = await getAvailableClasses()

    return NextResponse.json({
      success: true,
      data: classes
    })
  } catch (error) {
    console.error('Classes API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get classes' 
      },
      { status: 500 }
    )
  }
}