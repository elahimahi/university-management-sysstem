import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

type AlertVariant = 'success' | 'warning' | 'error' | 'info'

interface AlertProps {
  variant: AlertVariant
  title?: string
  message: string
  onClose?: () => void
  closable?: boolean
}

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  onClose,
  closable = true,
}) => {
  const variants = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: <Info className="w-5 h-5" />,
    },
  }

  const style = variants[variant]

  return (
    <div
      className={`flex gap-3 p-4 rounded-md border ${style.bg} ${style.border} ${style.text}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>
      {closable && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
