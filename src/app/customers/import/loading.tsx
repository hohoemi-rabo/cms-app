import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* ファイルアップロードエリア */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-[150px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[400px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Skeleton className="h-12 w-12 mx-auto mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px] mx-auto" />
              <Skeleton className="h-4 w-[150px] mx-auto" />
              <Skeleton className="h-3 w-[100px] mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}