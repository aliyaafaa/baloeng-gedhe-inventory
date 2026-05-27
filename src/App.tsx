import { useState, useEffect } from "react"

import DashboardPage from "./pages/DashboardPage"
import POSPage from "./pages/POSPage"
import InventoryPage from "./pages/InventoryPage"
import FinancePage from "./pages/FinancePage"
import TrackingPage from "./pages/TrackingPage"
import NotificationPage from "./pages/NotificationPage"
import SettingsPage from "./pages/SettingsPage"
import NotificationPopup from "./components/NotificationPopup"

import { useApp } from "./context/AppContext"
import { generateNotifications, AppNotification } from "./utils/notificationUtils"

import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Wallet,
  Eye,
  Bell,
  Settings,
} from "lucide-react"

export default function App() {

  const [activePage, setActivePage] =
    useState("dashboard")

  const { orders, settings, setSettings } = useApp()
  const [popupNotif, setPopupNotif] = useState<AppNotification | null>(null)
  const [lastOrdersLength, setLastOrdersLength] = useState(orders.length)
  const notifications = generateNotifications(orders)

  useEffect(() => {
    const freshNotifications = generateNotifications(orders)

    if (freshNotifications.length > 0) {
      // Only trigger popup for genuinely new orders or status updates, avoiding initial load spam
      if (orders.length > lastOrdersLength) {
        setPopupNotif(freshNotifications[freshNotifications.length - 1])
      } else if (lastOrdersLength === 0) {
        // Fallback for first initialization if needed
        setPopupNotif(freshNotifications[freshNotifications.length - 1])
      }

      setLastOrdersLength(orders.length)

      const timer = setTimeout(() => {
        setPopupNotif(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [orders, lastOrdersLength])

  const menus = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      id: "pos",
      label: "Point of Sale",
      icon: ShoppingCart,
    },

    {
      id: "inventory",
      label: "Inventaris Stok",
      icon: Boxes,
    },

    {
      id: "finance",
      label: "Laporan Keuangan",
      icon: Wallet,
    },

    {
      id: "tracking",
      label: "Pantau Produksi",
      icon: Eye,
    },

    {
      id: "settings",
      label: "Pengaturan",
      icon: Settings,
    },
  ]

  const renderPage = () => {

    switch (activePage) {

      case "dashboard":
        return <DashboardPage />

      case "pos":
        return <POSPage />

      case "inventory":
        return <InventoryPage />

      case "finance":
        return <FinancePage />

      case "tracking":
        return <TrackingPage />

      case "notifikasi":
        return <NotificationPage orders={orders} />

      case "settings":
        return <SettingsPage settings={settings} setSettings={setSettings} />

      default:
        return <DashboardPage />
    }
  }

  return (

    <div className="min-h-screen bg-[#F8F8F8] flex">

      {/* SIDEBAR */}
      <aside
        className="
          w-[280px]
          bg-white
          border-r
          border-gray-200
          p-6
          hidden
          lg:flex
          flex-col
        "
      >

        {/* LOGO */}
        <div>

          <h1 className="text-4xl font-bold leading-tight">
            {settings.business.name}
          </h1>

          <p className="text-gray-400 mt-2 font-semibold">
            {settings.business.subtitle}
          </p>

        </div>

        {/* MENU */}
        <div className="mt-10 space-y-3">

          {/* NOTIFIKASI */}
          <button
            onClick={() => setActivePage("notifikasi")}
            id="sidebar-notification-btn"
            className={`
              w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition text-left
              ${
                activePage === "notifikasi"
                  ? "bg-red-50 text-red-700 font-bold"
                  : "text-gray-600 hover:bg-red-50 hover:text-red-700 font-medium"
              }
            `}
          >
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              activePage === "notifikasi" ? "bg-red-100 text-red-900" : "bg-gray-100 text-red-700"
            }`}>
              <Bell size={20} />
            </span>

            <span className="font-semibold flex-1">
              Notifikasi
            </span>

            {notifications.length > 0 && (
              <span id="unread-notifications-badge" className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {menus.map((menu) => {

            const Icon = menu.icon

            return (

              <button
                key={menu.id}
                onClick={() =>
                  setActivePage(menu.id)
                }
                className={`
                  w-full
                  flex
                  items-center
                  gap-4
                  px-5
                  py-4
                  rounded-2xl
                  transition
                  text-left

                  ${
                    activePage === menu.id
                      ? "bg-red-50 text-red-700 font-bold"
                      : "text-gray-600 hover:bg-red-50 hover:text-red-700"
                  }
                `}
              >

                <Icon size={20} />

                <span>
                  {menu.label}
                </span>

              </button>

            )
          })}

        </div>



      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0 overflow-x-hidden bg-[#F8F9FB] flex flex-col">

        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-4 sm:px-6 lg:px-8">
          {/* kosong / bisa dipakai tombol global nanti */}
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto">

          {renderPage()}

        </div>

      </main>

      <NotificationPopup
        notification={popupNotif}
        onClose={() => setPopupNotif(null)}
      />

    </div>
  )
}
