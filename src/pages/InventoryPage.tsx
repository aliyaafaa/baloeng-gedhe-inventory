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
        
        <div className="w-full md:w-auto flex-1 max-w-md">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Cari Draf</label>
          <input
            type="text"
            placeholder="Cari produk atau nama customer..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
          />
        </div>

        <div className="w-full md:w-48">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Filter Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm cursor-pointer"
          >
            <option value="Semua">Semua Order</option>
            <option value="Draft Material">Draft Material</option>
            <option value="On Production">On Production</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

      </div>

      {/* STOK GUDANG */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 sm:p-8 mb-8 shadow-sm">


        <h2 className="text-2xl font-bold mb-5 text-slate-800">
          Sisa Stok Gudang
        </h2>

        {warehouseStock.length === 0 ? (
          <p className="text-gray-400">
            Belum ada sisa material yang masuk ke stok gudang.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {warehouseStock.map((stock) => {
              const isSelected = selectedStockId === stock.id
              return (
                <div
                  key={stock.id}
                  onClick={() => handleStockCardClick(stock)}
                  className={`rounded-3xl p-5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-[#dc2626] shadow-[0_0_10px_rgba(220,38,38,0.2)] bg-red-50/20"
                      : "bg-slate-50 border border-slate-100 hover:border-red-300"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {stock.category}
                  </p>

                  <h3 className="font-bold text-xl mt-2 text-slate-800">
                    {stock.materialName}
                  </h3>

                  <p className="text-red-700 font-bold text-lg mt-3">
                    {stock.stockLeft} {stock.unit}
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    Dari order: {stock.sourceOrder}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStockCardClick(stock)
                    }}
                    className="mt-4 w-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Kelola Material
                  </button>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* QUICK SECTION NAVIGATION */}
      {filteredDrafts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-slate-800">
            Pintasan Draf Material ({filteredDrafts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {filteredDrafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() =>
                  document
                    .getElementById(`draft-${draft.id}`)
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                }
                className="bg-white border border-gray-200 rounded-3xl p-5 text-left hover:border-red-700 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                  Order #{draft.orderId}
                </p>

                <h3 className="font-bold text-xl mt-2 text-slate-800">
                  {draft.product}
                </h3>

                <p className="text-gray-500 mt-1 text-sm font-medium">
                  {draft.customer}
                </p>

                <span className="inline-block mt-4 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-wider">
                  {draft.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DRAFT MATERIAL */}
      <div className="space-y-6">

        {filteredDrafts.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-400 font-medium">
              Tidak ada draf pembelanjaan material yang cocok.
            </p>
          </div>
        ) : (
          filteredDrafts.map((draft) => {
            const isHighlightedDraft = selectedStockId
              ? (() => {
                  const stockItem = warehouseStock.find((s) => s.id === selectedStockId)
                  if (!stockItem) return false
                  const stockSource = String(stockItem.sourceOrder || "").toLowerCase()
                  const draftProd = String(draft.product || "").toLowerCase()
                  const draftCust = String(draft.customer || "").toLowerCase()

                  return (
                    draftProd === stockSource ||
                    draftProd.includes(stockSource) ||
                    stockSource.includes(draftProd) ||
                    draftCust.includes(stockSource) ||
                    String(draft.orderId) === stockSource
                  )
                })()
              : false

            return (
              <div
                id={`draft-${draft.id}`}
                key={draft.id}
                className={`bg-white rounded-[32px] p-6 sm:p-8 shadow-sm scroll-mt-6 transition-all duration-300 ${
                  isHighlightedDraft
                    ? "border-2 border-[#dc2626] shadow-[0_0_15px_rgba(220,38,38,0.15)] ring-2 ring-red-100 bg-red-50/5"
                    : "border border-gray-200"
                }`}
              >

                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">

                  <div>

                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Pembelanjaan Material
                    </p>

                    <h2 className="text-3xl font-black mt-2 text-slate-800">
                      {draft.product}
                    </h2>

                    <p className="text-gray-500 font-medium mt-1">
                      Customer: {draft.customer}
                    </p>

                  </div>

                  <span className="px-5 py-2.5 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs tracking-wider uppercase w-fit">
                    {draft.status}
                  </span>

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
                      {draft.items.map((item) => {
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
                                      draft.id,
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
                                              draft.id,
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
                                            updateMaterialItem(draft.id, item.id, "materialName", "")
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
                                          updateMaterialItem(draft.id, item.id, "materialName", "")
                                        } else {
                                          updateMaterialItem(draft.id, item.id, "materialName", e.target.value)
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
                                              draft.id,
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
                                            updateMaterialItem(draft.id, item.id, "materialName", "")
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
                                          updateMaterialItem(draft.id, item.id, "materialName", "")
                                        } else {
                                          updateMaterialItem(draft.id, item.id, "materialName", e.target.value)
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
                                      draft.id,
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
                                  draft.id,
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
                                  draft.id,
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
                                  draft.id,
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
                                  draft.id,
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
                                  draft.id,
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
                  onClick={() => addOtherMaterialItem(draft.id)}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-gray-200 bg-white font-semibold hover:border-red-700"
                >
                  + Tambah Material Lain-lain
                </button>

                <button
                  onClick={() => {
                    draft.items.forEach((item) => {
                      if (item.materialName && item.volumeBought && item.price) {
                        addMaterialExpense({
                          category: item.category,
                          materialName: item.materialName,
                          materialDetail: item.materialDetail,
                          qty: item.volumeBought,
                          unit: item.unit,
                          price: item.price,
                          sourceOrder: draft.product,
                          customer: draft.customer,
                        })
                      }
                    })

                    saveMaterialUsageToStock(draft.id)
                  }}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-red-700 text-white font-semibold"
                >
                  Simpan Belanja & Sisa Stok
                </button>

              </div>

            </div>
          )
        })
        )}

      </div>

    </div>
  )
}
