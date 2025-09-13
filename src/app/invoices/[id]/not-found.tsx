import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileX, ArrowLeft } from 'lucide-react'

export default function InvoiceNotFound() {
  return (
    <div className="container mx-auto py-16 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <FileX className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">請求書が見つかりません</CardTitle>
          <CardDescription>
            指定された請求書は存在しないか、削除された可能性があります。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href="/invoices" className="w-full">
            <Button className="w-full" variant="default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              請求書一覧に戻る
            </Button>
          </Link>
          <Link href="/invoices/new" className="w-full">
            <Button className="w-full" variant="outline">
              新規請求書を作成
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}