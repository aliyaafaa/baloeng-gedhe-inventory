import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  LayoutDashboard,
  MoreVertical,
} from "lucide-react";
import { motion } from "motion/react";

const chartData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 3200 },
  { name: "Mar", value: 2800 },
  { name: "Apr", value: 4500 },
  { name: "Mei", value: 5900 },
  { name: "Jun", value: 3800 },
];

const stats = [
  { title: "Pendapatan", value: "Rp 128.450k", trend: "+12.5%", color: "text-emerald-600" },
  { title: "Pengeluaran", value: "Rp 42.120k", trend: "-2.4%", color: "text-rose-600" },
  { title: "Laba Bersih", value: "Rp 86.330k", trend: "+8.1%", color: "text-emerald-600" },
  { title: "Omset Tertinggi", value: "Pekalongan", trend: "Batik", color: "text-heritage-red" },
];

const productionStatus = [
  { title: "Kaos Heritage", percent: 65, status: "Ongoing" },
  { title: "Kemeja Linen", percent: 30, status: "Cutting" },
  { title: "Jaket Denim", percent: 92, status: "Finishing" },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      {/* GREETING */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Dashboard Baloeng Gedhe
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Ringkasan operasional dan keuangan hari ini, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          Unduh Laporan
        </button>
      </motion.div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            color={stat.color}
            index={i}
          />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 min-h-0">
        {/* PRODUCTION STATUS */}
        <motion.section
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="font-bold text-slate-800">Status Produksi</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500"><span className="w-2 h-2 rounded-full bg-red-700"></span> Batch #1204</span>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {productionStatus.map((item, i) => (
              <ProgressRow
                key={item.title}
                title={item.title}
                percent={item.percent}
                status={item.status}
                index={i}
              />
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-600">Motong</p>
              <p className="text-sm font-bold text-slate-800">120 Pcs</p>
            </div>
            <div className="border-x border-gray-200 px-4">
              <p className="text-sm text-slate-600">Jahit</p>
              <p className="text-sm font-bold text-red-700">345 Pcs</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Finishing</p>
              <p className="text-sm font-bold text-slate-800">85 Pcs</p>
            </div>
          </div>
        </motion.section>

        {/* MONITORING PANEL */}
        <motion.section
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Monitoring</h3>
            <MoreVertical className="w-4 h-4 text-slate-300" />
          </div>

          <div className="space-y-3 flex-1">
            <MonitoringItem label="Invoice Terbit" count={12} color="bg-emerald-500" />
            <MonitoringItem label="Rekap Order" count={45} active color="bg-red-700" />
            <MonitoringItem label="Rekap Omset" count={8} color="bg-blue-500" />
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Persediaan Bahan</h4>
            <div className="flex flex-wrap gap-2">
              <StockTag label="Linen" count="120m" />
              <StockTag label="Cotton" count="450m" />
              <StockTag label="Denim" count="85m" />
            </div>
          </div>
        </motion.section>
      </div>

      {/* PERFORMANCE CHART */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-800">Visualisasi Revenue</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Statistik Semester 1 • 2024</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400"><span className="w-2 h-2 rounded-full bg-red-700"></span> Realisasi</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Target</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="1" vertical={false} stroke="#E5E7EB" />
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
                contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", padding: "10px" }}
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
      </motion.section>
    </div>
  );
}

/* SUBCOMPONENTS */

function StatCard({ title, value, trend, color, index }: { title: string, value: string, trend: string, color: string, index: number, key?: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-heritage-red/20 hover:shadow-md transition-all group"
    >
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-xl font-bold text-slate-900 group-hover:text-heritage-red transition-colors">{value}</h3>
      <p className={`text-[10px] font-bold mt-1 ${color}`}>
        {trend} vs kemarin
      </p>
    </motion.div>
  );
}

function ProgressRow({ title, percent, status, index }: { title: string, percent: number, status: string, index: number, key?: any }) {
  const getBarColor = (p: number) => {
    if (p > 80) return "bg-green-500";
    if (p < 40) return "bg-orange-400";
    return "bg-heritage-red";
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-bold text-slate-700 uppercase">
        <span>{title}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
          className={`h-full ${getBarColor(percent)} transition-all`}
        />
      </div>
      <p className="text-[9px] text-slate-400 font-bold uppercase">{status}</p>
    </div>
  );
}

function MonitoringItem({ label, count, active, color }: { label: string, count: number, active?: boolean, color: string }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${active ? "bg-slate-50 border border-gray-200 shadow-sm" : "hover:bg-slate-50/50"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className={`text-xs font-semibold ${active ? "text-slate-900" : "text-slate-500"}`}>{label}</span>
      </div>
      <span className={`text-xs font-bold ${active ? "text-heritage-red" : "text-slate-800"}`}>{count}</span>
    </div>
  );
}

function StockTag({ label, count }: { label: string, count: string }) {
  return (
    <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-gray-200 hover:bg-slate-100 transition-colors group">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}:</span>
      <span className="ml-1 text-xs font-bold text-slate-800">{count}</span>
    </div>
  );
}
