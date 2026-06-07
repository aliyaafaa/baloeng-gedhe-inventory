import { useState, useEffect } from "react"
import { useNavigate, useLocation, Navigate } from "react-router-dom"

import DashboardPage from "./pages/DashboardPage"
import POSPage from "./pages/POSPage"
import InventoryPage from "./pages/InventoryPage"
import FinancePage from "./pages/FinancePage"
import TrackingPage from "./pages/TrackingPage"
import NotificationPage from "./pages/NotificationPage"
import SettingsPage from "./pages/SettingsPage"
import LoginPage from "./pages/LoginPage"
import NotificationPopup from "./components/NotificationPopup"

import { useApp } from "./context/AppContext"
import { generateNotifications, AppNotification } from "./utils/notificationUtils"
import { isSupabaseConfigured, supabase } from "./lib/supabase"

import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Wallet,
  Eye,
  Bell,
  Settings,
  LogOut,
} from "lucide-react"

export default function App() {

  const navigate = useNavigate()
  const location = useLocation()

  const [activePage, setActivePage] =
    useState("dashboard")

  const [user, setUser] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const isLoggedIn = !!user

  useEffect(() => {
    let active = true

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && active) {
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          setUser(currentUser || session.user)
        } else if (active) {
          setUser(null)
        }
      } catch (err) {
        console.error("Auth session check error:", err)
        if (active) setUser(null)
      } finally {
        if (active) setIsInitializing(false)
      }
    }

    checkInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return
      if (session) {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          setUser(currentUser || session.user)
        } catch (err) {
          setUser(session.user)
        }
      } else {
        setUser(null)
      }
      setIsInitializing(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const { orders, settings, setSettings, dbNotifications, loadDbNotifications } = useApp()
  const [popupNotif, setPopupNotif] = useState<AppNotification | null>(null)
  const [lastNotifLength, setLastNotifLength] = useState(0)

  const notifications: AppNotification[] = isSupabaseConfigured()
    ? dbNotifications.map((n: any) => ({
        id: n.id,
        type: n.type || "order",
        title: n.title || "Notifikasi",
        message: n.message || "",
        time: n.created_at || new Date().toISOString(),
        isRead: n.is_read || false,
      }))
    : generateNotifications(orders)

  useEffect(() => {
    if (isInitializing) return
    if (!user && location.pathname !== "/login") {
      navigate("/login")
    } else if (user && location.pathname === "/login") {
      navigate("/")
    }
  }, [user, isInitializing, location.pathname, navigate])

  useEffect(() => {
    if (notifications.length > 0) {
      if (notifications.length > lastNotifLength) {
        // Trigger popup on new notification
        setPopupNotif(notifications[0])
      } else if (lastNotifLength === 0) {
        // First load fallback
        setPopupNotif(notifications[0])
      }

      setLastNotifLength(notifications.length)

      const timer = setTimeout(() => {
        setPopupNotif(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notifications, lastNotifLength])

  const handleLogin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser || session.user)
      }
    } catch (e) {
      console.error(e)
    }
    navigate("/")
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error("Signout error:", e)
    }
    setUser(null)
    navigate("/login")
  }

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

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Memuat Sesi...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn || location.pathname === "/login") {
    return <LoginPage onLogin={handleLogin} />
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
            {settings.business.companyName}
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center lg:hidden font-bold text-red-600 text-lg">
            {settings.business.companyName}
          </div>
          <div className="hidden lg:block text-slate-500 text-sm font-medium">
            Sistem Operasional dan Keuangan
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-bold text-slate-800">
                {settings.business.adminRole}
              </span>
              <span className="block text-xs text-slate-400 font-medium">
                Administrator
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 border border-red-200 text-red-600 rounded-2xl font-semibold hover:bg-red-50 cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto">

          {renderPage()}

        </div>

      </main>

      <NotificationPopup
        notification={popupNotif}
        onClose={async () => {
          setPopupNotif(null)
          await loadDbNotifications()
        }}
      />

    </div>
  )
}
