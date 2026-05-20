import { motion } from "motion/react";
import { 
  Eye, 
  Plus, 
  User, 
  Box, 
  Hash, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Package,
  Truck
} from "lucide-react";

export default function ProductionMonitor() {
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
            Pantau Produksi
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium not-italic">
            Monitoring progress produksi setiap batch secara mendalam
          </p>
        </div>
        <button className="flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-100 active:scale-95">
          <Plus className="w-4 h-4" />
          Tambah Batch
        </button>
      </motion.div>

      {/* DETAIL ORDER CARD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DetailItem label="Nama Customer" value="PT Patra Niaga" icon={User} />
          <DetailItem label="Produk" value="PDL PDH Lapangan" icon={Box} />
          <DetailItem label="Jumlah Produksi" value="500 pcs" icon={Hash} />
          <DetailItem label="Deadline" value="25 Mei 2026" icon={Calendar} highlight />
        </div>
      </motion.div>

      {/* WORKFLOW PROGRESS */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8"
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Workflow Produksi</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Alur Produksi Custom • Seri Seragam</p>
          </div>
          <span className="bg-orange-50 text-orange-600 border border-orange-100 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Sedang Produksi
          </span>
        </div>

        <div className="space-y-0">
          <Step 
            title="Pengadaan Kain" 
            desc="Kain drill dan bahan pelengkap telah tersedia di gudang produksi." 
            status="Selesai" 
            icon={Package}
            isFirst
          />
          <Step 
            title="Potong Kain" 
            desc="500 pcs pola telah dipotong sesuai ukuran (S, M, L, XL)." 
            status="Selesai" 
            icon={Hash}
          />
          <Step 
            title="Bordir Logo" 
            desc="Bordir logo Pertamina & Patra Niaga pada dada dan lengan selesai." 
            status="Selesai" 
            icon={CheckCircle2}
          />
          <Step 
            title="Jahit Produksi" 
            desc="320 dari 500 pcs telah selesai dijahit. Pengerjaan kerah sedang berjalan." 
            status="Proses" 
            progress={64}
            icon={Clock}
          />
          <Step 
            title="Quality Control" 
            desc="Menunggu seluruh proses jahit selesai sebelum pengecekan akhir." 
            status="Pending" 
            icon={AlertCircle}
          />
          <Step 
            title="Packing & Pengiriman" 
            desc="Persiapan plastik pembungkus dan box pengiriman eksklusif." 
            status="Pending" 
            icon={Truck}
            isLast
          />
        </div>
      </motion.div>

      {/* QC SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QCCard label="Total Produksi" value="500 pcs" color="text-slate-900" />
        <QCCard label="Reject Produksi" value="12 pcs" color="text-red-600" sub="Butuh reparasi" />
        <QCCard label="Selesai Produksi" value="320 pcs" color="text-green-600" sub="Siap dikemas" />
      </div>
    </div>
  );
}

/* SUBCOMPONENTS */

function DetailItem({ label, value, icon: Icon, highlight }: { label: string, value: string, icon: any, highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Icon className="w-3 h-3" />
        {label}
      </p>
      <h2 className={`font-bold text-lg ${highlight ? "text-red-700" : "text-slate-800"}`}>
        {value}
      </h2>
    </div>
  );
}

function Step({ title, desc, status, progress, icon: Icon, isFirst, isLast }: { title: string, desc: string, status: "Selesai" | "Proses" | "Pending", progress?: number, icon: any, isFirst?: boolean, isLast?: boolean }) {
  const getStatusConfig = () => {
    switch (status) {
      case "Selesai": return { color: "bg-green-500", badge: "bg-green-50 text-green-600 border-green-100" };
      case "Proses": return { color: "bg-orange-400", badge: "bg-orange-50 text-orange-600 border-orange-100" };
      default: return { color: "bg-slate-200", badge: "bg-slate-50 text-slate-400 border-slate-100" };
    }
  }

  const { color, badge } = getStatusConfig();

  return (
    <div className="relative pl-10 pb-8 last:pb-0">
      {/* LINE */}
      {!isLast && (
        <div className={`absolute left-[11px] top-6 w-0.5 h-full ${status === "Pending" ? "bg-slate-100" : "bg-green-500"}`} />
      )}
      
      {/* DOT */}
      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${status === "Pending" ? "bg-slate-200" : "bg-green-500"} ${status === "Proses" && "scale-110 !bg-orange-400"}`}>
        <div className={`w-1.5 h-1.5 rounded-full bg-white ${status === "Proses" && "animate-pulse"}`} />
      </div>

      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-3 mb-1">
             <Icon className={`w-4 h-4 ${status === "Pending" ? "text-slate-300" : "text-slate-700"}`} />
             <h3 className="font-bold text-slate-800">{title}</h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          
          {progress !== undefined && (
            <div className="mt-4">
               <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Progress Pengerjaan</span>
                  <span className="text-sm font-bold text-orange-500">{progress}%</span>
               </div>
               <div className="h-2 w-full max-w-sm bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-orange-400"
                  />
               </div>
            </div>
          )}
        </div>
        <div className="flex items-start">
          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${badge}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

function QCCard({ label, value, color, sub }: { label: string, value: string, color: string, sub?: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <h2 className={`text-3xl font-bold ${color}`}>
          {value}
        </h2>
        {sub && <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{sub}</p>}
      </div>
    </div>
  );
}
