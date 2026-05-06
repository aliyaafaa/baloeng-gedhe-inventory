import { useState, ReactNode } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Shirt,
  BarChart3,
  Hammer,
  Bell,
  Search,
  Plus,
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import POS from "./components/POS";
import Stock from "./components/Stock";
import Products from "./components/Products";
import Reports from "./components/Reports";
import Production from "./components/Production";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/stok" element={<Stock />} />
          <Route path="/produk" element={<Products />} />
          <Route path="/laporan" element={<Reports />} />
          <Route path="/produksi" element={<Production />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const activePath = location.pathname;

  return (
    <div className="flex min-h-screen font-sans selection:bg-heritage-red selection:text-white">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-heritage-border bg-heritage-paper px-6 py-8">
        <div className="mb-10 px-2">
          <Link to="/">
            <h2 className="text-2xl font-bold tracking-tighter text-heritage-red">
              Baloeng Gedhe
            </h2>
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">
            Manufacturing OS
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" to="/" active={activePath === "/"} />
          <NavItem icon={ShoppingCart} label="Point of Sale" to="/pos" active={activePath === "/pos"} />
          <NavItem icon={Package} label="Inventaris Stok" to="/stok" active={activePath === "/stok"} />
          <NavItem icon={Shirt} label="Katalog Produk" to="/produk" active={activePath === "/produk"} />
          <NavItem icon={BarChart3} label="Laporan Keuangan" to="/laporan" active={activePath === "/laporan"} />
          <NavItem icon={Hammer} label="Produksi Massal" to="/produksi" active={activePath === "/produksi"} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs group-hover:scale-105 transition-transform">
              BG
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Admin Baloeng</p>
              <p className="text-[10px] text-slate-500 font-medium">Manager Produksi</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* TOP PANEL */}
        <header className="sticky top-0 z-10 bg-white border-b border-heritage-border px-8 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="relative w-full max-w-sm hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-heritage-red/20 focus:border-heritage-red/30 transition-all placeholder:text-slate-400"
              placeholder="Cari data produksi..."
            />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">Baloeng Gedhe</p>
              <p className="text-[9px] text-green-600 font-bold">System Online</p>
            </div>
            <Link to="/pos">
              <button className="flex items-center gap-2 bg-heritage-red text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-heritage-red/90 transition-all shadow-sm active:scale-95">
                <Plus className="w-4 h-4" />
                <span>Tambah Order</span>
              </button>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active?: boolean }) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
        active
          ? "bg-red-50 text-heritage-red font-semibold"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon className={`w-4 h-4 transition-colors ${active ? "text-heritage-red" : "text-slate-400 group-hover:text-slate-600"}`} />
      <span className="text-sm">{label}</span>
    </Link>
  );
}
