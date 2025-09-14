'use client'

import { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, HelpCircle, Info } from 'lucide-react'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  variant?: 'default' | 'destructive' | 'warning'
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmText = '実行',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      case 'warning':
        return <HelpCircle className="h-6 w-6 text-yellow-600" />
      default:
        return <Info className="h-6 w-6 text-blue-600" />
    }
  }

  const getButtonVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive' as const
      case 'warning':
        return 'default' as const
      default:
        return 'default' as const
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (!loading) {
            handleCancel()
          }
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-muted-foreground mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && (
          <div className="my-4">
            {children}
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? '実行中...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 便利なラッパー関数
export const useConfirmation = () => {
  const confirm = (
    title: string,
    options?: {
      description?: string
      confirmText?: string
      cancelText?: string
      variant?: 'default' | 'destructive' | 'warning'
    }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      // 実装は後でコンテキストプロバイダーで行う
      // 今はプレースホルダー
      resolve(window.confirm(title))
    })
  }

  return { confirm }
}