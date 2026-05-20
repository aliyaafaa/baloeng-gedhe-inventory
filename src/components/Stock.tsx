import { motion } from "motion/react";
import { AlertTriangle, PackageOpen, CheckCircle2, History, Filter } from "lucide-react";

const stockItems = [
  { id: 1, name: "Kain Linen", category: "Bahan", qty: 120, unit: "Meter", status: "Aman", lastUpdate: "Hari ini" },
  { id: 2, name: "Benang Putih", category: "Aksesoris", qty: 20, unit: "Roll", status: "Menipis", lastUpdate: "Kemarin" },
  { id: 3, name: "Kancing Denim", category: "Aksesoris", qty: 0, unit: "Pack", status: "Habis", lastUpdate: "2 hari lalu" },
  { id: 4, name: "Kain Cotton", category: "Bahan", qty: 85, unit: "Meter", status: "Aman", lastUpdate: "Hari ini" },
];

export default function Stock() {
  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Inventaris Stok
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium not-italic">
            Monitoring persediaan bahan dan produk secara real-time
          </p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <History className="w-4 h-4" />
                History Stok
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-heritage-red hover:bg-slate-50 transition-colors shadow-sm">
                <Filter className="w-4 h-4" />
                Filter Data
            </button>
        </div>
      </motion.div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Produk" value={128} icon={PackageOpen} color="text-slate-900" />
        <SummaryCard title="Stok Menipis" value={12} icon={AlertTriangle} color="text-orange-500" />
        <SummaryCard title="Stok Habis" value={3} icon={CheckCircle2} color="text-red-700" />
      </div>

      {/* TABLE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Barang</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stok</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Satuan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stockItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-heritage-red transition-colors">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-slate-500">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-bold ${item.qty === 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {item.qty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-400">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-400 italic">{item.lastUpdate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-heritage-red/20 transition-all">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-slate-50 transition-transform group-hover:scale-110`}>
        <Icon className={`w-5 h-5 ${color} opacity-60`} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Aman": "bg-green-50 text-green-600 border-green-100",
    "Menipis": "bg-orange-50 text-orange-600 border-orange-100",
    "Habis": "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border ${styles[status] || styles["Aman"]}`}>
      {status}
    </span>
  );
}
