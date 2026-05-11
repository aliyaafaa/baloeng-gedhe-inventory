import { useApp } from "../context/AppContext"

export default function DashboardPage() {

  const {
    orders,
    financeData,
    productionList,
  } = useApp()

  return (

    <div className="p-6 sm:p-8">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-5">

        <div>

          <h1 className="text-4xl font-bold text-[#0F172A]">
            Dashboard Baloeng Gedhe
          </h1>

          <p className="text-gray-500 mt-3 text-lg">
            Ringkasan operasional dan keuangan hari ini
          </p>

        </div>

        <button
          className="
            px-6
            py-4
            rounded-2xl
            bg-white
            border
            border-gray-200
            shadow-sm
            font-semibold
          "
        >
          Unduh Laporan
        </button>

      </div>

      {/* CARDS */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
          mt-10
        "
      >

        {/* PENDAPATAN */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <p className="text-gray-400 uppercase text-sm tracking-widest">
            Pendapatan
          </p>

          <h2 className="text-5xl font-bold mt-5">
            Rp {
              financeData.income
                .toLocaleString()
            }
          </h2>

          <p className="text-green-600 font-semibold mt-4">
            +12.5% vs kemarin
          </p>

        </div>

        {/* ORDER */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <p className="text-gray-400 uppercase text-sm tracking-widest">
            Total Order
          </p>

          <h2 className="text-5xl font-bold mt-5">
            {orders.length}
          </h2>

          <p className="text-red-700 font-semibold mt-4">
            Order aktif
          </p>

        </div>

        {/* PRODUKSI */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <p className="text-gray-400 uppercase text-sm tracking-widest">
            Produksi Aktif
          </p>

          <h2 className="text-5xl font-bold mt-5">
            {productionList.length}
          </h2>

          <p className="text-green-600 font-semibold mt-4">
            Workflow berjalan
          </p>

        </div>

        {/* LABA */}
        <div className="bg-[#111827] rounded-3xl p-6 shadow-sm text-white">

          <p className="uppercase text-sm tracking-widest text-gray-300">
            Laba Bersih
          </p>

          <h2 className="text-5xl font-bold mt-5">

            Rp {
              financeData.profit
                .toLocaleString()
            }

          </h2>

          <p className="text-red-400 font-semibold mt-4">
            Manufacturing Profit
          </p>

        </div>

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
              value={`Rp ${financeData.income.toLocaleString()}`}
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
