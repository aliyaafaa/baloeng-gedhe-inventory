import { useState } from "react"
import { useApp, MaterialDraftItem } from "../context/AppContext"

const FABRIC_OPTIONS = [
  "Cotton Combed 20s",
  "Cotton Combed 24s",
  "Cotton Combed 30s",
  "Cotton Carded 20s",
  "Cotton Carded 24s",
  "Cotton Carded 30s",
  "Lacoste CVC",
  "Lacoste PE",
  "Lacoste Cotton",
  "Drill",
  "American Drill",
  "Japan Drill",
  "Ripstop",
  "Twill",
  "Canvas",
  "Taslan",
  "Fleece",
  "Baby Terry",
  "Parasut",
  "Oxford",
  "Denim",
  "Polyester",
  "Hyget",
  "Mesh",
  "Satin",
  "Katun Jepang"
]

const MAIN_MATERIAL_GROUPS = {
  "Bordir": [
    "Benang Bordir Rayon",
    "Benang Bordir Polyester"
  ],
  "Sablon": [
    "Plastisol",
    "Rubber",
    "DTF",
    "Polyflex",
    "Sublim"
  ],
  "Jahit": [
    "Benang Jahit",
    "Resleting",
    "Kancing",
    "Velcro",
    "Karet Pinggang"
  ],
  "Aksesoris": [
    "Label Brand",
    "Hangtag",
    "Polybag",
    "Packaging Box"
  ]
}

const ALL_MAIN_MATERIALS = [
  "Benang Bordir Rayon",
  "Benang Bordir Polyester",
  "Plastisol",
  "Rubber",
  "DTF",
  "Polyflex",
  "Sublim",
  "Benang Jahit",
  "Resleting",
  "Kancing",
  "Velcro",
  "Karet Pinggang",
  "Label Brand",
  "Hangtag",
  "Polybag",
  "Packaging Box"
]

