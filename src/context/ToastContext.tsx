
import React, { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface ToastOptions {
  message?: string
  title?: string
  type?: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: ToastItem[]
  showToast: (messageOrOptions: string | ToastOptions, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (
      messageOrOptions: string | ToastOptions,
      type: ToastType = 'info',
      duration: number = 3500
    ) => {
      const isObj = typeof messageOrOptions === 'object' && messageOrOptions !== null
      const finalMessage = isObj
        ? messageOrOptions.title
          ? `${messageOrOptions.title}: ${messageOrOptions.message || ''}`
          : messageOrOptions.message || ''
        : messageOrOptions
      const finalType = isObj && messageOrOptions.type ? messageOrOptions.type : type
      const finalDuration = isObj && messageOrOptions.duration ? messageOrOptions.duration : duration

      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newToast: ToastItem = { id, message: finalMessage, type: finalType, duration: finalDuration }
      setToasts((prev) => [...prev, newToast])

      if (finalDuration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, finalDuration)
      }
    },
    [removeToast]
  )

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast])
  const error = useCallback((message: string) => showToast(message, 'error', 5000), [showToast])
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast])
  const warning = useCallback((message: string) => showToast(message, 'warning', 4000), [showToast])

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

const defaultToastContext: ToastContextType = {
  toasts: [],
  showToast: (msg, type) => console.log(`[Toast ${type || 'info'}]:`, msg),
  removeToast: () => {},
  success: (msg) => console.log('[Toast success]:', msg),
  error: (msg) => console.error('[Toast error]:', msg),
  info: (msg) => console.log('[Toast info]:', msg),
  warning: (msg) => console.warn('[Toast warning]:', msg),
}

export const useToast = () => {
  const context = useContext(ToastContext)
  return context || defaultToastContext
}
