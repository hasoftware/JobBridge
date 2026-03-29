import { useToast } from '../../hooks/useToast'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`} onClick={() => removeToast(toast.id)}>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
