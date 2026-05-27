import { X, Bell } from "lucide-react"
import { AppNotification } from "../utils/notificationUtils"

interface NotificationPopupProps {
  notification: AppNotification | null
  onClose: () => void
}

export default function NotificationPopup({ notification, onClose }: NotificationPopupProps) {
  if (!notification) return null

  return (
    <div
      id={`notification-popup-${notification.id}`}
      className="fixed top-5 right-5 z-[9999] w-[calc(100%-40px)] sm:w-[380px] bg-white border border-gray-200 rounded-3xl shadow-2xl p-5 animate-slideIn"
    >
      <div className="flex items-start gap-4" id={`notification-popup-inner-${notification.id}`}>
        <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center shrink-0" id={`notification-popup-icon-container-${notification.id}`}>
          <Bell size={20} id={`notification-popup-bell-icon-${notification.id}`} />
        </div>

        <div className="flex-1" id={`notification-popup-text-content-${notification.id}`}>
          <h3 className="font-bold text-slate-900" id={`notification-popup-title-${notification.id}`}>{notification.title}</h3>
          <p className="text-sm text-slate-500 mt-1" id={`notification-popup-message-${notification.id}`}>
            {notification.message}
          </p>
        </div>

        <button
          onClick={onClose}
          id={`notification-popup-close-btn-${notification.id}`}
          className="text-gray-400 hover:text-slate-900"
          aria-label="Close notification"
        >
          <X size={18} id={`notification-popup-close-icon-${notification.id}`} />
        </button>
      </div>
    </div>
  )
}
