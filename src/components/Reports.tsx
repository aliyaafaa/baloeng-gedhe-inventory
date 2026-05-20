import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";
import { FileText, Download, TrendingUp, CreditCard, Wallet, ArrowUpRight } from "lucide-react";

const chartData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 3200 },
  { name: "Mar", value: 2800 },
  { name: "Apr", value: 4500 },
  { name: "Mei", value: 5900 },
  { name: "Jun", value: 3800 },
];

const transactions = [
  { id: "INV-1021", date: "05 Mei 2026", customer: "Andi Pratama", category: "Penjualan", amount: 2500000, status: "Selesai" },
  { id: "INV-1020", date: "04 Mei 2026", customer: "Budi Santoso", category: "Produksi", amount: 1250000, status: "Proses" },
  { id: "INV-1019", date: "03 Mei 2026", customer: "CV Nusantara", category: "Penjualan", amount: 4800000, status: "Selesai" },
  { id: "INV-1018", date: "02 Mei 2026", customer: "Siska Amelia", category: "Retur", amount: 450000, status: "Dibatalkan" },
];

export default function Reports() {
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
            Laporan Keuangan
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium not-italic">
            Ringkasan pemasukan, pengeluaran, dan laba usaha Baloeng Gedhe
          </p>
        </div>
        <button className="flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-100 active:scale-95">
          <Download className="w-4 h-4" />
          Ekspor PDF
        </button>
      </motion.div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard title="Total Pendapatan" value="Rp 128.450.000" trend="+12.5% bulan ini" color="text-green-600" icon={TrendingUp} />
        <ReportCard title="Pengeluaran" value="Rp 42.120.000" trend="Stabil" color="text-orange-500" icon={CreditCard} />
        <ReportCard title="Laba Bersih" value="Rp 86.330.000" trend="Setelah operasional" color="text-red-700" icon={Wallet} />
        <ReportCard title="Total Transaksi" value="1.284" trend="Bulan berjalan" color="text-slate-400" icon={FileText} />
      </div>

      {/* CHART */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-bold text-slate-800">Analisis Omset Bulanan</h2>
          <select className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-600 focus:outline-none">
            <option>Tahun 2025</option>
            <option>Tahun 2024</option>
          </select>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="1" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "#F8FAFC" }}
                contentStyle={{ borderRadius: "12px", border: "1px solid #F1F5F9", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", padding: "10px" }}
              />
              <Bar
                dataKey="value"
                fill="#C0392B"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* TABLE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Riwayat Transaksi</h2>
          <button className="text-xs font-bold text-red-700 hover:underline">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pelanggan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Jumlah</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{t.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{t.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{t.customer}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-slate-100 px-2 py-0.5 rounded">{t.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                    Rp {t.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={t.status} />
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

function ReportCard({ title, value, trend, color, icon: Icon }: { title: string, value: string, trend: string, color: string, icon: any }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-red-100 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-red-50 transition-colors">
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
        </div>
      </div>
      <h3 className={`text-xl font-bold text-slate-900`}>{value}</h3>
      <div className="mt-2 flex items-center gap-1">
        <ArrowUpRight className={`w-3 h-3 ${color}`} />
        <p className={`text-[10px] font-bold ${color}`}>
            {trend}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Selesai": "bg-green-50 text-green-600 border-green-100",
    "Proses": "bg-orange-50 text-orange-600 border-orange-100",
    "Dibatalkan": "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border ${styles[status] || styles["Selesai"]}`}>
      {status}
    </span>
  );
}
