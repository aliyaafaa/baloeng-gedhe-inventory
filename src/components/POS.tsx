import { useState } from "react";
import { 
  ShoppingCart, 
  Trash2, 
  Search, 
  Plus, 
  Minus, 
  ChevronRight,
  PackageCheck
} from "lucide-react";
import { motion } from "motion/react";

export default function POS() {
  // Helper components for dashboards
  const InfoCard = ({ title, value }: { title: string; value: string }) => (
    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="font-extrabold text-slate-800">{value}</h3>
    </div>
  );

  const SummaryItem = ({ title, value, color = "text-slate-800" }: { title: string; value: string; color?: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <h3 className={`text-sm font-bold ${color}`}>{value}</h3>
    </div>
  );

  const WorkflowItem = ({ step, title, desc, status, progress }: { step: string; title: string; desc: string; status: 'done' | 'progress' | 'pending'; progress?: number }) => {
    const colors = {
      done: "bg-green-50 text-green-700 border-green-100",
      progress: "bg-amber-50 text-amber-700 border-amber-100",
      pending: "bg-slate-50 text-slate-400 border-slate-100",
    };

    return (
      <div className="flex gap-5 group">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border shadow-sm shrink-0 ${colors[status]}`}>
          {step}
        </div>
        <div className="flex-1 pb-6 border-l-2 border-slate-50 pl-6 relative">
           <div className={`absolute left-[-6px] top-5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${status === 'done' ? 'bg-green-500' : status === 'progress' ? 'bg-amber-500 animate-pulse' : 'bg-slate-200'}`} />
           <div className="flex justify-between items-start">
             <div>
               <h3 className="font-bold text-slate-800 text-sm group-hover:text-red-700 transition-colors uppercase tracking-tight">{title}</h3>
               <p className="text-xs text-slate-500 mt-0.5 font-medium">{desc}</p>
             </div>
             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${colors[status]}`}>
               {status}
             </span>
           </div>
           {progress && (
             <div className="mt-4 bg-slate-100 h-1.5 rounded-full overflow-hidden w-full max-w-xs">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="bg-amber-500 h-full"
               />
               <p className="text-[10px] font-bold text-amber-700 mt-1.5 uppercase tracking-widest">{progress}% Selesai</p>
             </div>
           )}
        </div>
      </div>
    );
  };

  const [allProducts, setAllProducts] = useState([
    { id: 5, name: "Polo Shirt Classic", price: 150000, category: "Apparel", stock: 30 },
    { id: 6, name: "Totebag Baloeng Gedhe", price: 75000, category: "Accessories", stock: 100 },
  ]);
  const [cart, setCart] = useState<{ id: number; name: string; price: number; qty: number; canceled?: boolean }[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showProductionTracking, setShowProductionTracking] = useState(false);
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("DP");
  const [paymentAmount, setPaymentAmount] = useState(50000000);
  const [editNotes, setEditNotes] = useState(false);
  const [productionNotes, setProductionNotes] = useState(
    `- Bordir presisi logo dada kiri & lengan\n\n- Material kain pilihan kualitas premium heritage\n\n- Deadline produksi sebelum 25 Mei 2026\n\n- Quality control ketat per unit produksi`
  );
  const [customPrice, setCustomPrice] = useState(70000);
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const printInvoice = () => {
    const printContents = document.getElementById("invoice-content")?.innerHTML;
    const win = window.open("", "", "height=900,width=900");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Invoice - Baloeng Gedhe</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 12px; border: 1px solid #e2e8f0; text-align: left; }
              th { background: #f8fafc; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
              h1 { color: #b91c1c; margin: 0; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
              .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 12px; color: #64748b; }
              .total-box { background: #fef2f2; padding: 20px; border-radius: 12px; margin-top: 20px; font-weight: bold; color: #b91c1c; text-align: right; }
              .print-only { display: none; }
              @media print {
                .no-print { display: none !important; }
                .print-only { display: block !important; }
                body { background: white !important; }
                button { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      win.document.close();
      win.print();
    }
  };

  const addToCart = (product: { id: number; name: string; price: number }) => {
    const productInStore = allProducts.find(p => p.id === product.id);
    if (productInStore && productInStore.stock <= 0) {
      alert("Stok habis!");
      return;
    }

    const exist = cart.find((item) => item.id === product.id);
    if (exist) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    
    // Decrement stock in store
    if (productInStore) {
      handleUpdateStock(product.id, -1);
    }
  };

  const handleUpdateStock = (id: number, amount: number) => {
    setAllProducts(prev => prev.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p
    ));
  };

  const updateQty = (id: number, delta: number) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
      ).filter(item => item.qty > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const cancelItem = (id: number) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, canceled: !item.canceled } : item
      )
    );
  };

  const cancelOrder = () => {
    if (window.confirm("Batalkan seluruh order?")) {
      setCart([]);
    }
  };

  const total = cart.reduce((sum, item) => item.canceled ? sum : sum + item.price * item.qty, 0);
  const remainingPayment = total - paymentAmount;

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
            Point of Sale
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">
            Kasir & Manajemen Transaksi Langsung
          </p>
        </div>

      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mt-6 min-h-0">
        {/* PRODUCT LIST */}
        <div className="xl:col-span-8 flex flex-col">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* CUSTOM CARD */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowCustomModal(true)}
              className="bg-white rounded-2xl border border-white p-5 hover:shadow-lg transition cursor-pointer min-h-[220px] flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 -mr-12 -mt-12 rounded-full blur-2xl opacity-50 group-hover:bg-red-100 transition-colors" />
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Custom Manufacturing
                  </p>
                  <h2 className="text-2xl font-bold text-slate-800 mt-3 group-hover:text-red-700 transition-colors">
                    Custom
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                    Seragam perusahaan custom bordir/sablon berkualitas heritage
                  </p>
                </div>
                <button 
                  onClick={() => setShowCustomModal(true)}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-red-700 group-hover:text-white transition-all shadow-sm"
                >
                  +
                </button>
              </div>

              <div className="mt-8 flex justify-between items-center relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Mulai dari
                  </p>
                  <h3 className="text-red-700 text-2xl font-bold">
                    Rp 70.000
                  </h3>
                </div>
              </div>
            </motion.div>

            {allProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-white p-5 hover:shadow-lg transition cursor-pointer min-h-[220px] flex flex-col justify-between group"
              >
                <div className="space-y-1" onClick={() => addToCart(p)}>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-700 group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-red-700 transition-colors">{p.name}</h3>
                  <p className="text-red-700 font-bold text-lg">
                    Rp {p.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-50 mt-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${p.stock < 10 ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`}>
                      <PackageCheck className="w-3 h-3" /> Stok: {p.stock}
                    </span>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpdateStock(p.id, -1); }}
                        className="w-5 h-5 flex items-center justify-center bg-slate-100 border border-slate-200 rounded text-[10px] font-bold hover:bg-slate-200"
                      >
                        -
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpdateStock(p.id, 1); }}
                        className="w-5 h-5 flex items-center justify-center bg-slate-100 border border-slate-200 rounded text-[10px] font-bold hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-red-700 uppercase hover:underline">Variant</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CART / CHECKOUT */}
        <div className="xl:col-span-4 h-full">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-5 rounded-2xl shadow min-h-[700px] sticky top-24 flex flex-col max-h-[calc(100vh-8rem)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-5 h-5 text-heritage-red" />
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Order Review</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Custom order customer</p>
              </div>
              <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                {cart.length} Item
              </span>
            </div>

            {/* CUSTOMER FORM */}
            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Nama Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-heritage-red/20 focus:border-heritage-red/30 transition-all font-medium"
              />
              <input
                type="text"
                placeholder="Nama Perusahaan / Instansi"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-heritage-red/20 focus:border-heritage-red/30 transition-all font-medium"
              />
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-heritage-red/20 focus:border-heritage-red/30 transition-all font-medium"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
              {cart.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center opacity-30">
                  <ShoppingCart className="w-10 h-10 mb-2 underline" />
                  <h2 className="font-bold uppercase tracking-widest text-sm">Keranjang Kosong</h2>
                  <p className="text-[10px] font-bold mt-1">Tambahkan produk ke order</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex flex-col gap-3 border border-slate-50 p-4 rounded-xl group relative transition-all ${
                      item.canceled ? "opacity-50 bg-slate-100 grayscale-[0.5]" : "bg-slate-50/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="max-w-[150px]">
                        <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 font-semibold italic">Rp {item.price.toLocaleString("id-ID")}</p>
                        {item.canceled && (
                          <span className="inline-block mt-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight">
                            Item Dibatalkan
                          </span>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* VARIANT */}
                    <select className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-heritage-red/10">
                      <option>Pilih Variant</option>
                      <option>M - Merah Heritage</option>
                      <option>L - Navy Blue</option>
                      <option>XL - Jet Black</option>
                    </select>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg p-1 shadow-sm">
                        <button disabled={item.canceled} onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-30"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                        <button disabled={item.canceled} onClick={() => updateQty(item.id, 1)} className="p-1 bg-red-700 text-white rounded-md transition-colors disabled:opacity-30"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className={`text-sm font-bold ${item.canceled ? "text-slate-400 line-through" : "text-heritage-red"}`}>
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* CUSTOM NOTES */}
                    <textarea
                      placeholder="Catatan customer (bordir, nama, ukuran khusus, dll)"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-heritage-red/10 resize-none font-medium h-16"
                    />

                    {/* ACTION BUTTONS ITEM */}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-1 border border-red-100 text-red-600 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight hover:bg-red-50 transition"
                      >
                        Hapus Item
                      </button>
                      <button
                        onClick={() => cancelItem(item.id)}
                        className={`flex-1 border py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition ${
                          item.canceled 
                          ? "border-slate-300 text-slate-600 bg-white hover:bg-slate-50" 
                          : "border-slate-200 text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {item.canceled ? "Aktifkan" : "Batalkan"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-bold">Rp {total.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg text-slate-900 leading-none">
                <span className="font-bold uppercase tracking-widest text-[10px]">Grand Total</span>
                <span className="text-heritage-red font-bold text-2xl">Rp {total.toLocaleString("id-ID")}</span>
              </div>

              <div className="pt-2 space-y-3">
                <button 
                  onClick={() => setShowNextStep(true)}
                  className="w-full bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 flex items-center justify-center gap-3 hover:bg-red-800 transition-all hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none" 
                  disabled={cart.length === 0}
                >
                  Process Payment
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="py-4 text-heritage-red border border-heritage-red/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    disabled={cart.length === 0}
                  >
                    Hold Order
                  </button>
                  <button 
                    onClick={cancelOrder}
                    className="py-4 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                    disabled={cart.length === 0}
                  >
                    Batalkan Order
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CUSTOM MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-8 border-b border-slate-50">
               <h2 className="text-2xl font-bold text-slate-800">Custom Manufacturing</h2>
               <p className="text-sm text-slate-500 mt-1">Konfigurasi pesanan khusus untuk instansi atau komunitas</p>
            </div>
            <div className="p-8 space-y-6">
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jenis Produk</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none">
                           <option>PDH / PDL</option>
                           <option>Kaos Polo</option>
                           <option>Jaket Bomber</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Qty</label>
                        <input type="number" placeholder="Min. 24" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga per Pcs (Rp)</label>
                      <input 
                        type="number" 
                        value={customPrice} 
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-bold text-red-700" 
                      />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catatan Spesifikasi</label>
                     <textarea placeholder="Bahan, warna, bordir logo..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none h-24 resize-none" />
                  </div>
               </div>
               <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 rounded-full transition"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      addToCart({ id: Date.now(), name: "Custom Order", price: customPrice });
                      setShowCustomModal(false);
                    }}
                    className="flex-1 py-4 bg-red-700 text-white font-bold uppercase tracking-widest text-xs rounded-full shadow-lg shadow-red-100 hover:bg-red-800 transition active:scale-95"
                  >
                    Tambah ke Order
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* ================= NEXT STEP AFTER PAYMENT ================= */}
      {showNextStep && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* HEADER */}
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl shadow-inner border border-green-100">
                  ✅
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    Order Berhasil Dibuat
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">
                    Order siap diproses ke workflow produksi heritage
                  </p>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* ORDER INFO */}
              <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                      Invoice
                    </p>
                    <h3 className="font-extrabold text-slate-800">
                      INV-2026-0012
                    </h3>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                      Customer
                    </p>
                    <h3 className="font-extrabold text-slate-800">
                      {companyName || "PT Patra Niaga"}
                    </h3>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                      Produk Utama
                    </p>
                    <h3 className="font-extrabold text-slate-800">
                      {cart[0]?.name || "PDH Custom"}
                    </h3>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                      Grand Total
                    </p>
                    <h3 className="font-extrabold text-red-700 text-xl">
                      Rp {total.toLocaleString("id-ID")}
                    </h3>
                  </div>
                </div>
              </div>

              {/* WORKFLOW */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
                  Workflow Produksi
                </h3>
                <div className="space-y-6">
                  {[
                    { id: 1, title: "Invoice & Surat Kerja", desc: "Admin membuat invoice dan surat kerja resmi", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
                    { id: 2, title: "Pengadaan Kain", desc: "Menyiapkan material produksi sesuai spesifikasi", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
                    { id: 3, title: "Potong Kain", desc: "Pemotongan pola produksi presisi", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
                    { id: 4, title: "Bordir / Sablon", desc: "Proses branding logo heritage customer", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
                    { id: 5, title: "Jahit Produksi", desc: "Produksi utama penjahitan garment", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
                    { id: 6, title: "Quality Control", desc: "Pemeriksaan detail hasil produksi akhir", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
                    { id: 7, title: "Packing & Delivery", desc: "Pengiriman aman ke lokasi customer", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
                  ].map((step) => (
                    <div key={step.id} className="flex items-start gap-5 group">
                      <div className={`w-10 h-10 shrink-0 rounded-full ${step.color} flex items-center justify-center font-black text-sm shadow-sm`}>
                        {step.id}
                      </div>
                      <div className="pt-1 border-l-2 border-slate-50 pl-5 relative">
                        <div className={`absolute left-[-5px] top-4 w-2 h-2 rounded-full ${step.dot} border-2 border-white shadow-sm ring-4 ring-slate-50/50`} />
                        <h4 className="font-bold text-slate-800 text-sm">{step.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-slate-50 p-6 bg-slate-50/30 flex flex-col sm:flex-row gap-3 justify-end items-center">
              <button
                onClick={() => setShowNextStep(false)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:border-slate-300 transition shadow-sm"
              >
                Tutup
              </button>
              <button
                onClick={() => setShowInvoice(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-100 text-slate-800 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition shadow-sm"
              >
                Print Invoice
              </button>
              <button
                onClick={() => {
                  setShowNextStep(false);
                  setShowProductionTracking(true);
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-red-700 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-100 hover:bg-red-800 hover:translate-y-[-2px] transition-all active:translate-y-0"
              >
                Pantau Produksi
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* ================= REALTIME PRODUCTION TRACKING ================= */}
      {showProductionTracking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* HEADER */}
            <div className="border-b border-slate-50 p-8 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 bg-slate-50/20">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl shadow-sm border border-amber-100">
                  🏭
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pantau Produksi</h1>
                  <p className="text-slate-500 font-medium">Workflow realtime produksi garment heritage</p>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="bg-green-50 text-green-700 border border-green-100 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                  Invoice Approved
                </div>
                <div className="bg-amber-50 text-amber-700 border border-amber-100 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm animate-pulse">
                  On Production
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 xl:grid-cols-12 min-h-[60vh]">
              {/* LEFT */}
              <div className="xl:col-span-8 p-10 border-r border-slate-50 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <InfoCard title="Customer" value={companyName || "PT Patra Niaga"} />
                  <InfoCard title="Produk" value={cart[0]?.name || "PDH Custom"} />
                  <InfoCard title="Quantity" value="500 pcs" />
                  <InfoCard title="Deadline" value="25 Mei 2026" />
                </div>

                <div className="mt-12">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Progress Workflow</h2>
                  <div className="space-y-0">
                    <WorkflowItem step="1" title="Invoice & Surat Kerja" desc="Invoice dan surat kerja berhasil dibuat" status="done" />
                    <WorkflowItem step="2" title="Pengadaan Kain" desc="Material produksi telah diterima" status="done" />
                    <WorkflowItem step="3" title="Potong Kain" desc="500 pola berhasil dipotong" status="done" />
                    <WorkflowItem step="4" title="Bordir Logo" desc="320 pcs selesai bordir logo" status="progress" progress={64} />
                    <WorkflowItem step="5" title="Jahit Produksi" desc="Menunggu proses bordir selesai" status="pending" />
                    <WorkflowItem step="6" title="Quality Control" desc="QC final produksi" status="pending" />
                    <WorkflowItem step="7" title="Packing & Delivery" desc="Pengiriman ke customer" status="pending" />
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="xl:col-span-4 p-10 bg-slate-50/50">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Production Yield</h2>
                  <div className="flex justify-center py-4">
                    <div className="relative w-48 h-48">
                      <svg className="w-48 h-48 rotate-[-90deg]">
                        <circle cx="96" cy="96" r="80" stroke="#f1f5f9" strokeWidth="16" fill="none" />
                        <circle cx="96" cy="96" r="80" stroke="#b91c1c" strokeWidth="16" fill="none" strokeDasharray="502" strokeDashoffset={502 * (1 - 0.64)} strokeLinecap="round" className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <h2 className="text-5xl font-black text-red-700 tracking-tighter">64%</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mt-6">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">QC Summary</h2>
                  <div className="space-y-2">
                    <SummaryItem title="Total Produksi" value="500 pcs" />
                    <SummaryItem title="Selesai" value="320 pcs" color="text-green-600" />
                    <SummaryItem title="Reject" value="12 pcs" color="text-red-600" />
                    <SummaryItem title="Pending" value="168 pcs" color="text-amber-600" />
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button className="w-full bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-100 hover:bg-red-800 transition transform hover:-translate-y-1">
                    Update Produksi
                  </button>
                  <button className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition">
                    Print Surat Kerja
                  </button>
                  <button 
                    onClick={() => setShowProductionTracking(false)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition"
                  >
                    Tutup Dashboard
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* ================= PRINT INVOICE MODAL ================= */}
      {showInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* HEADER */}
            <div className="border-b border-slate-50 p-8 flex justify-between items-center bg-slate-50/20">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Invoice Order</h1>
                <p className="text-slate-500 font-medium mt-1">Manufacturing Custom Order Heritage</p>
              </div>
              <div className="text-right">
                <h2 className="font-black text-red-700 text-2xl tracking-tighter">INV-2026-0012</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">09 Mei 2026</p>
              </div>
            </div>

            {/* CONTENT */}
            <div id="invoice-content" className="p-10 space-y-10 overflow-y-auto">
              <div className="flex flex-col md:flex-row md:justify-between gap-8 border-b border-slate-50 pb-10">
                <div className="space-y-4">
                  <div>
                    <h2 className="font-black text-2xl text-slate-800 tracking-tight">Baloeng Gedhe</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manufacturing & Custom Apparel</p>
                  </div>
                  <div className="text-sm text-slate-500 font-medium leading-relaxed">
                    Jl. Heritage No. 45<br />
                    Purwokerto Timur, Indonesia<br />
                    hello@baloenggedhe.com
                  </div>
                </div>
                <div className="md:text-right space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice To:</h3>
                  <div>
                    <p className="font-extrabold text-slate-800 text-lg">{companyName || "PT Patra Niaga"}</p>
                    <p className="text-sm text-slate-500 font-medium">{customerName || "Divisi Operasional"}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-100 rounded-3xl shadow-sm">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left">
                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk</th>
                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Harga</th>
                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td className="p-5">
                          <h3 className="font-extrabold text-slate-800 text-sm">{item.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">Custom Specification Applied</p>
                        </td>
                        <td className="p-5 text-sm text-slate-600">{item.qty} Pcs</td>
                        <td className="p-5 text-sm text-slate-600">Rp {item.price.toLocaleString("id-ID")}</td>
                        <td className="p-5 text-sm font-black text-red-700 text-right">Rp {(item.price * item.qty).toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan Produksi</h3>
                      <button
                        onClick={() => setEditNotes(!editNotes)}
                        className="text-[10px] text-red-700 font-bold uppercase tracking-widest hover:underline no-print"
                      >
                        {editNotes ? "Simpan" : "Edit"}
                      </button>
                    </div>
                    {/* MODE EDIT */}
                    <div className={editNotes ? "block no-print" : "hidden"}>
                      <textarea
                        value={productionNotes}
                        onChange={(e) => setProductionNotes(e.target.value)}
                        rows={6}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-red-100 transition-all resize-none no-print"
                      />
                    </div>
                    <div className="print-only whitespace-pre-line text-sm text-slate-700">
                      {productionNotes}
                    </div>
                    {/* MODE VIEW */}
                    <div
                      className={`bg-slate-50 rounded-2xl p-6 text-xs text-slate-600 font-medium leading-loose border border-slate-100 shadow-inner whitespace-pre-line ${
                        editNotes ? "hidden" : "block"
                      }`}
                    >
                      {productionNotes}
                    </div>
                  </div>
                </div>
                <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100/50 h-fit">
                   <div className="space-y-4 font-bold">
                     <div className="flex justify-between text-sm text-slate-500">
                       <span>Subtotal</span>
                       <span>Rp {total.toLocaleString("id-ID")}</span>
                     </div>
                     <div className="flex justify-between text-sm text-slate-500">
                       <span>Status Pembayaran</span>
                       <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                         paymentStatus === "Lunas" ? "bg-green-100 text-green-700" : 
                         paymentStatus === "DP" ? "bg-amber-100 text-amber-700" : 
                         paymentStatus === "Cicilan" ? "bg-blue-100 text-blue-700" : 
                         "bg-red-100 text-red-700"
                       }`}>{paymentStatus}</span>
                     </div>
                     <div className="flex justify-between text-sm text-slate-500">
                       <span>Pembayaran Masuk</span>
                       <span>Rp {paymentAmount.toLocaleString("id-ID")}</span>
                     </div>
                     <div className="flex justify-between text-sm text-slate-500">
                       <span>Sisa Pembayaran</span>
                       <span className="text-red-700">Rp {remainingPayment.toLocaleString("id-ID")}</span>
                     </div>
                     <div className="pt-4 border-t border-red-100 flex justify-between text-2xl font-black text-red-700 tracking-tighter">
                       <span>Total</span>
                       <span>Rp {total.toLocaleString("id-ID")}</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-slate-50 p-8 flex flex-col sm:flex-row gap-3 justify-end items-center bg-slate-50/10">
              <button
                onClick={() => setShowInvoice(false)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-white transition"
              >
                Tutup
              </button>
              <button
                onClick={() => setShowPaymentStatus(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-amber-600 transition shadow-lg shadow-amber-100"
              >
                Update Status Pembayaran
              </button>
              <button
                onClick={printInvoice}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition"
              >
                Print Invoice
              </button>

            </div>
          </motion.div>
        </div>
      )}
      {/* ================= UPDATE PAYMENT STATUS ================= */}
      {showPaymentStatus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* HEADER */}
            <div className="border-b border-slate-50 p-8 bg-slate-50/20">
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Update Status Pembayaran</h2>
              <p className="text-slate-500 font-medium mt-1">Kelola status pembayaran customer heritage</p>
            </div>

            {/* CONTENT */}
            <div className="p-8 space-y-6">
              {/* STATUS */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Pembayaran</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-100 transition-all appearance-none"
                >
                  <option value="DP">DP</option>
                  <option value="Cicilan">Cicilan</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Bayar">Belum Bayar</option>
                </select>
              </div>

              {/* NOMINAL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal Pembayaran (Rp)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  placeholder="Masukkan nominal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-100 transition-all"
                />
              </div>

              {/* PAYMENT SUMMARY */}
              <div className="space-y-3 text-sm pt-4 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Status Pembayaran</span>
                  <span className="font-bold text-red-700">{paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Pembayaran Masuk</span>
                  <span className="font-bold text-slate-800">Rp {paymentAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-red-50 rounded-xl">
                  <span className="text-red-700 font-bold">Sisa Pembayaran</span>
                  <span className="font-black text-red-700">Rp {remainingPayment.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* METODE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode Pembayaran</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-100 transition-all appearance-none">
                  <option>Transfer Bank</option>
                  <option>Cash</option>
                  <option>QRIS</option>
                </select>
              </div>

              {/* NOTES */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan Pembayaran</label>
                <textarea
                  rows={3}
                  placeholder="Catatan tambahan pembayaran..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-100 transition-all resize-none"
                />
              </div>

              {/* STATUS INFO */}
              <div className={`rounded-2xl p-5 text-xs font-black uppercase tracking-[0.2em] text-center shadow-sm border ${
                paymentStatus === "Lunas" ? "bg-green-50 text-green-700 border-green-100" : 
                paymentStatus === "DP" ? "bg-amber-50 text-amber-700 border-amber-100" : 
                paymentStatus === "Cicilan" ? "bg-blue-50 text-blue-700 border-blue-100" : 
                "bg-red-50 text-red-700 border-red-100"
              }`}>
                Current Status: {paymentStatus}
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-slate-50 p-8 flex justify-end gap-3 bg-slate-50/10">
              <button
                onClick={() => setShowPaymentStatus(false)}
                className="px-8 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-white transition"
              >
                Batal
              </button>
              <button
                onClick={() => setShowPaymentStatus(false)}
                className="px-8 py-4 rounded-2xl bg-red-700 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-100 hover:bg-red-800 transition"
              >
                Simpan Status
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
