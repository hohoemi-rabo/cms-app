import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { CompanySettingsInput } from '@/types/company'

// 自社情報取得
export async function GET() {
  try {
    // 自社情報を取得（1件のみ）
    const { data, error } = await supabaseServer
      .from('company_settings')
      .select('*')
      .single()

    if (error) {
      // データが存在しない場合は初期データを作成
      if (error.code === 'PGRST116') {
        const { data: newData, error: createError } = await supabaseServer
          .from('company_settings')
          .insert({
            company_name: '会社名を入力してください',
            address: '住所を入力してください',
            phone: '電話番号を入力してください'
          })
          .select()
          .single()

        if (createError) {
          return NextResponse.json(
            { success: false, message: createError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true, data: newData })
      }

      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('自社情報取得エラー:', error)
    return NextResponse.json(
      { success: false, message: '自社情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 自社情報更新
export async function PUT(request: NextRequest) {
  try {
    const body: CompanySettingsInput = await request.json()

    // バリデーション
    if (!body.company_name || body.company_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: '会社名は必須です' },
        { status: 400 }
      )
    }

    if (body.company_name.length > 255) {
      return NextResponse.json(
        { success: false, message: '会社名は255文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (!body.address || body.address.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: '住所は必須です' },
        { status: 400 }
      )
    }

    if (!body.phone || body.phone.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: '電話番号は必須です' },
        { status: 400 }
      )
    }

    if (body.phone.length > 50) {
      return NextResponse.json(
        { success: false, message: '電話番号は50文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (body.postal_code && body.postal_code.length > 20) {
      return NextResponse.json(
        { success: false, message: '郵便番号は20文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (body.email && body.email.length > 255) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスは255文字以内で入力してください' },
        { status: 400 }
      )
    }

    // メールアドレスの形式チェック
    if (body.email && !isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスの形式が正しくありません' },
        { status: 400 }
      )
    }

    if (body.fax && body.fax.length > 50) {
      return NextResponse.json(
        { success: false, message: 'FAX番号は50文字以内で入力してください' },
        { status: 400 }
      )
    }

    // まず既存のデータを取得
    const { data: existing, error: fetchError } = await supabaseServer
      .from('company_settings')
      .select('id')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, message: fetchError.message },
        { status: 500 }
      )
    }

    // 更新データの準備
    const updateData = {
      company_name: body.company_name.trim(),
      postal_code: body.postal_code?.trim() || null,
      address: body.address.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || null,
      fax: body.fax?.trim() || null,
      bank_info: body.bank_info || null
    }

    let result

    if (existing) {
      // 既存データがある場合は更新
      const { data, error } = await supabaseServer
        .from('company_settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }
      result = data
    } else {
      // 既存データがない場合は新規作成
      const { data, error } = await supabaseServer
        .from('company_settings')
        .insert(updateData)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('自社情報更新エラー:', error)
    return NextResponse.json(
      { success: false, message: '自社情報の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// メールアドレスのバリデーション
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}