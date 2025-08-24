import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-muted rounded-full">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">404 - ページが見つかりません</CardTitle>
          <CardDescription>
            お探しのページは存在しないか、移動した可能性があります。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <Link href="/customers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                顧客一覧へ
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              URLをご確認いただくか、メニューから目的のページへお進みください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}