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

export default function TrackingPage() {

  const [selectedBatch, setSelectedBatch] =
    useState(1)

  const [workflowData, setWorkflowData] =
    useState([

      {
        id: 1,

        customer:
          "PT Patra Niaga",

        product:
          "PDL PDH Lapangan",

        qty: 500,

        deadline:
          "25 Mei 2026",

        progress: 64,

        status:
          "Sedang Produksi",

        steps: [

          {
            id: 1,

            title:
              "Pengadaan Kain",

            desc:
              "Kain drill dan bahan pelengkap tersedia.",

            status:
              "done",

            progress: 100,

            icon: Package,
          },

          {
            id: 2,

            title:
              "Potong Kain",

            desc:
              "500 pcs pola berhasil dipotong.",

            status:
              "done",

            progress: 100,

            icon: Scissors,
          },

          {
            id: 3,

            title:
              "Bordir Logo",

            desc:
              "Logo dada dan lengan selesai.",

            status:
              "done",

            progress: 100,

            icon: Shirt,
          },

          {
            id: 4,

            title:
              "Jahit Produksi",

            desc:
              "320 pcs selesai dijahit.",

            status:
              "progress",

            progress: 64,

            icon: Pencil,
          },

          {
            id: 5,

            title:
              "Quality Control",

            desc:
              "Menunggu jahit selesai.",

            status:
              "pending",

            progress: 0,

            icon: Search,
          },

          {
            id: 6,

            title:
              "Packing & Delivery",

            desc:
              "Menunggu QC selesai.",

            status:
              "pending",

            progress: 0,

            icon: Truck,
          },
        ],
      },

      /* ================= PRODUK 2 ================= */

      {
        id: 2,

        customer:
          "Bank Mandiri",

        product:
          "Kaos Gathering",

        qty: 300,

        deadline:
          "30 Mei 2026",

        progress: 25,

        status:
          "Cutting",

        steps: [

          {
            id: 1,
            title:
              "Pengadaan Kain",
            desc:
              "Material tersedia.",
            status:
              "done",
            progress: 100,
            icon: Package,
          },

          {
            id: 2,
            title:
              "Potong Kain",
            desc:
              "75 pcs selesai dipotong.",
            status:
              "progress",
            progress: 25,
            icon: Scissors,
          },

          {
            id: 3,
            title:
              "Sablon",
            desc:
              "Belum dimulai.",
            status:
              "pending",
            progress: 0,
            icon: Shirt,
          },
        ],
      },
    ])

  const selectedData =
    workflowData.find(
      (item) =>
        item.id === selectedBatch
    ) || workflowData[0];

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

  const [batchForm, setBatchForm] =
    useState({
      customer: "",
      product: "",
      qty: 0,
      deadline: "",
      status: "",
    })

  const openBatchEdit = () => {
    setBatchForm({
      customer: selectedData.customer,
      product: selectedData.product,
      qty: selectedData.qty,
      deadline: selectedData.deadline,
      status: selectedData.status,
    })
    setShowBatchEdit(true)
  }

  const saveBatchEdit = () => {
    const updated =
      workflowData.map((batch) => {
        if (
          batch.id === selectedBatch
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
    const updated =
      workflowData.map((batch) => {
        if (
          batch.id === selectedBatch
        ) {
          const updatedSteps =
            batch.steps.map((step) => {
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
                (acc, item) =>
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

    const updated =
      workflowData.map((batch) => {

        if (
          batch.id === selectedBatch
        ) {

          const updatedSteps =
            batch.steps.map((step) => {

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
                (acc, item) =>
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

  return (

    <div className="p-6 sm:p-8">

      {/* HEADER */}
      <div className="flex justify-between items-start gap-5 flex-wrap">

        <div>

          <h1 className="text-5xl font-bold text-[#0F172A]">
            Pantau Produksi
          </h1>

          <p className="text-gray-500 mt-3 text-lg">
            Monitoring realtime produksi garment
          </p>

        </div>

      </div>

      {/* ================= BATCH LIST ================= */}

      <div className="flex gap-4 overflow-auto mt-8 pb-2">

        {workflowData.map((batch) => (

          <button
            key={batch.id}
            onClick={() =>
              setSelectedBatch(
                batch.id
              )
            }
            className={`
              min-w-[320px]
              rounded-3xl
              p-5
              border
              transition
              text-left

              ${
                selectedBatch ===
                batch.id
                  ? "bg-red-700 text-white border-red-700"
                  : "bg-white border-gray-200"
              }
            `}
          >

            <div className="flex justify-between items-start">

              <div>

                <h2 className="font-bold text-2xl">
                  {batch.product}
                </h2>

                <p
                  className={`
                    mt-2

                    ${
                      selectedBatch ===
                      batch.id
                        ? "text-red-100"
                        : "text-gray-500"
                    }
                  `}
                >
                  {batch.customer}
                </p>

              </div>

              <span
                className="
                  text-xs
                  px-3
                  py-2
                  rounded-full
                  bg-white/20
                "
              >
                {batch.progress}%
              </span>

            </div>

            {/* PROGRESS */}
            <div
              className={`
                w-full
                h-3
                rounded-full
                mt-5

                ${
                  selectedBatch ===
                  batch.id
                    ? "bg-white/20"
                    : "bg-gray-100"
                }
              `}
            >

              <div
                className="h-3 rounded-full bg-white"
                style={{
                  width:
                    `${batch.progress}%`
                }}
              ></div>

            </div>

          </button>

        ))}

      </div>

      {/* ================= DETAIL ================= */}

      <div
        className="
          bg-white
          rounded-[32px]
          p-6
          sm:p-8
          mt-8
          border
          border-gray-200
        "
      >

        {/* TOP */}
        <div
          className="
            grid
            grid-cols-1 md:grid-cols-2
            xl:grid-cols-4
            gap-5
          "
        >

          <InfoCard
            title="Customer"
            value={
              selectedData.customer
            }
          />

          <InfoCard
            title="Produk"
            value={
              selectedData.product
            }
          />

          <InfoCard
            title="Quantity"
            value={`${selectedData.qty} pcs`}
          />

          <InfoCard
            title="Deadline"
            value={
              selectedData.deadline
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

            <div className="flex items-center gap-3">
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

          </div>

          {/* STEPS */}
          <div className="space-y-8 mt-10">

            {selectedData.steps.map(
              (step) => {

                const Icon =
                  step.icon

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
                                    `${step.progress}%`,
                                }}
                              ></div>

                            </div>

                            <p className="text-sm text-gray-400 mt-2">

                              {step.progress}% selesai

                            </p>

                          </div>

                        </div>

                      </div>

                      {/* RIGHT */}
                      <div className="flex gap-3 flex-wrap h-fit">

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

        </div>

      </div>

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

    </div>
  )
}

/* ================= COMPONENT ================= */

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {

  return (

    <div
      className="
        bg-gray-50
        rounded-3xl
        p-5
      "
    >

      <p
        className="
          text-gray-400
          uppercase
          text-xs
          tracking-[0.2em]
        "
      >
        {title}
      </p>

      <h3 className="text-2xl font-bold mt-3">
        {value}
      </h3>

    </div>
  )
}
