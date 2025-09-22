import { useState, useEffect } from 'react'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface ToastItemProps extends ToastProps {
  onRemove: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ id, type, title, message, duration = 5000, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onRemove])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-100'
      case 'error':
        return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30 text-red-100'
      case 'warning':
        return 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/30 text-orange-100'
      case 'info':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-100'
      default:
        return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-100'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div className={`${getToastStyles()} backdrop-blur-lg border rounded-xl p-4 shadow-2xl transform transition-all duration-300 hover:scale-105`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white mb-1">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-white/60 hover:text-white/80 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastProps[]
  onRemove: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (title: string, message: string) => {
    addToast({ type: 'success', title, message })
  }

  const error = (title: string, message: string) => {
    addToast({ type: 'error', title, message })
  }

  const warning = (title: string, message: string) => {
    addToast({ type: 'warning', title, message })
  }

  const info = (title: string, message: string) => {
    addToast({ type: 'info', title, message })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />
  }
}

export default ToastContainer
