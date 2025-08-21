import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Phone, Mail, Building2, User, Calendar, Tag, MapPin, FileText } from 'lucide-react'
import { CustomerDetail } from '@/components/customers/customer-detail'
import { DeleteCustomerDialog } from '@/components/customers/delete-customer-dialog'
import { getCustomerById } from '@/lib/api/customers/get-customer'

export default async function CustomerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  let customer
  try {
    customer = await getCustomerById(id)
  } catch (error) {
    console.error('Failed to fetch customer:', error)
    notFound()
  }

  if (!customer) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">顧客詳細</h1>
            <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/customers/${id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          </Link>
          <DeleteCustomerDialog 
            customerId={customer.id}
            customerName={customer.customer_type === 'company' ? customer.company_name! : customer.name}
          />
        </div>
      </div>

      {/* 基本情報 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {customer.customer_type === 'company' ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
            基本情報
          </CardTitle>
          <CardDescription>
            <Badge variant={customer.customer_type === 'company' ? 'default' : 'secondary'}>
              {customer.customer_type === 'company' ? '法人' : '個人'}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerDetail customer={customer} />
        </CardContent>
      </Card>

      {/* 連絡先情報 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>連絡先情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customer.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          )}
          {(customer.postal_code || customer.address) && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                {customer.postal_code && <p>〒{customer.postal_code}</p>}
                {customer.address && <p>{customer.address}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 契約情報 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>契約情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">クラス</p>
              <Badge variant="outline" className="mt-1">
                {customer.class || '未設定'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">契約開始日</p>
              <span className="text-sm">
                {customer.contract_start_date 
                  ? new Date(customer.contract_start_date).toLocaleDateString('ja-JP')
                  : '未設定'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タグ */}
      {customer.tags && customer.tags.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              タグ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {customer.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 備考 */}
      {customer.memo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              備考
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{customer.memo}</p>
          </CardContent>
        </Card>
      )}

      {/* 作成日時・更新日時 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            日時情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">作成日時: </span>
            <span>{new Date(customer.created_at).toLocaleString('ja-JP')}</span>
          </div>
          {customer.updated_at && (
            <div>
              <span className="text-sm text-muted-foreground">更新日時: </span>
              <span>{new Date(customer.updated_at).toLocaleString('ja-JP')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* フッター */}
      <div className="flex justify-center">
        <Link href="/customers">
          <Button variant="outline" size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            顧客一覧に戻る
          </Button>
        </Link>
      </div>
    </div>
  )
}