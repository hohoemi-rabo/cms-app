import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface TableSkeletonProps {
  rows?: number
  showHeader?: boolean
}

export function TableSkeleton({ rows = 10, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* ヘッダー部分のスケルトン */}
      {showHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>
      )}

      {/* 検索・フィルター部分のスケルトン */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* テーブル部分のスケルトン */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* ヘッダー行 */}
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4">
                    <Skeleton className="h-4 w-[80px]" />
                  </th>
                  <th className="text-left p-4 hidden md:table-cell">
                    <Skeleton className="h-4 w-[60px]" />
                  </th>
                  <th className="text-left p-4 hidden lg:table-cell">
                    <Skeleton className="h-4 w-[50px]" />
                  </th>
                  <th className="text-left p-4 hidden xl:table-cell">
                    <Skeleton className="h-4 w-[40px]" />
                  </th>
                  <th className="text-left p-4 hidden lg:table-cell">
                    <Skeleton className="h-4 w-[60px]" />
                  </th>
                  <th className="text-center p-4">
                    <Skeleton className="h-4 w-[40px] mx-auto" />
                  </th>
                </tr>
              </thead>
              {/* データ行 */}
              <tbody className="divide-y">
                {Array.from({ length: rows }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 mt-1" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-3 w-[100px]" />
                          <Skeleton className="h-3 w-[80px]" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <Skeleton className="h-5 w-[60px]" />
                    </td>
                    <td className="p-4 hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1">
                        <Skeleton className="h-5 w-[50px]" />
                        <Skeleton className="h-5 w-[40px]" />
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <Skeleton className="h-3 w-[80px]" />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ページネーション部分のスケルトン */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <Skeleton className="h-4 w-[150px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * フォーム用のスケルトン
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[200px] mb-2" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-4">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * カード一覧用のスケルトン
 */
export function CardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[80%]" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-[60px]" />
              <Skeleton className="h-8 w-[80px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}