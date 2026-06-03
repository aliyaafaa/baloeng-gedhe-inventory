import { useApp } from "../context/AppContext"

export default function DashboardPage() {

  const {
    orders,
    warehouseStock,
    expenseRecords,
    productionList,
    settings,
  } = useApp()

  const totalIncome = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  )

  const totalExpense = expenseRecords.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  )

  const netProfit = totalIncome - totalExpense

  const produksiAktif = orders.filter(
    (order) => order.status !== "Draft"
  ).length

  const formatRupiah = (value: number) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`
  }

  return (

    <div className="p-6 sm:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="page-title">
          Dashboard {settings.business.companyName}
        </h1>
        <p className="page-subtitle">
          Ringkasan operasional dan keuangan hari ini
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">

        <DashboardCard
          title="Pendapatan"
          value={formatRupiah(totalIncome)}
          desc={orders.length === 0 ? "Belum ada pemasukan" : "+12.5% vs kemarin"}
        />

        <DashboardCard
          title="Total Order"
          value={orders.length}
          desc="Order aktif"
        />

        <DashboardCard
          title="Produksi Aktif"
          value={produksiAktif}
          desc="Workflow berjalan"
        />

        <DashboardCard
          title="Sisa Stok Gudang"
          value={warehouseStock.length}
          desc="Material tersedia"
        />

        <DashboardCard
          dark
          title="Laba Bersih"
          value={formatRupiah(netProfit)}
          desc="Manufacturing Profit"
        />

      </div>

      {/* CONTENT */}
      <div
        className="
          grid
          grid-cols-1
          2xl:grid-cols-12
          gap-6
          mt-10
        "
      >

        {/* STATUS PRODUKSI */}
        <div
          className="
            2xl:col-span-8
            bg-white
            rounded-3xl
            p-7
            shadow-sm
            border
            border-gray-100
          "
        >

          <div className="flex justify-between items-center mb-8">

            <h2 className="text-3xl font-bold">
              Status Produksi
            </h2>

            <span className="text-gray-400">
              Live Workflow
            </span>

          </div>

          <div className="space-y-8">

            {productionList.map((item) => (

              <div key={item.id}>

                <div className="flex justify-between mb-3">

                  <h3 className="font-bold text-xl">
                    {item.product}
                  </h3>

                  <span className="font-semibold">
                    {item.progress}%
                  </span>

                </div>

                <div className="w-full h-3 bg-gray-100 rounded-full">

                  <div
                    className="h-3 rounded-full bg-red-700"
                    style={{
                      width:
                        `${item.progress}%`
                    }}
                  ></div>

                </div>

                <p className="text-gray-400 mt-2 text-sm">

                  {item.status}

                </p>

              </div>

            ))}

          </div>

        </div>

        {/* MONITORING */}
        <div
          className="
            2xl:col-span-4
            bg-white
            rounded-3xl
            p-7
            shadow-sm
            border
            border-gray-100
          "
        >

          <h2 className="text-3xl font-bold">
            Monitoring
          </h2>

          <div className="space-y-5 mt-8">

            <MonitoringCard
              title="Invoice Terbit"
              value={orders.length}
              color="bg-green-500"
            />

            <MonitoringCard
              title="Rekap Order"
              value={productionList.length}
              color="bg-red-600"
            />

            <MonitoringCard
              title="Rekap Omset"
              value={formatRupiah(totalIncome)}
              color="bg-blue-500"
            />

          </div>

        </div>

      </div>

    </div>
  )
}

function MonitoringCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {

  return (

    <div
      className="
        flex
        justify-between
        items-center
        bg-gray-50
        rounded-2xl
        p-5
      "
    >

      <div className="flex items-center gap-4">

        <div
          className={`
            w-4
            h-4
            rounded-full
            ${color}
          `}
        ></div>

        <h3 className="font-semibold text-lg">
          {title}
        </h3>

      </div>

      <span className="font-bold text-xl">
        {value}
      </span>

    </div>
  )
}

function DashboardCard({
  title,
  value,
  desc,
  dark,
}: {
  title: string;
  value: string | number;
  desc: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 min-h-[150px] overflow-hidden ${
        dark
          ? "bg-[#0F172A] text-white border-[#0F172A]"
          : "bg-white text-[#0F172A] border-gray-200"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-widest font-bold ${
          dark ? "text-white" : "text-gray-400"
        }`}
      >
        {title}
      </p>

      <h2 className="mt-5 text-2xl sm:text-3xl font-bold break-words leading-tight">
        {value}
      </h2>

      <p
        className={`text-sm mt-4 font-semibold ${
          dark ? "text-red-300" : "text-green-600"
        }`}
      >
        {desc}
      </p>
    </div>
  )
}
