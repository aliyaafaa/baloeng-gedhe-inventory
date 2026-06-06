import React, { useState } from "react";
import { 
  ShoppingCart, 
  Trash2, 
  Search, 
  Plus, 
  Minus, 
  ChevronRight,
  PackageCheck,
  X
} from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import bgLogo from "../assets/images/bg_logo_1779866363731.png";

export default function POS() {
  // Helper components for dashboards
  const InfoCard = ({ title, value }: { title: string; value: string }) => (
    <div className="bg-slate-50/50 rounded-2xl p-4 border border-gray-200">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="font-extrabold text-slate-800">{value}</h3>
    </div>
  );

  const SummaryItem = ({ title, value, color = "text-slate-800" }: { title: string; value: string; color?: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <h3 className={`text-sm font-bold ${color}`}>{value}</h3>
    </div>
  );

  const WorkflowItem = ({
    step,
    title,
    desc,
    status,
    progress,
    image
  }: {
    step: string;
    title: string;
    desc: string;
    status: 'done' | 'progress' | 'pending';
    progress?: number;
    image?: string | null;
    key?: string | number;
  }) => {
    const colors = {
      done: "bg-green-100 text-green-700",
      progress: "bg-amber-100 text-amber-700",
      pending: "bg-slate-100 text-slate-500",
    };

    return (
      <div className="flex gap-3 sm:gap-5">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${colors[status]}`}>
          {step}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm sm:text-base">{title}</h3>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${colors[status]}`}>
              {status}
            </span>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {desc}
          </p>

          {/* PROGRESS */}
          {progress !== undefined && progress > 0 && (
            <div className="mt-3">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-amber-500 h-full"
                ></motion.div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">
                {progress}% selesai
              </p>
            </div>
          )}

          {/* FOTO */}
          {image && (
            <img
              src={image}
              alt="workflow"
              className="w-40 h-40 object-cover rounded-2xl mt-4 border border-gray-200 shadow-sm"
            />
          )}
        </div>
      </div>
    );
  };

  const WorkflowPrint = ({ step, title }: { step: string; title: string }) => {
    return (
      <div className="flex items-center gap-4 border border-gray-200 rounded-2xl p-4">
        <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
          {step}
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">
          {title}
        </h3>
      </div>
    );
  };

  const [allProducts, setAllProducts] = useState([
    { id: 5, name: "Polo Shirt Classic", price: 150000, category: "Apparel", stock: 30 },
    { id: 6, name: "Totebag Baloeng Gedhe", price: 75000, category: "Accessories", stock: 100 },
  ]);
  const [cart, setCart] = useState<{
    id: number | string;
    name: string;
    price: number;
    qty: number;
    canceled?: boolean;
    subtotal?: number;
    notes?: string;
    type?: string;
    isCustom?: boolean;
  }[]>([]);
  const [customOrder, setCustomOrder] = useState({
    name: "Custom Order",
    type: "PDH / PDL",
    qty: "",
    price: "",
    notes: "",
  });

  const updateCustomOrder = (field: string, value: string) => {
    const updated = {
      ...customOrder,
      [field]: value,
    }

    setCustomOrder(updated)

    const qty = Number(updated.qty || 0)
    const price = Number(updated.price || 0)

    if (qty > 0 && price > 0) {
      const customItem = {
        id: "custom-order",
        name: updated.name || "Custom Order",
        type: updated.type,
        qty,
        price,
        subtotal: qty * price,
        notes: updated.notes,
        isCustom: true,
      }

      setCart((prev) => {
        const exists = prev.find((item) => item.id === "custom-order")

        if (exists) {
          return prev.map((item) =>
            item.id === "custom-order" ? customItem : item
          )
        }

        return [...prev, customItem]
      })
    }
  };

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const { createOrder, settings, orders } = useApp();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
    orders.length + 1
  ).padStart(4, "0")}`;

  const [showProductionTracking, setShowProductionTracking] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const closePaymentModal = () => setShowPaymentStatus(false);
  const savePaymentStatus = async () => {
    setShowPaymentStatus(false);
    const targetInvoiceNo = createdOrder?.invoice_no || invoiceNumber;
    
    if (createdOrder) {
      setCreatedOrder((prev: any) => ({
        ...prev,
        dp_amount: paymentAmount,
        payment_status: paymentStatus,
      }));
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({
            dp_amount: paymentAmount,
            payment_status: paymentStatus,
          })
          .eq("invoice_no", targetInvoiceNo);

        if (error) {
          console.error("Error updating order payment in Supabase:", error);
        } else {
          console.log("Successfully updated payment status in Supabase!");
        }
      } catch (err) {
        console.error("Failed to run Supabase update query:", err);
      }
    }
  };
  const [paymentStatus, setPaymentStatus] = useState("Belum Bayar");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [orderStatus, setOrderStatus] = useState("OPEN");
  const [draftOrders, setDraftOrders] = useState<any[]>([]);
  const [editNotes, setEditNotes] = useState(false);
  const [productionNotes, setProductionNotes] = useState(
    `- Bordir presisi logo dada kiri & lengan\n\n- Material kain pilihan kualitas premium heritage\n\n- Deadline produksi sebelum 25 Mei 2026\n\n- Quality control ketat per unit produksi`
  );
  const [customPrice, setCustomPrice] = useState(70000);
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [productionDeadline, setProductionDeadline] = useState("");
  const [showUpdateProduksi, setShowUpdateProduksi] = useState(false);
  const [showSuratKerja, setShowSuratKerja] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(settings.production.workflow[0] || "Bordir Logo");
  const [workflowStatus, setWorkflowStatus] = useState("progress");
  const [productionProgress, setProductionProgress] = useState(64);
  const [workflowData, setWorkflowData] = useState<any[]>(
    settings.production.workflow.map((step, index) => ({
      step: String(index + 1),
      title: step,
      desc: index === 0 ? `${step} berhasil dibuat/disiapkan.` : `Menunggu proses sebelumnya`,
      status: index === 0 ? "done" : settings.production.defaultStatus.toLowerCase() as any,
      progress: index === 0 ? 100 : 0,
      image: null as string | null,
    }))
  );
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [completedQty, setCompletedQty] = useState(320);
  const [totalProduksi, setTotalProduksi] = useState(500);
  const [totalSelesai, setTotalSelesai] = useState(320);
  const [totalReject, setTotalReject] = useState(12);
  const [rejectQty, setRejectQty] = useState(0);
  const [editSpecification, setEditSpecification] = useState(false);
  const [productionSpecification, setProductionSpecification] = useState(
    `- Bordir presisi logo dada kiri & lengan\n\n- Material kain pilihan kualitas premium heritage\n\n- Deadline produksi sebelum 25 Mei 2026\n\n- Quality control ketat per unit produksi`
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedPhoto(imageUrl);
    }
  };

  const printInvoice = () => {
    setTimeout(() => {
      window.print();
    }, 300);
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

  const updateQty = (id: number | string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.qty + delta);
          if (id === "custom-order") {
            setCustomOrder(prev => ({ ...prev, qty: newQty ? String(newQty) : "" }));
          }
          return { ...item, qty: newQty, subtotal: item.price * newQty };
        }
        return item;
      }).filter(item => item.qty > 0)
    );
  };

  const removeItem = (id: number | string) => {
    if (id === "custom-order") {
      setCustomOrder({
        name: "Custom Order",
        type: "PDH / PDL",
        qty: "",
        price: "",
        notes: "",
      });
    }
    setCart(cart.filter((item) => item.id !== id));
  };

  const cancelItem = (id: number | string) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, canceled: !item.canceled } : item
      )
    );
  };

  const cancelOrder = () => {
    const confirmCancel = window.confirm(
      "Yakin ingin membatalkan seluruh order?"
    );
    if (!confirmCancel) return;
    setCart([]);
    setOrderStatus("CANCELED");
    setPaymentAmount(0);
    setPaymentStatus("Belum Bayar");
    setProductionNotes("");
    setShowInvoice(false);
    setShowNextStep(false);
    setShowProductionTracking(false);
    alert("Order berhasil dibatalkan");
  };

  const holdOrder = () => {
    if (cart.length === 0) {
      alert("Keranjang kosong");
      return;
    }
    const newDraft = {
      id: Date.now(),
      items: cart,
      total,
      createdAt: new Date(),
      status: "DRAFT",
    };
    setDraftOrders([...draftOrders, newDraft]);
    setOrderStatus("DRAFT");
    setCart([]);
    alert("Order berhasil disimpan ke draft");
  };

  const continueDraft = (draft: any) => {
    setCart(draft.items);
    setOrderStatus("ACTIVE");
    // hapus dari draft
    setDraftOrders(draftOrders.filter((item) => item.id !== draft.id));
    alert("Draft berhasil dilanjutkan");
  };

  const deleteDraft = (id: number) => {
    const confirmDelete = window.confirm("Hapus draft ini?");
    if (!confirmDelete) return;
    setDraftOrders(draftOrders.filter((draft) => draft.id !== id));
  };

  const saveProductionUpdate = () => {
    const updatedWorkflow = workflowData.map((item) => {
      if (item.title === selectedWorkflow) {
        return {
          ...item,
          status: workflowStatus as any,
          progress: Number(productionProgress),
          desc: `${completedQty} pcs selesai ${selectedWorkflow.toLowerCase()}`,
          image: uploadedPhoto,
        };
      }
      return item;
    });
    setWorkflowData(updatedWorkflow);
    setTotalSelesai(Number(completedQty));
    setTotalReject(Number(rejectQty));
    setShowUpdateProduksi(false);
    alert("Progress produksi berhasil diupdate");
  };

  const printSuratKerja = () => {
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const total = cart.reduce((sum, item) => item.canceled ? sum : sum + Number(item.subtotal || item.price * item.qty || 0), 0);
  const remainingPayment = total - paymentAmount;

  const overallProgress = Math.round(
    workflowData.reduce((acc, item) => acc + item.progress, 0) / workflowData.length
  );

  const circleCircumference = 439;
  const progressOffset = circleCircumference - (overallProgress / 100) * circleCircumference;
  const totalPending = totalProduksi - totalSelesai - totalReject;

  const filteredDrafts = draftOrders;
  const recentDrafts = filteredDrafts
    .slice()
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="page-title">
            Point of Sale
          </h1>
          <p className="page-subtitle">
            Kelola order dan transaksi customer
          </p>
        </div>

      </motion.div>

      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-5 mt-6 min-h-0">
        {/* PRODUCT LIST */}
        <div className="2xl:col-span-8 flex flex-col">
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
                className="relative bg-white rounded-3xl border border-gray-200 p-6 min-h-[220px] overflow-hidden"
              >
                <button
                  onClick={() => addToCart(p)}
                  className="absolute top-6 right-6 w-11 h-11 min-w-11 min-h-11 shrink-0 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 text-xl leading-none hover:bg-red-700 hover:text-white transition cursor-pointer"
                >
                  +
                </button>

                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold pr-14">
                  {p.category}
                </p>

                <h3 className="text-xl font-bold mt-8 pr-14 text-slate-800">
                  {p.name}
                </h3>

                <p className="text-red-700 font-bold text-2xl mt-3">
                  Rp {p.price.toLocaleString("id-ID")}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ================= DRAFT ORDER LIST ================= */}
          <div className="bg-white rounded-2xl shadow p-5 mt-5">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-bold">Draft Order</h2>
                <p className="text-sm text-slate-500">Order yang disimpan sementara</p>
              </div>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                {draftOrders.length} Draft
              </span>
            </div>

            {/* EMPTY */}
            {draftOrders.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">📂</div>
                <p className="text-slate-400">Belum ada draft order</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:border-red-100 transition-colors"
                  >
                    {/* LEFT */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-slate-800">Draft #{draft.id}</h3>
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-semibold uppercase tracking-widest">
                          DRAFT
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-500 space-y-1 font-medium">
                        <p>Total Item: {draft.items.length}</p>
                        <p>Total: Rp {draft.total.toLocaleString("id-ID")}</p>
                        <p>{new Date(draft.createdAt).toLocaleString("id-ID")}</p>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex gap-3 flex-wrap">
                      {/* LANJUTKAN */}
                      <button
                        onClick={() => continueDraft(draft)}
                        className="px-5 py-3 rounded-xl bg-red-700 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-100 hover:bg-red-800 transition"
                      >
                        Lanjutkan
                      </button>

                      {/* HAPUS */}
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="px-5 py-3 rounded-xl border border-red-200 text-red-700 font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CART / CHECKOUT */}
        <div className="2xl:col-span-4 mt-6 2xl:mt-0 h-full">
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
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-heritage-red/20 focus:border-heritage-red/30 transition-all font-medium"
                />
                <input
                  type="text"
                  placeholder="Nama Perusahaan / Instansi"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-heritage-red/20 focus:border-heritage-red/30 transition-all font-medium"
                />
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] block pl-1">Deadline Produksi</label>
                  <input
                    type="date"
                    value={productionDeadline}
                    onChange={(e) => setProductionDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-heritage-red/20 focus:border-heritage-red/30 transition-all font-medium text-slate-700"
                  />
                </div>
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
                    className={`flex flex-col gap-3 border border-gray-200 p-4 rounded-xl group relative transition-all ${
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
                    {item.isCustom ? (
                      <div className="bg-red-50 text-red-700 font-bold px-3 py-2 rounded-xl text-xs flex justify-between items-center">
                        <span className="uppercase tracking-widest text-[9px] text-red-500 font-black">Custom Type</span>
                        <span>{item.type}</span>
                      </div>
                    ) : (
                      <select className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-heritage-red/10">
                        <option>Pilih Variant</option>
                        <option>M - Merah Heritage</option>
                        <option>L - Navy Blue</option>
                        <option>XL - Jet Black</option>
                      </select>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                        <button disabled={item.canceled} onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-30"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                        <button disabled={item.canceled} onClick={() => updateQty(item.id, 1)} className="p-1 bg-red-700 text-white rounded-md transition-colors disabled:opacity-30"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className={`text-sm font-bold ${item.canceled ? "text-slate-400 line-through" : "text-heritage-red"}`}>
                        Rp {(item.subtotal || item.price * item.qty).toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* CUSTOM NOTES */}
                    <textarea
                      placeholder="Catatan customer (bordir, nama, ukuran khusus, dll)"
                      value={item.notes || ""}
                      onChange={(e) => {
                        if (item.isCustom) {
                          updateCustomOrder("notes", e.target.value);
                        } else {
                          // Allow standard item state update if wanted, otherwise let standard behave
                        }
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-heritage-red/10 resize-none font-medium h-16"
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
                          ? "border-gray-200 text-slate-600 bg-white hover:bg-slate-50" 
                          : "border-gray-200 text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {item.canceled ? "Aktifkan" : "Batalkan"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
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
                  onClick={() => {
                    const newOrder = {
                      id: Date.now(),
                      customer: customerName || "Guest",
                      customer_company: companyName || "-",
                      product: cart.length > 1 ? `${cart[0].name} +${cart.length - 1}` : cart[0]?.name || "Custom Order",
                      qty: cart.reduce((acc, item) => acc + item.qty, 0),
                      total: total,
                      status: "On Production",
                      createdAt: new Date().toISOString().split("T")[0],
                      invoice_no: invoiceNumber,
                      deadline: productionDeadline || undefined,
                      dp_amount: 0,
                      payment_status: "Belum Bayar",
                      production_notes: productionNotes,
                    };
                    createOrder(newOrder);
                    setCreatedOrder(newOrder);
                    setPaymentStatus("Belum Bayar");
                    setPaymentAmount(0);
                    setShowNextStep(true);
                  }}
                  className="w-full bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 flex items-center justify-center gap-3 hover:bg-red-800 transition-all hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none" 
                  disabled={cart.length === 0}
                >
                  Process Payment
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={holdOrder}
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[520px] max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-y-auto border border-gray-100 flex flex-col"
          >
            <div className="p-8 border-b border-gray-200">
               <h2 className="text-2xl font-bold text-slate-800">Custom Manufacturing</h2>
               <p className="text-sm text-slate-500 mt-1">Konfigurasi pesanan khusus untuk instansi atau komunitas</p>
            </div>
            <div className="p-8 space-y-6">
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jenis Produk</label>
                        <select
                          value={customOrder.type}
                          onChange={(e) => updateCustomOrder("type", e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                        >
                           <option>PDH / PDL</option>
                           <option>Kaos Polo</option>
                           <option>Jaket Bomber</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Qty</label>
                        <input
                          type="number"
                          value={customOrder.qty}
                          onChange={(e) => updateCustomOrder("qty", e.target.value)}
                          placeholder="Min. 24"
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                        />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga per Pcs (Rp)</label>
                      <input 
                        type="number" 
                        value={customOrder.price} 
                        onChange={(e) => updateCustomOrder("price", e.target.value)}
                        placeholder="70000"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-bold text-red-700" 
                      />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catatan Spesifikasi</label>
                     <textarea
                       value={customOrder.notes}
                       onChange={(e) => updateCustomOrder("notes", e.target.value)}
                       placeholder="Bahan, warna, bordir logo..."
                       className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none h-24 resize-none"
                     />
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
                      if (!customOrder.qty || !customOrder.price) {
                        alert("Harap isi Quantity dan Harga Terlebih Dahulu!");
                        return;
                      }
                      updateCustomOrder("qty", customOrder.qty);
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
              bg-white
              w-full
              max-w-7xl
              h-[95vh]
              rounded-3xl
              shadow-2xl
              overflow-hidden
              flex
              flex-col
            "
          >
            {/* HEADER */}
            <div
              className="
                border-b border-gray-200
                px-4
                sm:px-6
                py-4
                flex
                flex-col
                lg:flex-row
                lg:justify-between
                lg:items-center
                gap-4
                flex-shrink-0
              "
            >
              {/* LEFT */}
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className="
                    w-14 h-14
                    sm:w-16 sm:h-16
                    rounded-full
                    bg-green-100
                    flex
                    items-center
                    justify-center
                    text-3xl
                    flex-shrink-0
                  "
                >
                  ✅
                </div>
                <div>
                  <h1
                    className="
                      text-2xl
                      sm:text-3xl
                      font-bold
                      leading-tight
                    "
                  >
                    Order Berhasil Dibuat
                  </h1>
                  <p
                    className="
                      text-sm
                      sm:text-base
                      text-gray-500
                      mt-1
                    "
                  >
                    Order siap diproses ke workflow produksi heritage
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowNextStep(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 2xl:grid-cols-12 flex-1 overflow-hidden">
              {/* LEFT CONTENT */}
              <div
                className="
                  2xl:col-span-8
                  p-4
                  sm:p-8
                  border-r border-gray-200
                  overflow-y-auto
                "
              >
                {/* CARD INFO */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                      Invoice
                    </p>
                    <h3 className="font-bold text-lg mt-3">
                      {invoiceNumber}
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                      Customer
                    </p>
                    <h3 className="font-bold text-lg mt-3 text-ellipsis overflow-hidden">
                      {companyName || "PT Patra Niaga"}
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                      Produk Utama
                    </p>
                    <h3 className="font-bold text-lg mt-3 text-ellipsis overflow-hidden">
                      {cart[0]?.name || "Totebag Baloeng Gedhe"}
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                      Grand Total
                    </p>
                    <h3 className="font-bold text-2xl text-red-700 mt-3">
                      Rp {total.toLocaleString("id-ID")}
                    </h3>
                  </div>
                </div>

                {/* WORKFLOW */}
                <div className="mt-8">
                  <h2
                    className="
                      text-sm
                      tracking-[0.3em]
                      uppercase
                      text-gray-500
                      font-bold
                      mb-6
                    "
                  >
                    Workflow Produksi
                  </h2>
                  <div className="space-y-6">
                    {workflowData.map((item) => (
                      <WorkflowItem
                        key={item.step}
                        step={item.step}
                        title={item.title}
                        desc={item.desc}
                        status={item.status as any}
                        progress={item.progress}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR */}
              <div
                className="
                  2xl:col-span-4
                  p-4
                  sm:p-8
                  bg-gray-50
                  overflow-y-auto
                  border-t border-gray-200
                  2xl:border-t-0
                  sticky
                  top-0
                "
              >
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Summary Order</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Total Items</span>
                        <span className="font-bold">{cart.reduce((acc, item) => acc + item.qty, 0)} Pcs</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <span className="text-gray-900 font-bold">Total Tagihan</span>
                        <span className="text-xl font-black text-red-700">Rp {total.toLocaleString("id-ID")}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => setShowInvoice(true)}
                    className="
                      w-full
                      bg-gray-100
                      font-semibold
                      py-3
                      sm:py-4
                      rounded-2xl
                      text-sm
                      sm:text-base
                      hover:bg-gray-200
                      transition
                    "
                  >
                    Print Invoice
                  </button>
                  <button
                    onClick={() => {
                      setShowSuratKerja(true);
                    }}
                    className="
                      w-full
                      bg-red-700
                      text-white
                      py-3
                      sm:py-4
                      rounded-2xl
                      font-semibold
                      text-sm
                      sm:text-base
                      hover:bg-red-800
                      transition
                    "
                  >
                    Print Surat Kerja
                  </button>
                  <button
                    onClick={() => {
                      setShowNextStep(false);
                      setCustomerName("");
                      setCompanyName("");
                      setProductionDeadline("");
                      setCart([]);
                    }}
                    className="
                      w-full
                      border
                      font-semibold
                      py-3
                      sm:py-4
                      rounded-2xl
                      text-sm
                      sm:text-base
                      hover:bg-gray-50
                      transition
                    "
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* ================= REALTIME PRODUCTION TRACKING ================= */}
      {showProductionTracking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              bg-white
              w-full
              max-w-7xl
              h-[95vh]
              rounded-3xl
              shadow-2xl
              overflow-hidden
              flex
              flex-col
            "
          >
            {/* HEADER */}
            <div
              className="
                border-b border-gray-200
                px-4
                sm:px-6
                py-4
                flex
                flex-col
                lg:flex-row
                lg:justify-between
                lg:items-center
                gap-4
                flex-shrink-0
                bg-slate-50/20
              "
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl shadow-sm border border-amber-100">
                  🏭
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Pantau Produksi</h1>
                  <p className="text-sm text-slate-500 font-medium">Workflow realtime produksi garment heritage</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-3 flex-wrap">
                  <div className="bg-green-50 text-green-700 border border-green-100 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Invoice Approved
                  </div>
                  <div className="bg-amber-50 text-amber-700 border border-amber-100 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm animate-pulse">
                    On Production
                  </div>
                </div>
                <button
                  onClick={() => setShowProductionTracking(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div
              className="
                grid
                grid-cols-1
                2xl:grid-cols-12
                flex-1
                overflow-hidden
              "
            >
              {/* LEFT */}
              <div
                className="
                  2xl:col-span-8
                  p-4
                  sm:p-8
                  border-r border-gray-200
                  overflow-y-auto
                "
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <InfoCard title="Customer" value={companyName || "PT Patra Niaga"} />
                  <InfoCard title="Produk" value={cart[0]?.name || "PDH Custom"} />
                  <InfoCard title="Quantity" value="500 pcs" />
                  <InfoCard title="Deadline" value="25 Mei 2026" />
                </div>

                <div className="mt-12">
                  <h2 className="text-sm tracking-[0.3em] uppercase text-gray-500 font-bold mb-8">Progress Workflow</h2>
                  <div className="space-y-8">
                    {workflowData.map((item) => (
                      <WorkflowItem
                        key={item.step}
                        step={item.step}
                        title={item.title}
                        desc={item.desc}
                        status={item.status as 'done' | 'progress' | 'pending'}
                        progress={item.progress}
                        image={item.image}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div
                className="
                  2xl:col-span-4
                  p-4
                  sm:p-8
                  bg-gray-50
                  overflow-y-auto
                  border-t border-gray-200
                  2xl:border-t-0
                  sticky
                  top-0
                "
              >
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Production Yield</h2>
                  <div className="flex justify-center py-4">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <svg className="w-44 h-44 rotate-[-90deg]">
                        <circle cx="88" cy="88" r="70" stroke="#f1f5f9" strokeWidth="14" fill="none" />
                        <circle 
                          cx="88" 
                          cy="88" 
                          r="70" 
                          stroke="#DC2626" 
                          strokeWidth="14" 
                          fill="none" 
                          strokeDasharray={circleCircumference} 
                          strokeDashoffset={progressOffset} 
                          strokeLinecap="round" 
                          className="transition-all duration-1000" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <h2 className="text-5xl font-black text-red-700 tracking-tighter">{overallProgress}%</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Overall</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mt-6">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">QC Summary</h2>
                  <div className="space-y-2">
                    <SummaryItem title="Total Produksi" value={`${totalProduksi} pcs`} />
                    <SummaryItem title="Selesai" value={`${totalSelesai} pcs`} color="text-green-600" />
                    <SummaryItem title="Reject" value={`${totalReject} pcs`} color="text-red-600" />
                    <SummaryItem title="Pending" value={`${totalPending} pcs`} color="text-amber-600" />
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button 
                    onClick={() => setShowUpdateProduksi(true)}
                    className="
                      w-full
                      bg-red-700
                      text-white
                      py-3
                      sm:py-4
                      rounded-2xl
                      font-semibold
                      text-sm
                      sm:text-base
                      hover:bg-red-800
                      transition
                    "
                  >
                    Update Produksi
                  </button>
                  <button 
                    onClick={() => setShowSuratKerja(true)}
                    className="
                      w-full
                      bg-white
                      border
                      border-gray-200
                      text-slate-600
                      py-3
                      sm:py-4
                      rounded-2xl
                      font-semibold
                      text-sm
                      sm:text-base
                      hover:bg-slate-50
                      transition
                    "
                  >
                    Print Surat Kerja
                  </button>
                  <button 
                    onClick={() => setShowProductionTracking(false)}
                    className="
                      w-full
                      bg-slate-900
                      text-white
                      py-3
                      sm:py-4
                      rounded-2xl
                      font-semibold
                      text-sm
                      sm:text-base
                      hover:bg-slate-800
                      transition
                    "
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
            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]"
          >
            {/* HEADER */}
            <div className="border-b border-gray-200 p-8 flex justify-between items-center bg-slate-50/20 no-print">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Invoice Detail</h1>
                <p className="text-slate-500 font-medium mt-1">Sistem Dokumen Invoice Heritage</p>
              </div>
              <div className="text-right">
                <h2 className="font-black text-red-700 text-2xl tracking-tighter">{createdOrder?.invoice_no || invoiceNumber}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {createdOrder 
                    ? new Date(createdOrder.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) 
                    : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* CONTENT TO PRINT */}
            <div id="invoice-content" className="invoice-print p-6 space-y-4 overflow-y-auto">
              {/* Header Invoice */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-dashed border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <img src={bgLogo} className="h-16 w-16 object-contain" referrerPolicy="no-referrer" />
                  <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter">BALOENG GEDHE</h1>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1">Premium Apparel Manufacturing</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <h2 className="text-xl font-black text-red-700 tracking-tight">INVOICE CUSTOM ORDER</h2>
                  <p className="text-sm font-extrabold text-slate-600 mt-1">No. {createdOrder?.invoice_no || invoiceNumber}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    Tanggal Invoice: {createdOrder 
                      ? new Date(createdOrder.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) 
                      : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Informasi Order */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">INFORMASI ORDER</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Invoice</p>
                    <p className="font-extrabold text-slate-800 mt-1">{createdOrder?.invoice_no || invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Invoice</p>
                    <p className="font-extrabold text-slate-800 mt-1">
                      {createdOrder 
                        ? new Date(createdOrder.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) 
                        : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Customer</p>
                    <p className="font-extrabold text-slate-800 mt-1">{createdOrder?.customer || customerName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan</p>
                    <p className="font-extrabold text-slate-800 mt-1">{createdOrder?.customer_company || companyName || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Detail Produk */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">DETAIL PRODUK</h3>
                <div className="overflow-hidden border border-gray-200 rounded-2xl bg-white shadow-sm">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-gray-100">
                      <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="p-4 sm:p-5">Produk</th>
                        <th className="p-4 sm:p-5 text-center">Quantity</th>
                        <th className="p-4 sm:p-5 text-right">Harga Satuan</th>
                        <th className="p-4 sm:p-5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                      {cart.map((item) => {
                        const itemSubtotal = item.qty * item.price;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 sm:p-5">{item.name}</td>
                            <td className="p-4 sm:p-5 text-center">{item.qty} Pcs</td>
                            <td className="p-4 sm:p-5 text-right">Rp {item.price.toLocaleString("id-ID")}</td>
                            <td className="p-4 sm:p-5 text-right text-red-700">Rp {itemSubtotal.toLocaleString("id-ID")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ringkasan Pembayaran */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-100 payment-summary">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">RINGKASAN PEMBAYARAN</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Status */}
                  <div className="flex flex-col justify-center items-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">STATUS PEMBAYARAN</p>
                    {(() => {
                      let displayStatus = "BELUM BAYAR";
                      let badgeColor = "bg-red-100 text-red-700 border-red-200";
                      
                      const dpAmount = paymentAmount || 0;
                      if (dpAmount >= total) {
                        displayStatus = "LUNAS";
                        badgeColor = "bg-green-100 text-green-700 border-green-200";
                      } else if (dpAmount > 0) {
                        displayStatus = "DP";
                        badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
                      }

                      return (
                        <span className={`px-4 py-2 rounded-full border text-xs font-black tracking-widest uppercase ${badgeColor}`}>
                          {displayStatus}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-3 font-bold text-slate-600 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm col-span-1">
                    {(() => {
                      const dpAmount = paymentAmount || 0;
                      const sisaPembayaran = total - dpAmount;
                      
                      let displayStatus = "BELUM BAYAR";
                      if (dpAmount >= total) {
                        displayStatus = "LUNAS";
                      } else if (dpAmount > 0) {
                        displayStatus = "DP";
                      }

                      return (
                        <>
                          <div className="flex justify-between text-xs">
                            <span>Subtotal</span>
                            <span className="text-slate-800">Rp {total.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>DP Masuk</span>
                            <span className="text-slate-800">Rp {dpAmount.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-xs pb-3 border-b">
                            <span>Sisa Pembayaran</span>
                            <span className="text-red-700">Rp {sisaPembayaran.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Status Pembayaran</span>
                            <span className="text-slate-800 font-extrabold uppercase">{displayStatus}</span>
                          </div>
                          <div className="flex justify-between text-base font-black text-red-700 pt-1 tracking-tight">
                            <span>Total Tagihan</span>
                            <span>Rp {total.toLocaleString("id-ID")}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-200 p-8 flex flex-col sm:flex-row gap-3 justify-end items-center bg-slate-50/10 no-print">
              <button
                onClick={() => setShowInvoice(false)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-gray-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-white transition"
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
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full sm:max-w-[520px] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl max-h-[92dvh] flex flex-col overflow-hidden"
          >
            {/* HEADER */}
            <div className="px-5 sm:px-7 py-5 border-b border-gray-200 shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold">
                Update Status Pembayaran
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Kelola status pembayaran customer heritage
              </p>
            </div>

            {/* BODY SCROLL */}
            <div className="px-5 sm:px-7 py-5 overflow-y-auto flex-1 space-y-5">
              {/* STATUS */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Pembayaran</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full min-h-[46px] rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-700"
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
                  className="w-full min-h-[46px] rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-700"
                />
              </div>

              {/* PAYMENT SUMMARY */}
              <div className="space-y-3 text-sm pt-4 border-t border-gray-200">
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
                <select className="w-full min-h-[46px] rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-700">
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
                  className="w-full min-h-[90px] rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-700 resize-none"
                />
              </div>

              {/* STATUS INFO */}
              <div className={`rounded-2xl p-5 text-xs font-black uppercase tracking-[0.2em] text-center shadow-sm border ${
                paymentStatus === "Lunas" ? "bg-green-50 text-green-700 border-green-100" : 
                paymentStatus === "DP" ? "bg-amber-50 text-amber-700 border-amber-100" : 
                paymentStatus === "Cicilan" ? "bg-blue-50 text-blue-700 border-gray-200" : 
                "bg-red-50 text-red-700 border-red-100"
              }`}>
                Current Status: {paymentStatus}
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-5 sm:px-7 py-4 border-t border-gray-200 bg-white shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={closePaymentModal}
                  className="py-3 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-slate-50 transition"
                >
                  Batal
                </button>

                <button
                  onClick={savePaymentStatus}
                  className="py-3 rounded-2xl bg-red-700 text-white font-bold hover:bg-red-800 transition shadow-lg shadow-red-100"
                >
                  Simpan Status
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= UPDATE PRODUKSI MODAL ================= */}
      {showUpdateProduksi && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200"
          >
            {/* HEADER */}
            <div className="border-b border-gray-200 p-8 bg-slate-50/20 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Update Produksi</h2>
                <p className="text-slate-500 font-medium mt-1">Update progress workflow produksi realtime</p>
              </div>
              <button
                onClick={() => setShowUpdateProduksi(false)}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400 hover:text-slate-800 transition"
              >
                ×
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* PILIH TAHAP */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahap Produksi</label>
                <select
                  value={selectedWorkflow}
                  onChange={(e) => setSelectedWorkflow(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none transition-all appearance-none"
                >
                  <option>Invoice & Surat Kerja</option>
                  <option>Pengadaan Kain</option>
                  <option>Potong Kain</option>
                  <option>Bordir Logo</option>
                  <option>Jahit Produksi</option>
                  <option>Quality Control</option>
                  <option>Packing & Delivery</option>
                </select>
              </div>

              {/* STATUS */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Produksi</label>
                <select
                  value={workflowStatus}
                  onChange={(e) => setWorkflowStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none transition-all appearance-none"
                >
                  <option value="pending">Pending</option>
                  <option value="progress">Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* PROGRESS */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Produksi (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={productionProgress}
                  onChange={(e) => setProductionProgress(Number(e.target.value))}
                  className="w-full accent-red-700"
                />
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-bold text-slate-400">0%</span>
                  <span className="text-lg font-black text-red-700">{productionProgress}%</span>
                  <span className="text-[10px] font-bold text-slate-400">100%</span>
                </div>
              </div>

              {/* JUMLAH */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Produksi</label>
                    <input 
                      type="number" 
                      value={totalProduksi} 
                      onChange={(e) => setTotalProduksi(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai</label>
                    <input 
                      type="number" 
                      value={completedQty} 
                      onChange={(e) => setCompletedQty(Number(e.target.value))} 
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reject</label>
                    <input 
                      type="number" 
                      value={rejectQty} 
                      onChange={(e) => setRejectQty(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none" 
                    />
                 </div>
              </div>

              {/* FOTO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Foto Progress</label>
                <label className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-red-200 transition-all group">
                   <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</div>
                   <p className="font-bold text-slate-800 text-sm">Upload Foto Produksi</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">JPG, PNG (Max 5MB)</p>
                   <input type="file" className="hidden" onChange={handlePhotoUpload} />
                </label>
                {uploadedPhoto && (
                  <div className="mt-4 relative group w-40 h-40">
                    <img
                      src={uploadedPhoto}
                      alt="preview"
                      className="w-40 h-40 object-cover rounded-2xl border border-gray-200 shadow-sm"
                    />
                    <button 
                      onClick={() => setUploadedPhoto(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* NOTES */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan Produksi</label>
                <textarea
                  rows={4}
                  placeholder="Catatan update produksi..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm font-medium text-slate-600 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-200 p-8 flex justify-end gap-3 bg-slate-50/10">
              <button
                onClick={() => setShowUpdateProduksi(false)}
                className="px-8 py-4 rounded-2xl border border-gray-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-white transition"
              >
                Batal
              </button>
              <button
                onClick={saveProductionUpdate}
                className="px-8 py-4 rounded-2xl bg-red-700 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-100 hover:bg-red-800 transition"
              >
                Simpan Update
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= SURAT KERJA MODAL ================= */}
      {showSuratKerja && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]"
          >
            {/* HEADER */}
            <div className="border-b border-gray-200 p-8 flex justify-between items-center bg-slate-50/20 no-print overflow-hidden shrink-0">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Surat Kerja Produksi</h1>
                <p className="text-slate-500 font-medium mt-1">Manufacturing Production Sheet Heritage</p>
              </div>
              <button
                onClick={() => setShowSuratKerja(false)}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400 hover:text-slate-800 transition"
              >
                ×
              </button>
            </div>

            {/* CONTENT */}
            <div id="surat-kerja-content" className="surat-kerja-print p-6 space-y-4 overflow-y-auto">
              {/* Header surat */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-dashed border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <img src={bgLogo} className="h-16 w-16 object-contain" referrerPolicy="no-referrer" />
                  <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter">BALOENG GEDHE</h1>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1">Premium Apparel Manufacturing</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <h2 className="text-xl font-black text-red-700 tracking-tight">SURAT KERJA PRODUKSI</h2>
                  <p className="text-sm font-extrabold text-slate-600 mt-1">No. {createdOrder?.invoice_no || invoiceNumber}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Informasi Order */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">INFORMASI ORDER</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Customer</p>
                    <p className="font-extrabold text-slate-800 mt-1">{createdOrder?.customer || customerName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan</p>
                    <p className="font-extrabold text-slate-800 mt-1">{createdOrder?.customer_company || companyName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Produk</p>
                    <p className="font-extrabold text-slate-800 mt-1">
                      {createdOrder?.product || (cart.length > 1 ? `${cart[0].name} +${cart.length - 1}` : cart[0]?.name || "Custom Order")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</p>
                    <p className="font-extrabold text-slate-800 mt-1">
                      {createdOrder ? (createdOrder.qty || 1) : cart.reduce((acc, item) => acc + item.qty, 0)} Pcs
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadline Produksi</p>
                    <p className="font-extrabold text-red-700 mt-1">
                      {createdOrder?.deadline 
                        ? new Date(createdOrder.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                        : (productionDeadline 
                          ? new Date(productionDeadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                          : "-")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Produksi</p>
                    <span className="inline-block mt-1 font-extrabold text-white bg-amber-500 px-3 py-1 text-xs rounded-full uppercase tracking-wider">
                      {createdOrder?.status || "On Production"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bagian Catatan Produksi */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b pb-2">CATATAN PRODUKSI</h3>
                <ul className="space-y-4">
                  {(() => {
                    const notes = createdOrder?.production_notes || productionNotes || "";
                    return notes
                      .split("\n")
                      .map(n => n.trim())
                      .filter(n => n.length > 0)
                      .map((n, i) => {
                        const cleaned = n.replace(/^[-•*]\s*/, "");
                        return (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-red-700 font-extrabold text-base leading-none">•</span>
                            <span className="text-slate-700 font-medium text-sm leading-relaxed">{cleaned}</span>
                          </li>
                        );
                      });
                  })()}
                </ul>
              </div>

              {/* Footer */}
              <div className="grid grid-cols-2 gap-12 pt-12 border-t border-gray-200">
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DIBUAT OLEH</p>
                  <p className="font-black text-slate-800 mt-16">BALOENG GEDHE INDONESIA</p>
                  <div className="w-40 border-b border-gray-300 mt-2"></div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Tanda Tangan Produksi</p>
                  <p className="font-extrabold text-slate-800 mt-16"></p>
                  <div className="w-40 border-b border-gray-300 mt-2 ml-auto"></div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-200 p-8 flex justify-end gap-3 bg-slate-50/10 no-print">
              <button
                onClick={() => setShowSuratKerja(false)}
                className="px-8 py-4 rounded-2xl border border-gray-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-white transition"
              >
                Tutup
              </button>
              <button
                onClick={printSuratKerja}
                className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-black transition"
              >
                Print Surat Kerja
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
