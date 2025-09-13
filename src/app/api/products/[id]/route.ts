import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { ProductUpdateInput } from '@/types/product'

// UUID形式チェック
const isValidUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// 商品詳細取得
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, message: '無効なIDです' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: '商品が見つかりません' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('商品取得エラー:', error)
    return NextResponse.json(
      { success: false, message: '商品の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 商品更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: ProductUpdateInput = await request.json()

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, message: '無効なIDです' },
        { status: 400 }
      )
    }

    // バリデーション
    if (body.name !== undefined) {
      if (body.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: '商品名は必須です' },
          { status: 400 }
        )
      }
      if (body.name.length > 100) {
        return NextResponse.json(
          { success: false, message: '商品名は100文字以内で入力してください' },
          { status: 400 }
        )
      }
    }

    if (body.default_price !== undefined && body.default_price < 0) {
      return NextResponse.json(
        { success: false, message: '単価は0以上の数値を入力してください' },
        { status: 400 }
      )
    }

    if (body.unit !== undefined) {
      if (body.unit.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: '単位は必須です' },
          { status: 400 }
        )
      }
      if (body.unit.length > 50) {
        return NextResponse.json(
          { success: false, message: '単位は50文字以内で入力してください' },
          { status: 400 }
        )
      }
    }

    if (body.description !== undefined && body.description && body.description.length > 500) {
      return NextResponse.json(
        { success: false, message: '説明文は500文字以内で入力してください' },
        { status: 400 }
      )
    }

    // 更新データの準備
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.default_price !== undefined) updateData.default_price = body.default_price
    if (body.unit !== undefined) updateData.unit = body.unit.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || null

    const { data, error } = await supabaseServer
      .from('products')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: '商品が見つかりません' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('商品更新エラー:', error)
    return NextResponse.json(
      { success: false, message: '商品の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// 商品削除（論理削除）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, message: '無効なIDです' },
        { status: 400 }
      )
    }

    const { error } = await supabaseServer
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '商品を削除しました'
    })
  } catch (error) {
    console.error('商品削除エラー:', error)
    return NextResponse.json(
      { success: false, message: '商品の削除に失敗しました' },
      { status: 500 }
    )
  }
}