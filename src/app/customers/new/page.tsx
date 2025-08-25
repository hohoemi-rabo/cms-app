import { CustomerFormWrapper } from '@/components/customers/customer-form-wrapper'
import { Card } from '@/components/ui/card'
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
      return ['月-AM', '月-PM', '火-AM', '火-PM', '水-AM', '水-PM', '木-AM', '木-PM', '金-AM', '金-PM', '個別']
    }
    
    // 重複を除去
    const uniqueClasses = [...new Set(data?.map(item => item.class).filter(Boolean))]
    
    // デフォルトのクラスとマージ
    const defaultClasses = ['月-AM', '月-PM', '火-AM', '火-PM', '水-AM', '水-PM', '木-AM', '木-PM', '金-AM', '金-PM', '個別']
    const allClasses = [...new Set([...uniqueClasses, ...defaultClasses])]
    
    return allClasses.sort()
  } catch (error) {
    console.error('Failed to fetch classes:', error)
    return ['月-AM', '月-PM', '火-AM', '火-PM', '水-AM', '水-PM', '木-AM', '木-PM', '金-AM', '金-PM', '個別']
  }
}

export default async function NewCustomerPage() {
  const [tags, classes] = await Promise.all([getTags(), getClasses()])
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">顧客新規登録</h1>
        <p className="text-muted-foreground mt-2">
          新しい顧客情報を登録します
        </p>
      </div>

      <CustomerFormWrapper 
        availableTags={tags}
        availableClasses={classes}
      />
    </div>
  )
}