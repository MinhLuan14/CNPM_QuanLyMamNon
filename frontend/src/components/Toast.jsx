import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

function Toast({ toast, onClose, duration = 3500, className = '' }) {
  const [closingToast, setClosingToast] = useState(null)
  const closeTimeout = useRef(null)
  const isClosing = closingToast === toast

  useEffect(() => {
    if (!toast) return undefined

    const timeout = window.setTimeout(() => {
      setClosingToast(toast)
      closeTimeout.current = window.setTimeout(onClose, 180)
    }, duration)
    return () => {
      window.clearTimeout(timeout)
      window.clearTimeout(closeTimeout.current)
    }
  }, [toast, onClose, duration])

  if (!toast) return null

  const close = () => {
    if (isClosing) return
    setClosingToast(toast)
    closeTimeout.current = window.setTimeout(onClose, 180)
  }
  const type = icons[toast.type] ? toast.type : 'success'
  const Icon = icons[type]
  const iconColor = type === 'error' ? 'text-red' : `text-${type}`

  return (
    <div className={`toast-popup toast-${type} ${className} ${isClosing ? 'toast-closing' : ''}`} role={type === 'error' ? 'alert' : 'status'}>
      <div className="toast-content">
        <Icon size={18} className={`toast-icon-svg ${iconColor}`} />
        <div className="toast-text">
          <strong>{toast.title || 'Thông báo'}</strong>
          <p>{toast.message}</p>
        </div>
      </div>
      <button className="toast-close" onClick={close} aria-label="Đóng thông báo">
        <X size={15} />
      </button>
    </div>
  )
}

export default Toast
