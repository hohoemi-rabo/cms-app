import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function InvoiceDetailLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      <div className="grid gap-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* 明細 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* テーブルヘッダー */}
              <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12 ml-auto" />
                <Skeleton className="h-4 w-12 ml-auto" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
              {/* テーブル行 */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-5 gap-4 py-2">
                  <Skeleton className="h-5 w-4" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-8 ml-auto" />
                  <Skeleton className="h-5 w-20 ml-auto" />
                  <Skeleton className="h-5 w-24 ml-auto" />
                </div>
              ))}
              {/* 合計 */}
              <div className="grid grid-cols-5 gap-4 pt-2 border-t">
                <div className="col-span-4"></div>
                <Skeleton className="h-6 w-28 ml-auto" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 日時情報 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}