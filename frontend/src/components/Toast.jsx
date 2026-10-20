import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined

    const timeout = window.setTimeout(onClose, 3500)
    return () => window.clearTimeout(timeout)
  }, [toast, onClose])

  if (!toast) return null

  const type = icons[toast.type] ? toast.type : 'success'
  const Icon = icons[type]
  const iconColor = type === 'error' ? 'text-red' : `text-${type}`

  return (
    <div className={`toast-popup toast-${type}`} role="status">
      <div className="toast-content">
        <Icon size={18} className={`toast-icon-svg ${iconColor}`} />
        <div className="toast-text">
          <strong>{toast.title || 'Thông báo'}</strong>
          <p>{toast.message}</p>
        </div>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Đóng thông báo">
        <X size={15} />
      </button>
    </div>
  )
}

export default Toast
