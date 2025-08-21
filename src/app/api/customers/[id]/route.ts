import { NextRequest, NextResponse } from 'next/server'
import { getCustomerById } from '@/lib/api/customers/get-customer'
import { updateCustomer, type UpdateCustomerInput, validateUpdateCustomerInput } from '@/lib/api/customers/update-customer'
import { deleteCustomer } from '@/lib/api/customers/delete-customer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: '顧客IDが指定されていません' },
        { status: 400 }
      )
    }

    const customer = await getCustomerById(id)

    if (!customer) {
      return NextResponse.json(
        { error: '指定された顧客が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: customer
    })
  } catch (error) {
    console.error('Get Customer API Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get customer' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // IDチェック
    if (!id) {
      return NextResponse.json(
        { error: '顧客IDが指定されていません' },
        { status: 400 }
      )
    }

    // 入力データの型チェック
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: '不正なリクエストデータです' },
        { status: 400 }
      )
    }

    // IDを入力データに追加
    const input: UpdateCustomerInput = { ...body, id }

    // バリデーション
    const validationErrors = validateUpdateCustomerInput(input)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: '入力データが正しくありません',
          validationErrors
        },
        { status: 400 }
      )
    }

    // 顧客更新
    const customer = await updateCustomer(input)

    return NextResponse.json({
      success: true,
      data: customer,
      message: '顧客を更新しました'
    }, { status: 200 })

  } catch (error) {
    console.error('Update Customer API Error:', error)
    
    // 顧客が見つからない場合のエラー処理
    if (error instanceof Error && error.message.includes('顧客が見つかりません')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update customer' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // IDチェック
    if (!id) {
      return NextResponse.json(
        { error: '顧客IDが指定されていません' },
        { status: 400 }
      )
    }

    // 顧客削除
    const result = await deleteCustomer(id)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        customerId: result.customerId,
        deletedAt: result.deletedAt
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Delete Customer API Error:', error)
    
    // 特定のエラーメッセージに応じてステータスコードを変更
    if (error instanceof Error) {
      if (error.message.includes('顧客が見つかりません')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      if (error.message.includes('既に削除されています') || error.message.includes('形式が正しくありません')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to delete customer' 
      },
      { status: 500 }
    )
  }
}