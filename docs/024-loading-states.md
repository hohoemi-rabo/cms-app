# 024 - ローディング状態実装

## 概要
アプリケーション全体のローディング状態とスケルトンUIの実装

## 対象範囲
- ページローディング
- データフェッチング中の表示
- フォーム送信中の状態
- スケルトンUI

## 実装タスク

### TODO
- [ ] app/customers/loading.tsxの作成
- [ ] components/ui/skeleton.tsxの実装
- [ ] components/ui/spinner.tsxの作成
- [ ] テーブルスケルトン
  - [ ] components/customers/table-skeleton.tsx
- [ ] フォームローディング状態
  - [ ] ボタンの無効化
  - [ ] スピナー表示
- [ ] Suspense境界の設定
- [ ] ストリーミングSSRの活用

## 技術仕様
```typescript
// components/ui/skeleton.tsx
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
      {...props}
    />
  )
}

// components/customers/table-skeleton.tsx
export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      
      <div className="border rounded-lg">
        <div className="border-b p-3">
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-[100px]" />
            ))}
          </div>
        </div>
        
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b p-3 last:border-b-0">
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-[100px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// app/customers/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <Skeleton className="h-8 w-[200px] mb-6" />
      <TableSkeleton />
    </div>
  )
}

// components/ui/loading-button.tsx
interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
}

export function LoadingButton({ 
  loading, 
  children, 
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Spinner className="mr-2" />}
      {children}
    </Button>
  )
}
```

## 依存関係
- Suspenseコンポーネントの理解
- Next.js 15のストリーミング機能

## 動作確認項目
- [ ] ページ遷移時にローディングが表示される
- [ ] データ取得中にスケルトンが表示される
- [ ] フォーム送信中にボタンが無効化される
- [ ] スピナーが正しく表示される
- [ ] Suspenseフォールバックが機能する
- [ ] アニメーションがスムーズ

## 注意事項
- パフォーマンスへの影響を最小限に
- アクセシビリティ（aria-busy属性）
- 適切なローディング時間の設定
- 過度なローディング表示を避ける