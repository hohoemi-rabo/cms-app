import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { ArrowLeft, Edit, FileText, Calendar, Building2 } from 'lucide-react'
import { getInvoiceById } from '@/lib/api/invoices/get-invoice'
import { DeleteInvoiceButton } from '@/components/invoices/delete-invoice-button'

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params
  
  // 請求書を取得
  const invoice = await getInvoiceById(id)
  
  if (!invoice) {
    notFound()
  }

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 金額フォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">請求書詳細</h1>
            <p className="text-muted-foreground mt-1">
              {invoice.invoice_number}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/invoices/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          </Link>
          <DeleteInvoiceButton 
            invoiceId={invoice.id} 
            invoiceNumber={invoice.invoice_number} 
          />
        </div>
      </div>

      <div className="grid gap-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              請求書情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">請求書番号</p>
                <p className="font-medium text-lg">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">発行日</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(invoice.issue_date)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">請求先</p>
              <p className="font-medium text-lg flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {invoice.billing_name}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 明細 */}
        <Card>
          <CardHeader>
            <CardTitle>明細</CardTitle>
            <CardDescription>
              請求書の明細項目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>品目</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">単価</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {invoice.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      明細がありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    合計
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {formatCurrency(invoice.total_amount)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        {/* 作成・更新日時 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>作成日時: {new Date(invoice.created_at).toLocaleString('ja-JP')}</span>
              <span>更新日時: {new Date(invoice.updated_at).toLocaleString('ja-JP')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}