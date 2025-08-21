import { notFound } from 'next/navigation'
import { getCustomerById } from '@/lib/api/customers/get-customer'
import { EditCustomerFormWrapper } from '@/components/customers/edit-customer-form-wrapper'
import { supabaseServer } from '@/lib/supabase/server'

async function getTags() {
  try {
    const { data, error } = await supabaseServer
      .from('tags')
      .select('id, name')
      .order('name')
    
    if (error) {
      console.error('Failed to fetch tags:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    return []
  }
}

async function getClasses() {
  try {
    const { data, error } = await supabaseServer
      .from('customers')
      .select('class')
      .not('class', 'is', null)
      .order('class')
    
    if (error) {
      console.error('Failed to fetch classes:', error)
      return ['月-AM', '月-PM', '火-AM', '火-PM', '水-AM', '水-PM', '木-AM', '木-PM', '金-AM', '金-PM', '土-AM', '土-PM']
    }
    
    // 重複を除去
    const uniqueClasses = [...new Set(data?.map(item => item.class).filter(Boolean))]
    
    // デフォルトのクラスとマージ
    const defaultClasses = ['月-AM', '月-PM', '火-AM', '火-PM', '水-AM', '水-PM', '木-AM', '木-PM', '金-AM', '金-PM', '土-AM', '土-PM']
    const allClasses = [...new Set([...uniqueClasses, ...defaultClasses])]
    
    return allClasses.sort()
  } catch (error) {
    console.error('Failed to fetch classes:', error)
    return ['月-AM', '月-PM', '火-AM', '火-PM', '水-AM', '水-PM', '木-AM', '木-PM', '金-AM', '金-PM', '土-AM', '土-PM']
  }
}

export default async function EditCustomerPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // 顧客データ、タグ、クラスを並列で取得
  const [customer, tags, classes] = await Promise.all([
    getCustomerById(id),
    getTags(),
    getClasses()
  ])
  
  if (!customer) {
    notFound()
  }
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">顧客情報編集</h1>
        <p className="text-muted-foreground mt-2">
          既存の顧客情報を更新します
        </p>
      </div>

      <EditCustomerFormWrapper 
        customer={customer}
        availableTags={tags}
        availableClasses={classes}
      />
    </div>
  )
}