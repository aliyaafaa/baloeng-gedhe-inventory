import { useState } from "react"

import DashboardPage from "./pages/DashboardPage"
import POSPage from "./pages/POSPage"
import InventoryPage from "./pages/InventoryPage"
import FinancePage from "./pages/FinancePage"
import ProductionPage from "./pages/ProductionPage"
import TrackingPage from "./pages/TrackingPage"

import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Wallet,
  Factory,
  Eye,
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
      id: "production",
      label: "Produksi Massal",
      icon: Factory,
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

      case "production":
        return <ProductionPage />

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

          <p className="text-gray-400 mt-2">
            Manufacturing OS
          </p>

        </div>

        {/* MENU */}
        <div className="mt-12 space-y-3">

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
                      ? "bg-red-50 text-red-700 font-semibold"
                      : "hover:bg-gray-50 text-gray-600"
                  }
                `}
              >

                <Icon size={22} />

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
      <main className="flex-1 overflow-hidden">

        {/* TOPBAR */}
        <div
          className="
            h-[90px]
            bg-white
            border-b
            border-gray-200
            px-4
            sm:px-8
            flex
            items-center
            justify-between
          "
        >

          {/* SEARCH */}
          <div className="w-full max-w-xl">

            <input
              type="text"
              placeholder="Cari data produksi..."
              className="
                w-full
                bg-gray-100
                rounded-2xl
                px-6
                py-4
                outline-none
              "
            />

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 ml-5">

            <div
              className="
                w-11
                h-11
                rounded-full
                bg-gray-100
                flex
                items-center
                justify-center
              "
            >
              🔔
            </div>

            <div
              className="
                w-11
                h-11
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

          </div>

        </div>

        {/* PAGE CONTENT */}
        <div className="h-[calc(100vh-90px)] overflow-y-auto">

          {renderPage()}

        </div>

      </main>

    </div>
  )
}
