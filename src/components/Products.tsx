import { motion } from "motion/react";
import { Search, Plus, Image as ImageIcon, ExternalLink, Tag } from "lucide-react";

const products = [
  { id: 1, name: "Kaos Heritage", category: "Casual Streetwear", price: 120000, status: "Ready", statusColor: "bg-green-50 text-green-600 border-green-100" },
  { id: 2, name: "Kemeja Linen", category: "Premium Collection", price: 250000, status: "Limited", statusColor: "bg-orange-50 text-orange-600 border-orange-100" },
  { id: 3, name: "Jaket Denim", category: "Denim Series", price: 350000, status: "Ready", statusColor: "bg-green-50 text-green-600 border-green-100" },
  { id: 4, name: "Hoodie Oversize", category: "Winter Collection", price: 280000, status: "Pre Order", statusColor: "bg-red-50 text-red-600 border-red-100" },
  { id: 5, name: "Batik Pekalongan", category: "Heritage Series", price: 450000, status: "Ready", statusColor: "bg-green-50 text-green-600 border-green-100" },
  { id: 6, name: "Chino Pants", category: "Daily Wear", price: 185000, status: "Ready", statusColor: "bg-green-50 text-green-600 border-green-100" },
];

export default function Products() {
  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Katalog Produk
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">
            Daftar produk siap jual dan manajemen koleksi Baloeng Gedhe
          </p>
        </div>
        <button className="flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-100 active:scale-95">
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </motion.div>

      {/* SEARCH & FILTERS */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-3"
      >
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-red-100 focus:border-red-200 transition-all"
          />
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Semua Kategori
            </button>
        </div>
      </motion.div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:border-red-100 hover:shadow-xl hover:shadow-red-50 transition-all flex flex-col"
          >
            <div className="h-48 bg-slate-50 flex items-center justify-center relative overflow-hidden">
              <ImageIcon className="w-12 h-12 text-slate-200 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${p.statusColor} shadow-sm`}>
                  {p.status}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{p.category}</p>
                <h2 className="font-bold text-slate-800 text-lg group-hover:text-red-700 transition-colors">
                  {p.name}
                </h2>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <p className="font-bold text-xl text-red-700">
                  Rp {p.price.toLocaleString("id-ID")}
                </p>

                <div className="flex gap-2 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-2 border border-red-700 text-red-700 py-2.5 rounded-xl text-xs font-bold hover:bg-red-700 hover:text-white transition-all active:scale-95">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Detail
                    </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
