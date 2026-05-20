import React, { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import {
  Download,
  Wallet,
  ReceiptText,
  TrendingUp,
  FileText,
} from "lucide-react"

import { useApp } from "../context/AppContext"

export default function FinancePage() {
  const {
    orders,
    expenseRecords,
    updateExpenseRecord,
  } = useApp()

  const [yearFilter, setYearFilter] = useState("2026")

  const totalIncome = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  )

  const totalExpense = expenseRecords.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  )

  const netProfit = totalIncome - totalExpense

  const transactionCount =
    orders.length + expenseRecords.length

  const chartData = [
    {
      month: "Jan",
      income: 0,
      expense: 0,
    },
    {
      month: "Feb",
      income: 0,
      expense: 0,
    },
    {
      month: "Mar",
      income: 0,
      expense: 0,
    },
    {
      month: "Apr",
      income: 0,
      expense: 0,
    },
    {
      month: "Mei",
      income: totalIncome,
      expense: totalExpense,
    },
    {
      month: "Jun",
      income: 0,
      expense: 0,
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            Laporan Keuangan
          </h1>

          <p className="text-gray-500 mt-2 text-md">
            Ringkasan pemasukan, pengeluaran, dan laba usaha Baloeng Gedhe
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full md:w-auto px-6 py-4 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-100 transition-all hover:translate-y-[-2px] active:translate-y-0 cursor-pointer"
        >
          <Download size={18} />
          Ekspor PDF
        </button>

      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <SummaryCard
          title="Total Pendapatan"
          value={`Rp ${totalIncome.toLocaleString("id-ID")}`}
          desc="Dari order POS"
          icon={<Wallet size={20} />}
          colorClass="text-emerald-600 bg-emerald-50"
        />

        <SummaryCard
          title="Pengeluaran"
          value={`Rp ${totalExpense.toLocaleString("id-ID")}`}
          desc="Pembelian material"
          icon={<ReceiptText size={20} />}
          colorClass="text-rose-600 bg-rose-50"
        />

        <SummaryCard
          title="Laba Bersih"
          value={`Rp ${netProfit.toLocaleString("id-ID")}`}
          desc="Pendapatan - pengeluaran"
          icon={<TrendingUp size={20} />}
          colorClass="text-blue-600 bg-blue-50"
        />

        <SummaryCard
          title="Total Transaksi"
          value={transactionCount.toString()}
          desc="Order dan pembelian"
          icon={<FileText size={20} />}
          colorClass="text-purple-600 bg-purple-50"
        />

      </div>

      {/* CHART */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 sm:p-8 mb-8 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Analisis Keuangan Bulanan
          </h2>

          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="2026">Tahun 2026</option>
          </select>

        </div>

        <div className="h-[280px] sm:h-[360px]">

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="font-bold text-slate-400 text-xs" />
              <YAxis tickLine={false} axisLine={false} className="font-bold text-slate-400 text-xs" />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }}
                formatter={(value) =>
                  `Rp ${Number(value).toLocaleString("id-ID")}`
                }
              />
              <Bar dataKey="income" name="Pemasukan" fill="#C0392B" radius={[8, 8, 0, 0]} barSize={24} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#9CA3AF" radius={[8, 8, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* EXPENSE TABLE */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 sm:p-8 mb-8 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Pencatatan Pembelian Material
            </h2>

            <p className="text-gray-500 mt-1 text-sm font-medium">
              Data otomatis dari halaman Inventaris Stok
            </p>
          </div>

        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-150">

          <table className="w-full min-w-[1000px] border-collapse bg-white">

            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="p-4 border-r border-slate-200">Tanggal</th>
                <th className="p-4 border-r border-slate-200">Customer</th>
                <th className="p-4 border-r border-slate-200">Order</th>
                <th className="p-4 border-r border-slate-200">Kategori</th>
                <th className="p-4 border-r border-slate-200">Material</th>
                <th className="p-4 border-r border-slate-200">Detail</th>
                <th className="p-4 border-r border-slate-200 text-center">Qty</th>
                <th className="p-4 border-r border-slate-200 text-right">Harga</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {expenseRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-12 text-center text-slate-400 font-medium bg-white"
                  >
                    Belum ada pembelian material.
                  </td>
                </tr>
              ) : (
                expenseRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm text-slate-700">
                    <td className="p-3 border">
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          updateExpenseRecord(item.id, "date", e.target.value)
                        }
                        className="w-full bg-transparent outline-none"
                      />
                    </td>

                    <td className="p-3 border">
                      <input
                        value={item.customer}
                        onChange={(e) =>
                          updateExpenseRecord(item.id, "customer", e.target.value)
                        }
                        className="w-full bg-transparent outline-none"
                      />
                    </td>

                    <td className="p-3 border">
                      <input
                        value={item.sourceOrder}
                        onChange={(e) =>
                          updateExpenseRecord(item.id, "sourceOrder", e.target.value)
                        }
                        className="w-full bg-transparent outline-none"
                      />
                    </td>

                    <td className="p-3 border">
                      <input
                        value={item.category}
                        onChange={(e) =>
                          updateExpenseRecord(item.id, "category", e.target.value)
                        }
                        className="w-full bg-transparent outline-none"
                      />
                    </td>

                    <td className="p-3 border">
                      <input
                        value={item.materialName}
                        onChange={(e) =>
                          updateExpenseRecord(item.id, "materialName", e.target.value)
                        }
                        className="w-full bg-transparent outline-none font-semibold"
                      />
                    </td>

                    <td className="p-3 border">
                      <input
                        value={item.materialDetail || ""}
                        onChange={(e) =>
                          updateExpenseRecord(item.id, "materialDetail", e.target.value)
                        }
                        className="w-full bg-transparent outline-none"
                      />
                    </td>

                    <td className="p-3 border">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          updateExpenseRecord(item.id, "qty", e.target.value)
                        }
                        className="w-full bg-transparent outline-none"
                      />
                    </td>

                    <td className="p-3 border">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateExpenseRecord(item.id, "price", e.target.value)
                        }
                        className="w-full bg-transparent outline-none"
                      />
                    </td>

                    <td className="p-3 border font-bold text-red-700">
                      Rp {Number(item.total || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>

      </div>

      {/* INCOME TABLE */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 sm:p-8 shadow-sm">

        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-5">
          Riwayat Pendapatan dari POS
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead>
              <tr className="text-left text-xs uppercase tracking-widest font-black text-gray-400 border-b border-gray-200">
                <th className="py-4">Invoice</th>
                <th>Customer</th>
                <th>Produk</th>
                <th className="text-right">Jumlah</th>
                <th className="text-center pr-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    Belum ada order dari POS.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 text-sm text-slate-700">
                    <td className="py-5 font-bold text-slate-800">
                      INV-{order.id}
                    </td>

                    <td className="font-semibold text-slate-700">{order.customer}</td>

                    <td>{order.product}</td>

                    <td className="font-black text-emerald-700 text-right text-base">
                      Rp {Number(order.total || 0).toLocaleString("id-ID")}
                    </td>

                    <td className="text-center pr-4">
                      <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wider uppercase">
                        Masuk
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
  desc: string
  icon: React.ReactNode
  colorClass: string
}

function SummaryCard({ title, value, desc, icon, colorClass }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">

      <div className="flex justify-between items-start">

        <div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            {title}
          </p>

          <h2 className="text-2xl sm:text-3xl font-black mt-5 text-slate-800 tracking-tight">
            {value}
          </h2>

          <p className="text-xs text-slate-500 font-medium mt-3">
            {desc}
          </p>
        </div>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>

      </div>

    </div>
  )
}
