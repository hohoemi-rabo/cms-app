import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function CustomerNotFound() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>顧客が見つかりません</CardTitle>
          </div>
          <CardDescription>
            指定された顧客IDに該当する顧客情報が見つかりませんでした。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              考えられる原因:
            </p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
              <li>URLのIDが間違っている</li>
              <li>顧客が削除されている</li>
              <li>アクセス権限がない</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Link href="/customers">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                顧客一覧に戻る
              </Button>
            </Link>
            <Link href="/customers/new">
              <Button variant="outline">
                新規顧客作成
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}