export default function InventoryPage() {
  const {
    materialDrafts,
    updateMaterialItem,
    saveMaterialUsageToStock,
    warehouseStock,
    addMaterialExpense,
    addOtherMaterialItem,
    settings,
  } = useApp()

  const [searchDraft, setSearchDraft] = useState("")
  const [statusFilter, setStatusFilter] = useState("Semua")
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null)
  const [manualRows, setManualRows] = useState<Record<number, boolean>>({})
  const [selectedDraft, setSelectedDraft] = useState<number | null>(null)

  const getProgress = (item: MaterialDraftItem) => {
    const need = Number(item.volumeNeed || 0)
    const bought = Number(item.volumeBought || 0)

    if (need === 0) return 0

    return Math.min(Math.round((bought / need) * 100), 100)
  }

  // Filter drafts based on search query and status filter selection
  const filteredDrafts = materialDrafts.filter((draft) => {
    const matchesSearch =
      draft.product.toLowerCase().includes(searchDraft.toLowerCase()) ||
      draft.customer.toLowerCase().includes(searchDraft.toLowerCase())
    
    let matchesStatus = false
    const draftStatus = draft.status.toLowerCase()
    const filterValue = statusFilter.toLowerCase()

    const isCompleted = draftStatus === "completed" || draftStatus === "selesai";
    const isOnProduction = draftStatus === "on production" || draftStatus === "sedang produksi" || draftStatus === "produksi";
    const isDraftMaterial = draftStatus === "draft material" || draftStatus === "draft" || draftStatus === "open";

    if (statusFilter === "Semua") {
      matchesStatus = true
    } else if (filterValue === "draft material") {
      matchesStatus = isDraftMaterial
    } else if (filterValue === "on production") {
      matchesStatus = isOnProduction
    } else if (filterValue === "completed") {
      matchesStatus = isCompleted
    }

    return matchesSearch && matchesStatus
  })

  // Smooth scroll and load related order material data
  const handleStockCardClick = (stock: any) => {
    setSelectedStockId(stock.id)

    const matchingDraft = materialDrafts.find((draft) => {
      const stockSource = String(stock.sourceOrder || "").toLowerCase()
      const draftProd = String(draft.product || "").toLowerCase()
      const draftCust = String(draft.customer || "").toLowerCase()
      
      return (
        draftProd === stockSource ||
        draftProd.includes(stockSource) ||
        stockSource.includes(draftProd) ||
        draftCust.includes(stockSource) ||
        String(draft.orderId) === stockSource ||
        stockSource.includes(String(draft.orderId))
      )
    })

    if (matchingDraft) {
      setTimeout(() => {
        document
          .getElementById(`draft-${matchingDraft.id}`)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
      }, 100)
    }
  }

  const activeDraft = materialDrafts.find(
    (draft) => draft.id === selectedDraft
  )

  console.log("warehouseStock", warehouseStock)
  console.log("materialDrafts", materialDrafts)

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mb-8">

        <h1 className="page-title">
          Inventaris Stok
        </h1>

        <p className="page-subtitle">
          Kelola kebutuhan material dan sisa stok gudang
        </p>

      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-5 sm:p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="w-full">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Cari Draf</label>
          <input
            type="text"
            placeholder="Cari produk atau nama customer..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
          />
        </div>

      </div>

      {/* LIST STOK GUDANG */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 sm:p-8 mb-8 shadow-sm">

        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          Sisa Stok Gudang
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-gray-200 text-left">

                <th className="py-4 text-xs uppercase tracking-widest text-slate-400">
                  Customer
                </th>

                <th className="text-xs uppercase tracking-widest text-slate-400">
                  Produk
                </th>

                <th className="text-xs uppercase tracking-widest text-slate-400">
                  Sisa Stok
                </th>

                <th className="text-xs uppercase tracking-widest text-slate-400">
                  Satuan
                </th>

                <th className="text-xs uppercase tracking-widest text-slate-400">
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody>

              {warehouseStock.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Belum ada sisa material yang masuk ke stok gudang.
                  </td>
                </tr>
              ) : (
                warehouseStock.map((s) => {
                  const draftObj =
                    materialDrafts.find(
                      (d) =>
                        d.product === s.materialName
                    ) ||
                    materialDrafts.find(
                      (d) =>
                        d.product
                          .toLowerCase()
                          .includes(
                            s.materialName.toLowerCase()
                          )
                    )

                  const stock = {
                    ...s,
                    customerName: draftObj?.customer || "Tidak ditemukan",
                    draftId: draftObj?.id || null
                  }

                  return (
                    <tr
                      key={stock.id}
                      className="border-b border-slate-100"
                    >

                      <td className="py-5 font-semibold text-slate-800 text-sm">
                        {stock.customerName}
                      </td>

                      <td className="text-slate-700 text-sm">
                        {stock.materialName}
                      </td>

                      <td className="font-bold text-red-700 text-sm">
                        {stock.stockLeft}
                      </td>

                      <td className="text-slate-600 text-sm">
                        {stock.unit}
                      </td>

                      <td>

                        <button
                          onClick={() => {
                            console.log("Stock:", stock)
                            console.log("Draft:", draftObj)

                            if (stock.draftId) {
                              setSelectedDraft(stock.draftId)

                              setTimeout(() => {
                                document
                                  .getElementById("material-section")
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start"
                                  })
                              }, 100)
                            }
                          }}
                          className="bg-red-700 text-white px-5 py-2 rounded-xl font-semibold"
                        >
                          Kelola Material
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

      {/* DRAFT MATERIAL */}
      <div className="space-y-6">

        {activeDraft && (
          <div id="material-section" className="bg-white rounded-[32px] border border-gray-200 p-8 mt-8 shadow-sm">

            <div className="flex justify-between items-start mb-8">

              <div>
                <p className="text-xs tracking-widest uppercase text-slate-400 font-bold">
                  Pembelanjaan Material
                </p>

                <h2 className="text-4xl font-bold mt-2 text-slate-800">
                  {activeDraft.product}
                </h2>

                <p className="text-slate-500 mt-2 font-medium">
                  Customer: {activeDraft.customer}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-6 py-3 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-xs uppercase tracking-wider">
                  {activeDraft.status}
                </span>
                <button
                  onClick={() => setSelectedDraft(null)}
                  className="border px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 border-slate-200 text-slate-600 transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1300px]">

                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest font-black text-gray-400 border-b border-gray-200">
                    <th className="py-4">Kategori</th>
                    <th>Material</th>
                    <th>Detail Material</th>
                    <th>Kebutuhan Total</th>
                    <th>Volume Belanja</th>
                    <th>Harga Satuan</th>
                    <th>Total Belanja</th>
                    <th>Progress</th>
                    <th>Volume Penggunaan</th>
                    <th>Sisa</th>
                  </tr>
                </thead>

                <tbody>
                  {activeDraft.items.map((item) => {
                    const progress = getProgress(item)
                    const bought = Number(item.volumeBought || 0)
                    const used = Number(item.volumeUsed || 0)
                    const stockLeft = bought - used

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100"
                      >

                        <td className="py-6 font-bold text-slate-700 text-lg">
                          {item.category}
                        </td>

                        <td>
                          {item.category === "Lain-lain" ? (
                            <input
                              type="text"
                              value={item.materialName}
                              onChange={(e) =>
                                updateMaterialItem(
                                  activeDraft.id,
                                  item.id,
                                  "materialName",
                                  e.target.value
                                )
                              }
                              placeholder="Tulis material lain-lain"
                              className="w-full border border-gray-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                            />
                          ) : item.category === "Kain" ? (
                            (() => {
                              const isManualFabric = manualRows[item.id] || (item.materialName && !FABRIC_OPTIONS.includes(item.materialName))
                              if (isManualFabric) {
                                return (
                                  <div className="flex gap-2 items-center min-w-[200px]">
                                    <input
                                      type="text"
                                      value={item.materialName}
                                      onChange={(e) =>
                                        updateMaterialItem(
                                          activeDraft.id,
                                          item.id,
                                          "materialName",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Tulis jenis kain..."
                                      className="w-full border border-gray-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    />
                                    <button
                                      onClick={() => {
                                        setManualRows(prev => ({ ...prev, [item.id]: false }))
                                        updateMaterialItem(activeDraft.id, item.id, "materialName", "")
                                      }}
                                      className="text-xs text-red-600 hover:underline font-bold whitespace-nowrap px-1 cursor-pointer"
                                    >
                                      Pilih Daftar
                                    </button>
                                  </div>
                                )
                              }
                              return (
                                <select
                                  value={item.materialName}
                                  onChange={(e) => {
                                    if (e.target.value === "__custom__") {
                                      setManualRows(prev => ({ ...prev, [item.id]: true }))
                                      updateMaterialItem(activeDraft.id, item.id, "materialName", "")
                                    } else {
                                      updateMaterialItem(activeDraft.id, item.id, "materialName", e.target.value)
                                    }
                                  }}
                                  className="w-full min-w-[200px] border border-gray-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none cursor-pointer"
                                >
                                  <option value="">Pilih Jenis Kain</option>
                                  {FABRIC_OPTIONS.map((material) => (
                                    <option key={material} value={material}>
                                      {material}
                                    </option>
                                  ))}
                                  <option value="__custom__">- Input Manual / Kain Lainnya -</option>
                                </select>
                              )
                            })()
                          ) : item.category === "Material Utama" ? (
                            (() => {
                              const isManualMain = manualRows[item.id] || (item.materialName && !ALL_MAIN_MATERIALS.includes(item.materialName))
                              if (isManualMain) {
                                return (
                                  <div className="flex gap-2 items-center min-w-[200px]">
                                    <input
                                      type="text"
                                      value={item.materialName}
                                      onChange={(e) =>
                                        updateMaterialItem(
                                          activeDraft.id,
                                          item.id,
                                          "materialName",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Tulis material utama..."
                                      className="w-full border border-gray-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    />
                                    <button
                                      onClick={() => {
                                        setManualRows(prev => ({ ...prev, [item.id]: false }))
                                        updateMaterialItem(activeDraft.id, item.id, "materialName", "")
                                      }}
                                      className="text-xs text-red-600 hover:underline font-bold whitespace-nowrap px-1 cursor-pointer"
                                    >
                                      Pilih Daftar
                                    </button>
                                  </div>
                                )
                              }
                              return (
                                <select
                                  value={item.materialName}
                                  onChange={(e) => {
                                    if (e.target.value === "__custom__") {
                                      setManualRows(prev => ({ ...prev, [item.id]: true }))
                                      updateMaterialItem(activeDraft.id, item.id, "materialName", "")
                                    } else {
                                      updateMaterialItem(activeDraft.id, item.id, "materialName", e.target.value)
                                    }
                                  }}
                                  className="w-full min-w-[200px] border border-gray-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none cursor-pointer"
                                >
                                  <option value="">Pilih Material Utama</option>
                                  {Object.entries(MAIN_MATERIAL_GROUPS).map(([group, options]) => (
                                    <optgroup key={group} label={group}>
                                      {options.map((material) => (
                                        <option key={material} value={material}>
                                          {material}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                  <option value="__custom__">- Input Manual / Material Baru -</option>
                                </select>
                              )
                            })()
                          ) : (
                            <select
                              value={item.materialName}
                              onChange={(e) =>
                                updateMaterialItem(
                                  activeDraft.id,
                                  item.id,
                                  "materialName",
                                  e.target.value
                                )
                              }
                              className="w-full min-w-[200px] border border-gray-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none cursor-pointer"
                            >
                              <option value="">Pilih material</option>
                              {settings.material.fabrics.map((material: string) => (
                                <option key={material} value={material}>
                                  {material}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        <td>
                          <input
                            type="text"
                            value={item.materialDetail || ""}
                            onChange={(e) =>
                              updateMaterialItem(
                                activeDraft.id,
                                item.id,
                                "materialDetail",
                                e.target.value
                              )
                            }
                            placeholder="Warna / merk / spesifikasi"
                            className="w-full max-w-[200px] bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            value={item.volumeNeed}
                            onChange={(e) =>
                              updateMaterialItem(
                                activeDraft.id,
                                item.id,
                                "volumeNeed",
                                e.target.value
                              )
                            }
                            placeholder="Contoh: 10"
                            className="w-full max-w-[120px] bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            value={item.volumeBought}
                            onChange={(e) =>
                              updateMaterialItem(
                                activeDraft.id,
                                item.id,
                                "volumeBought",
                                e.target.value
                              )
                            }
                            placeholder="Contoh: 5"
                            className="w-full max-w-[120px] bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            value={item.price || ""}
                            onChange={(e) =>
                              updateMaterialItem(
                                activeDraft.id,
                                item.id,
                                "price",
                                e.target.value
                              )
                            }
                            placeholder="Harga"
                            className="w-full max-w-[120px] bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                          />
                        </td>

                        <td className="font-bold text-red-700 pr-2 min-w-[120px]">
                          Rp {(
                            Number(item.volumeBought || 0) *
                            Number(item.price || 0)
                          ).toLocaleString("id-ID")}
                        </td>

                        <td className="pr-4">
                          <div className="w-full bg-slate-100 rounded-full h-3">
                            <div
                              className="bg-red-700 h-3 rounded-full transition-all"
                              style={{
                                width: `${progress}%`,
                              }}
                            ></div>
                          </div>

                          <p className="text-xs text-gray-500 font-bold mt-2">
                            {progress}% pengadaan
                          </p>
                        </td>

                        <td>
                          <input
                            type="number"
                            value={item.volumeUsed}
                            onChange={(e) =>
                              updateMaterialItem(
                                activeDraft.id,
                                item.id,
                                "volumeUsed",
                                e.target.value
                              )
                            }
                            placeholder="Contoh: 9"
                            className="w-full max-w-[120px] bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                          />
                        </td>

                        <td className="font-bold text-red-700 text-lg">
                          {stockLeft > 0 ? stockLeft : 0} {item.unit}
                        </td>

                      </tr>
                    )
                  })}
                </tbody>

              </table>

            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">

              <button
                onClick={() => addOtherMaterialItem(activeDraft.id)}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-gray-200 bg-white font-semibold hover:border-red-700 cursor-pointer"
              >
                + Tambah Material Lain-lain
              </button>

              <button
                onClick={() => {
                  activeDraft.items.forEach((item) => {
                    if (item.materialName && item.volumeBought && item.price) {
                      addMaterialExpense({
                        category: item.category,
                        materialName: item.materialName,
                        materialDetail: item.materialDetail,
                        qty: item.volumeBought,
                        unit: item.unit,
                        price: item.price,
                        sourceOrder: activeDraft.product,
                        customer: activeDraft.customer,
                      })
                    }
                  })

                  saveMaterialUsageToStock(activeDraft.id)
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-red-700 text-white font-semibold cursor-pointer hover:bg-red-850"
              >
                Simpan Belanja & Sisa Stok
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}
