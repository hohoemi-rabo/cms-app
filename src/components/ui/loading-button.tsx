import { Button, ButtonProps } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export function LoadingButton({ 
  loading = false, 
  loadingText,
  ...props 
}: LoadingButtonProps) {
  const { children, disabled, ...buttonProps } = props
  return (
    <Button 
      disabled={loading || disabled}
      {...buttonProps}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}