import { useState } from "react"

import DashboardPage from "./pages/DashboardPage"
import POSPage from "./pages/POSPage"
import InventoryPage from "./pages/InventoryPage"
import FinancePage from "./pages/FinancePage"
import TrackingPage from "./pages/TrackingPage"

import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Wallet,
  Eye,
  Bell,
} from "lucide-react"

export default function App() {

  const [activePage, setActivePage] =
    useState("dashboard")

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

          <h1 className="text-4xl font-bold">
            Baloeng Gedhe
          </h1>

          <p className="text-gray-400 mt-2 font-semibold">
            by 2 BD03C TUP
          </p>

        </div>

        {/* MENU */}
        <div className="mt-10 space-y-3">

          {/* NOTIFIKASI */}
          <button
            onClick={() => alert("Tidak ada notifikasi baru untuk saat ini.")}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-700 transition text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-red-700">
              <Bell size={20} />
            </span>

            <span className="font-semibold">
              Notifikasi
            </span>
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

        {/* FOOTER */}
        <div className="mt-auto">

          <div
            className="
              bg-gray-50
              rounded-2xl
              p-4
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                w-12
                h-12
                rounded-full
                bg-red-700
                text-white
                flex
                items-center
                justify-center
                font-bold
              "
            >
              BG
            </div>

            <div>

              <h3 className="font-semibold">
                Admin Baloeng
              </h3>

              <p className="text-sm text-gray-500">
                Production Manager
              </p>

            </div>

          </div>

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

    </div>
  )
}
