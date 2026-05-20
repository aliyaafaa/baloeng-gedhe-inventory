import { motion } from "motion/react";
import { 
  Factory, 
  Layers, 
  CheckCircle2, 
  Target, 
  Plus, 
  Clock, 
  User, 
  ChevronRight,
  ClipboardList
} from "lucide-react";

const batchProgress = [
  { 
    id: "#21", 
    name: "Kaos Heritage", 
    qty: 500, 
    percent: 65, 
    color: "bg-red-700",
    steps: [
      { name: "Cutting", done: true },
      { name: "Sewing", done: true },
      { name: "Finishing", done: false },
    ]
  },
  { 
    id: "#08", 
    name: "Kemeja Linen", 
    qty: 300, 
    percent: 30, 
    color: "bg-orange-400",
    steps: [
      { name: "Cutting", done: true },
      { name: "Sewing", done: false },
      { name: "Finishing", done: false },
    ]
  },
  { 
    id: "#14", 
    name: "Jaket Denim", 
    qty: 150, 
    percent: 92, 
    color: "bg-green-500",
    steps: [
      { name: "Cutting", done: true },
      { name: "Sewing", done: true },
      { name: "Finishing", done: true },
    ]
  },
];

const productionSchedule = [
  { id: "#21", product: "Kaos Heritage", qty: "500 pcs", deadline: "12 Mei 2026", pic: "Rudi", status: "Proses" },
  { id: "#14", product: "Jaket Denim", qty: "150 pcs", deadline: "08 Mei 2026", pic: "Andra", status: "Hampir Selesai" },
  { id: "#08", product: "Kemeja Linen", qty: "300 pcs", deadline: "18 Mei 2026", pic: "Dimas", status: "Pending" },
];

export default function Production() {
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
            Produksi Massal
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium not-italic">
            Monitoring proses produksi dan progress pengerjaan Baloeng Gedhe
          </p>
        </div>
        <button className="flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-100 active:scale-95">
          <Plus className="w-4 h-4" />
          Tambah Produksi
        </button>
      </motion.div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProductionStat title="Total Produksi" value="2.450 pcs" trend="+18% bulan ini" color="text-green-600" icon={Layers} />
        <ProductionStat title="Produksi Aktif" value="12 Batch" trend="Sedang berjalan" color="text-orange-500" icon={Clock} />
        <ProductionStat title="Produksi Selesai" value="38 Batch" trend="Bulan ini" color="text-red-700" icon={CheckCircle2} />
        <ProductionStat title="Target Produksi" value="5.000 pcs" trend="Mei 2026" color="text-slate-400" icon={Target} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* PROGRESS SECTION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-slate-800">Progress Produksi</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest focus:outline-none">
              <option>Semua Batch</option>
              <option>Aktif</option>
              <option>Selesai</option>
            </select>
          </div>

          <div className="space-y-8">
            {batchProgress.map((batch, i) => (
              <div key={batch.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">{batch.name} <span className="text-slate-400 ml-1">Batch {batch.id}</span></h3>
                    <p className="text-xs font-semibold text-slate-500">{batch.qty} pcs</p>
                  </div>
                  <span className={`text-sm font-bold ${batch.percent > 80 ? 'text-green-600' : batch.percent < 40 ? 'text-orange-500' : 'text-red-700'}`}>
                    {batch.percent}%
                  </span>
                </div>
                
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${batch.percent}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={`h-full ${batch.color} transition-all`}
                  />
                </div>

                <div className="flex gap-4">
                  {batch.steps.map((step, si) => (
                    <div key={si} className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${step.done ? 'text-green-600' : 'text-slate-400'}`}>
                        {step.name} {step.done ? '✔' : '⏳'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RECENT PIC / TEAM */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800">Team Dashboard</h2>
            <button className="text-[10px] font-bold text-red-700 uppercase hover:underline">Kelola Tim</button>
          </div>
          
          <div className="flex-1 space-y-4">
             <TeamMember name="Rudi Ardiansyah" role="Head of Sewing" task="Kaos Heritage #21" status="Active" progress={65} />
             <TeamMember name="Budi Santoso" role="Lead Cutting" task="Kemeja Linen #08" status="Active" progress={30} />
             <TeamMember name="Andra Wijaya" role="QC Specialist" task="Jaket Denim #14" status="Checking" progress={92} />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
               <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Clock className="w-4 h-4 text-red-700" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu Shift</p>
                  <p className="text-sm font-bold text-slate-800">08:00 - 17:00 (Siang)</p>
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SCHEDULE TABLE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-red-700" />
            <h2 className="font-bold text-slate-800">Jadwal Produksi</h2>
          </div>
          <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Lihat Semua Jadwal</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produk</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jumlah</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">PIC</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {productionSchedule.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-red-700">{item.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{item.product}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{item.qty}</td>
                  <td className="px-6 py-4 text-slate-500 italic">{item.deadline}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-400" />
                        </div>
                        <span className="font-semibold text-slate-700">{item.pic}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={item.status} />
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

function ProductionStat({ title, value, trend, color, icon: Icon }: { title: string, value: string, trend: string, color: string, icon: any }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-red-100 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-red-50">
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900">{value}</h3>
      <p className={`text-[10px] font-bold mt-1 ${color}`}>{trend}</p>
    </div>
  );
}

function TeamMember({ name, role, task, status, progress }: { name: string, role: string, task: string, status: string, progress: number }) {
    return (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <p className="text-xs font-bold text-slate-800">{name}</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{role}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-red-700">{task}</span>
                <span className="font-bold text-slate-400">{progress}%</span>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Proses": "bg-orange-50 text-orange-600 border-orange-100",
    "Hampir Selesai": "bg-green-50 text-green-600 border-green-100",
    "Pending": "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border ${styles[status] || styles["Proses"]}`}>
      {status}
    </span>
  );
}
