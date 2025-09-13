import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, FileText, Database, Settings, Package } from 'lucide-react'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

async function getStats() {
  try {
    // 直接Supabaseから取得
    const { data: customersData } = await supabaseServer
      .from('customers')
      .select('id')
      .is('deleted_at', null)

    const { data: tagsData } = await supabaseServer
      .from('tags')
      .select('id')

    return {
      customers: customersData?.length || 0,
      tags: tagsData?.length || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { customers: 0, tags: 0 }
  }
}

export default async function HomePage() {
  const statsData = await getStats()
  
  const stats = [
    {
      title: '登録顧客数',
      value: statsData.customers.toString(),
      description: '現在の顧客数',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'タグ数',
      value: statsData.tags.toString(),
      description: '利用可能なタグ',
      icon: Database,
      color: 'text-green-600'
    }
  ]

  const quickActions = [
    {
      title: '顧客を追加',
      description: '新規顧客を登録します',
      href: '/customers/new',
      icon: UserPlus,
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-700'
    },
    {
      title: '顧客一覧',
      description: '登録済み顧客を確認します',
      href: '/customers',
      icon: Users,
      color: 'bg-green-50 hover:bg-green-100 text-green-700'
    },
    {
      title: '商品マスタ',
      description: '商品情報を管理します',
      href: '/products',
      icon: Package,
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-700'
    },
    {
      title: '自社情報設定',
      description: '請求書用の自社情報を設定',
      href: '/settings/company',
      icon: Settings,
      color: 'bg-gray-50 hover:bg-gray-100 text-gray-700'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">顧客管理システムへようこそ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">クイックアクション</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Card className={`${action.color} border-0 transition-colors cursor-pointer`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-base">{action.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {action.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>システム状態</CardTitle>
          <CardDescription>各コンポーネントの接続状態</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">データベース接続: 正常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Supabase: 接続済み</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span className="text-sm">認証: Phase 1 (開発モード)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}