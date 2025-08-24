import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps extends React.ComponentProps<typeof Loader2> {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
}

export function Spinner({ 
  size = 'md', 
  className, 
  ...props 
}: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

// 中央に配置されたスピナー
export function CenteredSpinner({ 
  size = 'md',
  className,
  ...props 
}: SpinnerProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner size={size} className={className} {...props} />
    </div>
  )
}

// フルページスピナー
export function FullPageSpinner({ 
  size = 'lg',
  className,
  message,
  ...props 
}: SpinnerProps & { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={size} className={className} {...props} />
        {message && (
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}