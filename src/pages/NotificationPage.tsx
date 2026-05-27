import { Bell, Clock, ShoppingCart, AlertTriangle } from "lucide-react"
import { generateNotifications } from "../utils/notificationUtils"
import { Order } from "../context/AppContext"

interface NotificationPageProps {
  orders: Order[]
}

export default function NotificationPage({ orders = [] }: NotificationPageProps) {
  const notifications = generateNotifications(orders)

  const getIcon = (type: "order" | "deadline" | "late") => {
    if (type === "order") return <ShoppingCart size={20} />
    if (type === "deadline") return <Clock size={20} />
    return <AlertTriangle size={20} />
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10" id="notification-page-container">
      <div className="mb-8" id="notification-header">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900" id="notification-page-title">
          Notifikasi
        </h1>
        <p className="text-slate-500 mt-2" id="notification-page-desc">
          Informasi order masuk dan deadline produksi
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center" id="notification-empty-state">
          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400" id="notification-empty-icon-container">
            <Bell size={26} id="notification-empty-bell-icon" />
          </div>
          <h2 className="font-bold text-xl mt-4" id="notification-empty-heading">Belum Ada Notifikasi</h2>
          <p className="text-gray-500 mt-2" id="notification-empty-subtext">
            Notifikasi akan muncul saat order POS masuk atau deadline mendekat.
          </p>
        </div>
      ) : (
        <div className="space-y-4" id="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              id={`notification-card-${notif.id}`}
              className="bg-white border border-gray-200 rounded-3xl p-5 flex gap-4 items-start shadow-sm"
            >
              <div
                id={`notification-icon-${notif.id}`}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.type === "order"
                    ? "bg-blue-50 text-blue-600"
                    : notif.type === "deadline"
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {getIcon(notif.type)}
              </div>

              <div className="flex-1" id={`notification-content-${notif.id}`}>
                <h3 className="font-bold text-slate-900" id={`notification-title-${notif.id}`}>{notif.title}</h3>
                <p className="text-sm text-slate-500 mt-1" id={`notification-message-${notif.id}`}>{notif.message}</p>
                <p className="text-xs text-gray-400 mt-3" id={`notification-time-${notif.id}`}>
                  {new Date(notif.time).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
