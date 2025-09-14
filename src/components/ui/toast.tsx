'use client'

import toast, { Toaster } from 'react-hot-toast'
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

// トーストの種類とスタイル
const toastStyles = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 text-green-900 border border-green-200',
    iconColor: 'text-green-500'
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 text-red-900 border border-red-200',
    iconColor: 'text-red-500'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-yellow-50 text-yellow-900 border border-yellow-200',
    iconColor: 'text-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 text-blue-900 border border-blue-200',
    iconColor: 'text-blue-500'
  }
}

// カスタムトーストコンポーネント
const CustomToast = ({
  type,
  message,
  title
}: {
  type: keyof typeof toastStyles
  message: string
  title?: string
}) => {
  const style = toastStyles[type]
  const Icon = style.icon

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg ${style.className}`}>
      <Icon className={`h-5 w-5 ${style.iconColor} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold text-sm mb-1">
            {title}
          </div>
        )}
        <div className="text-sm">
          {message}
        </div>
      </div>
    </div>
  )
}

// トースト関数
export const showToast = {
  success: (message: string, title?: string) => {
    toast.custom((t) => (
      <CustomToast
        type="success"
        message={message}
        title={title}
      />
    ), { duration: 4000 })
  },

  error: (message: string, title?: string) => {
    toast.custom((t) => (
      <CustomToast
        type="error"
        message={message}
        title={title}
      />
    ), { duration: 6000 })
  },

  warning: (message: string, title?: string) => {
    toast.custom((t) => (
      <CustomToast
        type="warning"
        message={message}
        title={title}
      />
    ), { duration: 5000 })
  },

  info: (message: string, title?: string) => {
    toast.custom((t) => (
      <CustomToast
        type="info"
        message={message}
        title={title}
      />
    ), { duration: 4000 })
  }
}

// Toasterコンポーネント（レイアウトに追加する）
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    />
  )
}