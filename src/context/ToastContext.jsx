import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { createId } from '../utils/id.js'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
}

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-fb-line bg-white text-fb-ink'
}

const ICON_STYLES = {
  success: 'text-emerald-600',
  error: 'text-red-500',
  info: 'text-fb-blue'
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (message, type = 'success', duration = 3400) => {
      const id = createId()
      setToasts((prev) => [...prev.slice(-3), { id, message, type }])
      window.setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((item) => {
          const Icon = ICONS[item.type] || ICONS.info
          return (
            <div
              key={item.id}
              role="status"
              className={`animate-slide-up pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium shadow-pop ${
                STYLES[item.type] || STYLES.info
              }`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${ICON_STYLES[item.type] || ICON_STYLES.info}`} />
              <p className="flex-1 leading-5">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-0.5 opacity-60 transition hover:opacity-100"
                aria-label="Cerrar notificación"
              >
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider')
  return context
}
