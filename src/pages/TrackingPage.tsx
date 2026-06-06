import {
  Package,
  Scissors,
  Shirt,
  Search,
  Truck,
  Pencil,
  X,
} from "lucide-react"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useApp } from "../context/AppContext"
import bgLogo from "../assets/images/bg_logo_1779866363731.png"

export default function TrackingPage() {

  const { materialDrafts, orders, settings } = useApp()

  const [searchOrder, setSearchOrder] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const productionOrders = orders.filter(
    (order) => order.status !== "Draft"
  )

  const filteredOrders = productionOrders.filter((order) => {
    const keyword = searchOrder.toLowerCase()

    return (
      order.customer?.toLowerCase().includes(keyword) ||
      order.product?.toLowerCase().includes(keyword)
    )
  })

  const activeOrder = selectedOrder || filteredOrders[0]

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return "Belum ditentukan"

    const today = new Date()
    const dueDate = new Date(deadline)

    if (isNaN(dueDate.getTime())) return deadline;

    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    const diff = dueDate.getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return `Terlambat ${Math.abs(days)} hari`
    if (days === 0) return "Deadline hari ini"
    return `${days} hari lagi`
  }

  const getDeadlineInfo = (createdAt: any, deadline: any) => {
    if (!deadline) {
      return {
        label: "Belum ditentukan",
        percent: 0,
        status: "none",
      }
    }

    const start = new Date(createdAt || new Date())
    const end = new Date(deadline)
    const today = new Date()

    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const totalDays = Math.max(
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      1
    )

    const remainingDays = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    const usedDays = totalDays - remainingDays

    const percent = Math.min(
      Math.max(Math.round((usedDays / totalDays) * 100), 0),
      100
    )

    if (remainingDays < 0) {
      return {
        label: `Terlambat ${Math.abs(remainingDays)} hari`,
        percent: 100,
        status: "late",
      }
    }

    if (remainingDays === 0) {
      return {
        label: "Deadline hari ini",
        percent,
        status: "today",
      }
    }

    return {
      label: `${remainingDays} hari lagi`,
      percent,
      status: "safe",
    }
  }

  const getMaterialProgress = (orderId: number) => {
    const draft = materialDrafts.find(
      (item) => item.orderId === orderId
    )

    if (!draft) return 0

    const kain = draft.items.find(
      (item) => item.category === "Kain"
    )

    if (!kain || !kain.volumeNeed) return 0

    return Math.min(
      Math.round(
        (Number(kain.volumeBought || 0) /
          Number(kain.volumeNeed || 1)) *
          100
      ),
      100
    )
  }

  const [workflowData, setWorkflowData] =
    useState<any[]>([])

  const getActiveWorkflow = () => {
    if (!activeOrder) return null;
    
    let found = workflowData.find(item => item.id === activeOrder.id);
    if (!found) {
      // Return a dynamically generated workflow layout matching activeOrder metadata
      return {
        id: activeOrder.id,
        customer: activeOrder.customer,
        product: activeOrder.product,
        qty: activeOrder.qty,
        deadline: activeOrder.deadline || "TBA",
        progress: activeOrder.progress || 10,
        status: activeOrder.status || "Sedang Produksi",
        steps: settings.production.workflow.map((step, index) => {
          let IconComp = Package;
          const lower = step.toLowerCase();
          if (lower.includes("kain") || lower.includes("bahan")) IconComp = Package;
          else if (lower.includes("potong")) IconComp = Scissors;
          else if (lower.includes("bordir") || lower.includes("sablon")) IconComp = Shirt;
          else if (lower.includes("jahit")) IconComp = Pencil;
          else if (lower.includes("control") || lower.includes("qc")) IconComp = Search;
          else if (lower.includes("packing") || lower.includes("delivery") || lower.includes("kirim")) IconComp = Truck;

          return {
            id: index + 1,
            title: step,
            desc: index === 0 ? `${step} sedang disiapkan.` : `Menunggu tahap sebelumnya selesai.`,
            status: index === 0 ? "progress" : settings.production.defaultStatus.toLowerCase(),
            progress: index === 0 ? 10 : 0,
            icon: IconComp
          };
        })
      };
    }
    return found;
  }

  const selectedData = getActiveWorkflow();

  /* ================= EDIT MODAL ================= */

  const [showEditModal, setShowEditModal] =
    useState(false)

  const [selectedStepId, setSelectedStepId] =
    useState<number | null>(null)

  const [editForm, setEditForm] =
    useState({
      title: "",
      desc: "",
      progress: 0,
      status: "pending",
    })

  /* ================= BATCH EDIT ================= */

  const [showBatchEdit, setShowBatchEdit] =
    useState(false)

  const [showInvoiceModal, setShowInvoiceModal] =
    useState(false)

  const [batchForm, setBatchForm] =
    useState({
      customer: "",
      product: "",
      qty: 0,
      deadline: "",
      status: "",
    })

  const openBatchEdit = () => {
    if (!selectedData) return;
    setBatchForm({
      customer: selectedData.customer || "",
      product: selectedData.product || "",
      qty: selectedData.qty || 0,
      deadline: selectedData.deadline || "",
      status: selectedData.status || "",
    })
    setShowBatchEdit(true)
  }

  const saveBatchEdit = () => {
    if (!activeOrder) return;

    const exists = workflowData.some(item => item.id === activeOrder.id);
    let currentData = workflowData;
    if (!exists && selectedData) {
      currentData = [...workflowData, selectedData];
    }

    const updated =
      currentData.map((batch) => {
        if (
          batch.id === activeOrder.id
        ) {
          return {
            ...batch,
            customer:
              batchForm.customer,
            product:
              batchForm.product,
            qty:
              Number(batchForm.qty),
            deadline:
              batchForm.deadline,
            status:
              batchForm.status,
          }
        }
        return batch
      })

    setWorkflowData(updated)
    setShowBatchEdit(false)
  }

  /* ================= OPEN EDIT ================= */

  const openEditModal = (step: any) => {
    setSelectedStepId(step.id)
    setEditForm({
      title: step.title,
      desc: step.desc,
      progress: step.progress,
      status: step.status,
    })
    setShowEditModal(true)
  }

  /* ================= SAVE EDIT ================= */

  const saveStepEdit = () => {
    if (!activeOrder) return;

    const exists = workflowData.some(item => item.id === activeOrder.id);
    let currentData = workflowData;
    if (!exists && selectedData) {
      currentData = [...workflowData, selectedData];
    }

    const updated =
      currentData.map((batch) => {
        if (
          batch.id === activeOrder.id
        ) {
          const updatedSteps =
            batch.steps.map((step: any) => {
              if (
                step.id === selectedStepId
              ) {
                return {
                  ...step,
                  title:
                    editForm.title,
                  desc:
                    editForm.desc,
                  progress:
                    Number(
                      editForm.progress
                    ),
                  status:
                    editForm.status,
                }
              }
              return step
            })

          const avgProgress =
            Math.round(
              updatedSteps.reduce(
                (acc: number, item: any) =>
                  acc +
                  item.progress,
                0
              ) /
                updatedSteps.length
            )

          return {
            ...batch,
            steps:
              updatedSteps,
            progress:
              avgProgress,
          }
        }
        return batch
      })

    setWorkflowData(updated)
    setShowEditModal(false)
  }

  /* ================= UPDATE STEP ================= */

  const updateStepStatus = (
    stepId: number,
    newStatus: string
  ) => {
    if (!activeOrder) return;

    const exists = workflowData.some(item => item.id === activeOrder.id);
    let currentData = workflowData;
    if (!exists && selectedData) {
      currentData = [...workflowData, selectedData];
    }

    const updated =
      currentData.map((batch) => {

        if (
          batch.id === activeOrder.id
        ) {

          const updatedSteps =
            batch.steps.map((step: any) => {

              if (
                step.id === stepId
              ) {

                return {
                  ...step,
                  status:
                    newStatus,

                  progress:
                    newStatus === "done"
                      ? 100
                      : newStatus ===
                        "progress"
                      ? 64
                      : 0,
                }
              }

              return step
            })

          const avgProgress =
            Math.round(

              updatedSteps.reduce(
                (acc: number, item: any) =>
                  acc +
                  item.progress,
                0
              ) /
                updatedSteps.length

            )

          return {

            ...batch,

            steps:
              updatedSteps,

            progress:
              avgProgress,
          }
        }

        return batch
      })

    setWorkflowData(updated)
  }

  const materialProgress = activeOrder ? getMaterialProgress(activeOrder.id) : 0;

  return (

    <div className="p-6 sm:p-8">

      {/* HEADER */}
      <div className="flex justify-between items-start gap-5 flex-wrap">

        <div>

          <h1 className="page-title">
            Pantau Produksi
          </h1>

          <p className="page-subtitle">
            Monitoring realtime produksi garment
          </p>

        </div>

      </div>

      {/* ================= BATCH LIST TABLE ================= */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 mb-6 mt-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold">Daftar Order Produksi</h2>
            <p className="text-gray-500 text-sm">
              Pilih order untuk melihat dan update workflow produksi
            </p>
          </div>

          <input
            type="text"
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            placeholder="Cari customer / produk..."
            className="w-full md:w-[320px] border border-gray-200 rounded-2xl px-4 py-3"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-gray-400 border-b border-gray-200">
                <th className="py-4">Customer</th>
                <th>Produk</th>
                <th>Qty</th>
                <th>Deadline</th>
                <th>Sisa Waktu</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Belum ada order produksi
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  // Determine current progress
                  const exists = workflowData.find(item => item.id === order.id);
                  const progressToDisplay = exists ? exists.progress : (order.progress || 0);
                  const statusToDisplay = exists ? exists.status : (order.status || "Sedang Produksi");
                  const deadlineInfo = getDeadlineInfo(order.createdAt, order.deadline);

                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        activeOrder?.id === order.id ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="py-4 font-semibold">
                        {order.customer || "Guest"}
                      </td>

                      <td>{order.product}</td>

                      <td>{order.qty || 1} pcs</td>

                      <td>
                        {order.deadline
                          ? new Date(order.deadline).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Belum ditentukan"}
                      </td>

                      <td>
                        <span
                          className={`px-3 py-2 rounded-full text-xs font-semibold ${
                            deadlineInfo.status === "late"
                              ? "bg-red-100 text-red-700"
                              : deadlineInfo.status === "today"
                              ? "bg-orange-100 text-orange-700"
                              : deadlineInfo.status === "none"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {deadlineInfo.label}
                        </span>
                      </td>

                      <td>
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-red-700"
                            style={{ width: `${progressToDisplay}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {progressToDisplay}%
                        </p>
                      </td>

                      <td>
                        <span className="px-3 py-2 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                          {statusToDisplay}
                        </span>
                      </td>

                      <td>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 rounded-xl bg-red-700 text-white text-sm font-semibold"
                        >
                          Pantau
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= DETAIL WORKFLOW ================= */}
      {activeOrder ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            <InfoBox title="Customer" value={activeOrder.customer || "Guest"} />
            <InfoBox title="Produk" value={activeOrder.product} />
            <InfoBox title="Quantity" value={`${activeOrder.qty || 1} pcs`} />
            <InfoBox 
              title="Deadline" 
              value={
                activeOrder.deadline
                  ? new Date(activeOrder.deadline).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Belum ditentukan"
              } 
            />

          </div>

          {/* WORKFLOW */}
          <div className="mt-10">

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

              <div>

                <h2 className="text-3xl font-bold">
                  Workflow Produksi
                </h2>

                <p className="text-gray-500 mt-2">
                  Update proses realtime
                </p>

              </div>

              {selectedData && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="
                      px-5
                      py-3
                      rounded-2xl
                      bg-red-100
                      text-red-700
                      font-semibold
                      hover:bg-red-200
                      transition-colors
                    "
                  >
                    Lihat Invoice
                  </button>

                  <button
                    onClick={openBatchEdit}
                    className="
                      px-5
                      py-3
                      rounded-2xl
                      bg-blue-100
                      text-blue-700
                      font-semibold
                      hover:bg-blue-200
                      transition-colors
                    "
                  >
                    Edit Batch
                  </button>

                  <div
                    className="
                      px-5
                      py-3
                      rounded-full
                      bg-orange-100
                      text-orange-700
                      font-semibold
                    "
                  >
                    {selectedData.status}
                  </div>
                </div>
              )}

            </div>

            {/* STEPS */}
            {selectedData && (
              <div className="space-y-8 mt-10">

                {selectedData.steps.map(
                  (step: any) => {

                    const Icon =
                      step.icon

                    const isKain = step.title === "Pengadaan Kain";
                    const progressPercent = isKain ? materialProgress : step.progress;

                    return (

                      <div
                        key={step.id}
                        className="
                          border
                          border-gray-100
                          rounded-3xl
                          p-5
                        "
                      >

                        <div className="flex justify-between gap-5 flex-wrap">

                          {/* LEFT */}
                          <div className="flex gap-5">

                            <div
                              className={`
                                w-14
                                h-14
                                rounded-2xl
                                flex
                                items-center
                                justify-center

                                ${
                                  step.status ===
                                  "done"
                                    ? "bg-green-100 text-green-700"

                                    : step.status ===
                                      "progress"
                                    ? "bg-orange-100 text-orange-700"

                                    : "bg-gray-100 text-gray-400"
                                }
                              `}
                            >

                              <Icon size={24} />

                            </div>

                            <div>

                              <h3 className="text-2xl font-bold">
                                {step.title}
                              </h3>

                              <p className="text-gray-500 mt-2">

                                {step.desc}

                              </p>

                              {/* PROGRESS */}
                              <div className="mt-5">
                                {isKain ? (
                                  <>
                                    <div className="w-full sm:w-[250px] bg-gray-100 rounded-full h-2 mt-4">
                                      <div
                                        className="h-2 rounded-full bg-red-700"
                                        style={{ width: `${materialProgress}%` }}
                                      />
                                    </div>

                                    <p className="text-xs text-gray-500 mt-2 font-semibold">
                                      {materialProgress}% pengadaan material
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-full sm:w-[250px] h-3 bg-gray-100 rounded-full">

                                      <div
                                        className={`
                                          h-3
                                          rounded-full

                                          ${
                                            step.status ===
                                            "done"
                                              ? "bg-green-500"

                                              : "bg-orange-500"
                                          }
                                        `}
                                        style={{
                                          width:
                                            `${progressPercent}%`,
                                        }}
                                      ></div>

                                    </div>

                                    <p className="text-sm text-gray-400 mt-2">
                                      {progressPercent}% selesai
                                    </p>
                                  </>
                                )}

                              </div>

                            </div>

                          </div>

                          {/* RIGHT */}
                          <div className="flex gap-3 flex-wrap h-fit cursor-pointer">

                            <button
                              onClick={() =>
                                openEditModal(step)
                              }
                              className="
                                px-4
                                py-3
                                rounded-2xl
                                bg-blue-100
                                text-blue-700
                                font-semibold
                                hover:bg-blue-200
                                transition-colors
                              "
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                updateStepStatus(
                                  step.id,
                                  "done"
                                )
                              }
                              className="
                                px-4
                                py-3
                                rounded-2xl
                                bg-green-100
                                text-green-700
                                font-semibold
                                hover:bg-green-200
                                transition-colors
                              "
                            >
                              Selesai
                            </button>

                            <button
                              onClick={() =>
                                updateStepStatus(
                                  step.id,
                                  "progress"
                                )
                              }
                              className="
                                px-4
                                py-3
                                rounded-2xl
                                bg-orange-100
                                text-orange-700
                                font-semibold
                                hover:bg-orange-200
                                transition-colors
                              "
                            >
                              Progress
                            </button>

                            <button
                              onClick={() =>
                                updateStepStatus(
                                  step.id,
                                  "pending"
                                )
                              }
                              className="
                                px-4
                                py-3
                                rounded-2xl
                                bg-gray-100
                                text-gray-500
                                font-semibold
                                hover:bg-gray-200
                                transition-colors
                              "
                            >
                              Pending
                            </button>

                          </div>

                        </div>

                      </div>

                    )
                  }
                )}

              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center text-gray-400">
          Belum ada order produksi.
        </div>
      )}


      {/* ================= EDIT MODAL UI ================= */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Edit Langkah</h2>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* TITLE */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Judul Langkah</label>
                    <input 
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {/* DESC */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deskripsi</label>
                    <textarea 
                      value={editForm.desc}
                      onChange={(e) => setEditForm({...editForm, desc: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* PROGRESS */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Progress (%)</label>
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.progress}
                        onChange={(e) => setEditForm({...editForm, progress: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>

                    {/* STATUS */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                      <select 
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="progress">In Progress</option>
                        <option value="done">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={saveStepEdit}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform hover:translate-y-[-2px] active:translate-y-0"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBatchEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBatchEdit(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Edit Batch Produksi</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Update informasi batch produksi customer</p>
                  </div>
                  <button 
                    onClick={() => setShowBatchEdit(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CUSTOMER */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Customer</label>
                    <input 
                      type="text"
                      value={batchForm.customer}
                      onChange={(e) => setBatchForm({...batchForm, customer: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>

                  {/* PRODUCT */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Produk</label>
                    <input 
                      type="text"
                      value={batchForm.product}
                      onChange={(e) => setBatchForm({...batchForm, product: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>

                  {/* QTY */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quantity (pcs)</label>
                    <input 
                      type="number"
                      value={batchForm.qty}
                      onChange={(e) => setBatchForm({...batchForm, qty: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>

                  {/* DEADLINE */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deadline</label>
                    <input 
                      type="text"
                      value={batchForm.deadline}
                      onChange={(e) => setBatchForm({...batchForm, deadline: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status Produksi</label>
                  <select 
                    value={batchForm.status}
                    onChange={(e) => setBatchForm({...batchForm, status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all appearance-none"
                  >
                    <option>Sedang Produksi</option>
                    <option>QC</option>
                    <option>Packing</option>
                    <option>Selesai</option>
                  </select>
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setShowBatchEdit(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={saveBatchEdit}
                    className="flex-1 bg-red-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-800 transition-all transform hover:translate-y-[-2px] active:translate-y-0"
                  >
                    Simpan Batch
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvoiceModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
            >
              {(() => {
                const order = selectedOrder || activeOrder || {};
                const qty = Number(order.qty || 0);
                const price = Number(order.unit_price || 0);
                const subtotal = qty * price;
                const dpAmount = Number(order.dp_amount || 0);
                const sisaPembayaran = subtotal - dpAmount;

                let displayStatus = "BELUM BAYAR";
                let badgeColor = "bg-red-100 text-red-700 border-red-200";
                
                if (dpAmount >= subtotal) {
                  displayStatus = "LUNAS";
                  badgeColor = "bg-green-100 text-green-700 border-green-200";
                } else if (dpAmount > 0) {
                  displayStatus = "DP";
                  badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
                }

                return (
                  <>
                    {/* HEADER */}
                    <div className="border-b border-gray-200 p-8 flex justify-between items-center bg-slate-50/20 no-print shadow-sm overflow-hidden shrink-0">
                      <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Invoice Detail</h1>
                        <p className="text-slate-500 font-medium mt-1">Sistem Dokumen Invoice Heritage</p>
                      </div>
                      <div className="text-right">
                        <h2 className="font-black text-red-700 text-2xl tracking-tighter">{order.invoice_no || "-"}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) 
                            : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* CONTENT TO PRINT */}
                    <div id="invoice-content" className="p-12 space-y-10 overflow-y-auto print-page flex-1">
                      {/* Header Invoice */}
                      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-dashed border-gray-200 pb-8 mb-4">
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                          <img src={bgLogo} className="h-16 w-16 object-contain" referrerPolicy="no-referrer" />
                          <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">BALOENG GEDHE</h1>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1">Premium Apparel Manufacturing</p>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <h2 className="text-xl font-black text-red-700 tracking-tight">INVOICE CUSTOM ORDER</h2>
                          <p className="text-sm font-extrabold text-slate-600 mt-1">No. {order.invoice_no || "-"}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1">
                            Tanggal Invoice: {order.created_at
                              ? new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) 
                              : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Informasi Order */}
                      <div className="p-8 bg-slate-50 rounded-3xl border border-gray-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">INFORMASI ORDER</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Invoice</p>
                            <p className="font-extrabold text-slate-800 mt-1">{order.invoice_no || "-"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Invoice</p>
                            <p className="font-extrabold text-slate-800 mt-1">
                              {order.created_at
                                ? new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) 
                                : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Customer</p>
                            <p className="font-extrabold text-slate-800 mt-1">{order.customer_name || order.customer || "-"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan</p>
                            <p className="font-extrabold text-slate-800 mt-1">{order.customer_company || "-"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Detail Produk */}
                      <div className="p-8 bg-slate-50 rounded-3xl border border-gray-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">DETAIL PRODUK</h3>
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
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 sm:p-5">{order.product_name || order.product || "-"}</td>
                                <td className="p-4 sm:p-5 text-center">{qty} Pcs</td>
                                <td className="p-4 sm:p-5 text-right">Rp {price.toLocaleString("id-ID")}</td>
                                <td className="p-4 sm:p-5 text-right text-red-700">Rp {subtotal.toLocaleString("id-ID")}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Ringkasan Pembayaran */}
                      <div className="p-8 bg-slate-50 rounded-3xl border border-gray-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">RINGKASAN PEMBAYARAN</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Status */}
                          <div className="flex flex-col justify-center items-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm col-span-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">STATUS PEMBAYARAN</p>
                            <span className={`px-4 py-2 rounded-full border text-xs font-black tracking-widest uppercase ${badgeColor}`}>
                              {displayStatus}
                            </span>
                          </div>

                          {/* Calculations */}
                          <div className="space-y-3 font-bold text-slate-600 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm col-span-1">
                            <div className="flex justify-between text-xs">
                              <span>Subtotal</span>
                              <span className="text-slate-800">Rp {subtotal.toLocaleString("id-ID")}</span>
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
                              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="border-t border-gray-200 p-8 flex gap-3 justify-end items-center bg-slate-50/10 no-print">
                      <button
                        onClick={() => setShowInvoiceModal(false)}
                        className="px-8 py-4 rounded-2xl border border-gray-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-white transition"
                      >
                        Tutup
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition shadow-lg"
                      >
                        Print Invoice
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

/* ================= COMPONENT ================= */

function InfoBox({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest text-gray-400">
        {title}
      </p>
      <h3 className="font-bold text-lg mt-2">
        {value}
      </h3>
    </div>
  )
}
