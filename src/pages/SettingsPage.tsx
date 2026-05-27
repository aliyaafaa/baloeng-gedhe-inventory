import React from "react"
import { Plus, Trash2, Save } from "lucide-react"
import defaultSettings from "../data/defaultSettings"

interface SettingsPageProps {
  settings: typeof defaultSettings
  setSettings: React.Dispatch<React.SetStateAction<typeof defaultSettings>>
}

export default function SettingsPage({ settings, setSettings }: SettingsPageProps) {
  const updateBusiness = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        [field]: value,
      },
    }))
  }

  const updateInvoice = (field: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        [field]: value,
      },
    }))
  }

  const updateProduction = (field: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      production: {
        ...prev.production,
        [field]: value,
      },
    }))
  }

  const addWorkflow = () => {
    setSettings((prev) => ({
      ...prev,
      production: {
        ...prev.production,
        workflow: [...prev.production.workflow, "Tahap Baru"],
      },
    }))
  }

  const updateWorkflow = (index: number, value: string) => {
    setSettings((prev) => {
      const updated = [...prev.production.workflow]
      updated[index] = value
      return {
        ...prev,
        production: {
          ...prev.production,
          workflow: updated,
        },
      }
    })
  }

  const deleteWorkflow = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      production: {
        ...prev.production,
        workflow: prev.production.workflow.filter((_, i) => i !== index),
      },
    }))
  }

  const addMaterialOption = (type: "fabrics" | "units" | "categories") => {
    setSettings((prev) => ({
      ...prev,
      material: {
        ...prev.material,
        [type]: [...prev.material[type], ""],
      },
    }))
  }

  const updateMaterialOption = (type: "fabrics" | "units" | "categories", index: number, value: string) => {
    setSettings((prev) => {
      const updated = [...prev.material[type]]
      updated[index] = value
      return {
        ...prev,
        material: {
          ...prev.material,
          [type]: updated,
        },
      }
    })
  }

  const deleteMaterialOption = (type: "fabrics" | "units" | "categories", index: number) => {
    setSettings((prev) => ({
      ...prev,
      material: {
        ...prev.material,
        [type]: prev.material[type].filter((_, i) => i !== index),
      },
    }))
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-8" id="settings-page">
      <div>
        <h1 className="page-title" id="settings-headline">
          Pengaturan
        </h1>
        <p className="page-subtitle" id="settings-subtitle">
          Kelola data dasar sistem produksi dan keuangan
        </p>
      </div>

      {/* PROFIL USAHA */}
      <section className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm" id="business-profile-sec">
        <h2 className="text-xl font-bold mb-5 flex items-center text-slate-800">Profil Usaha</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="input-biz-name"
            label="Nama Usaha"
            value={settings.business.name}
            onChange={(e) => updateBusiness("name", e.target.value)}
          />

          <Input
            id="input-biz-email"
            label="Email"
            type="email"
            value={settings.business.email}
            onChange={(e) => updateBusiness("email", e.target.value)}
          />

          <Input
            id="input-biz-address"
            label="Alamat"
            value={settings.business.address}
            onChange={(e) => updateBusiness("address", e.target.value)}
          />

          <Input
            id="input-biz-admin-name"
            label="Nama Admin"
            value={settings.business.adminName}
            onChange={(e) => updateBusiness("adminName", e.target.value)}
          />

          <Input
            id="input-biz-admin-role"
            label="Role Admin"
            value={settings.business.adminRole}
            onChange={(e) => updateBusiness("adminRole", e.target.value)}
          />
        </div>
      </section>

      {/* INVOICE */}
      <section className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm" id="invoice-settings-sec">
        <h2 className="text-xl font-bold mb-5 text-slate-800">Pengaturan Invoice</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            id="input-inv-prefix"
            label="Prefix Invoice"
            value={settings.invoice.prefix}
            onChange={(e) => updateInvoice("prefix", e.target.value)}
          />

          <Input
            id="input-inv-start"
            label="Nomor Awal Invoice"
            type="number"
            value={settings.invoice.startNumber}
            onChange={(e) => updateInvoice("startNumber", Number(e.target.value))}
          />

          <Select
            id="select-inv-payment"
            label="Status Pembayaran Default"
            value={settings.invoice.paymentDefault}
            onChange={(e) => updateInvoice("paymentDefault", e.target.value)}
            options={["Belum Bayar", "DP", "Lunas"]}
          />
        </div>
      </section>

      {/* PRODUKSI */}
      <section className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm" id="production-settings-sec">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Pengaturan Produksi</h2>
            <p className="text-sm text-gray-500">
              Workflow ini akan dipakai di Pantau Produksi
            </p>
          </div>

          <button
            onClick={addWorkflow}
            id="btn-add-workflow-step"
            className="px-4 py-3 rounded-2xl bg-red-700 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-800 transition shadow"
          >
            <Plus size={18} />
            Tambah Tahap
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            id="input-prod-reminder"
            label="Reminder Deadline H-"
            type="number"
            value={settings.production.deadlineReminderDays}
            onChange={(e) => updateProduction("deadlineReminderDays", Number(e.target.value))}
          />

          <Select
            id="select-prod-status"
            label="Status Produksi Default"
            value={settings.production.defaultStatus}
            onChange={(e) => updateProduction("defaultStatus", e.target.value)}
            options={["Pending", "Progress", "Selesai"]}
          />
        </div>

        <div className="space-y-3" id="workflow-steps-list">
          {settings.production.workflow.map((item, index) => (
            <div
              key={index}
              id={`workflow-row-${index}`}
              className="flex flex-col sm:flex-row gap-3 sm:items-center"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-700 flex items-center justify-center font-bold shrink-0">
                {index + 1}
              </div>

              <input
                value={item}
                id={`input-workflow-step-${index}`}
                onChange={(e) => updateWorkflow(index, e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-red-700"
              />

              <button
                onClick={() => deleteWorkflow(index)}
                id={`btn-delete-workflow-step-${index}`}
                className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-700 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MATERIAL */}
      <section className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-sm" id="material-settings-sec">
        <h2 className="text-xl font-bold mb-5 text-slate-800">Pengaturan Material</h2>

        <MaterialEditor
          title="Pilihan Kain"
          type="fabrics"
          data={settings.material.fabrics}
          addMaterialOption={addMaterialOption}
          updateMaterialOption={updateMaterialOption}
          deleteMaterialOption={deleteMaterialOption}
        />

        <MaterialEditor
          title="Satuan"
          type="units"
          data={settings.material.units}
          addMaterialOption={addMaterialOption}
          updateMaterialOption={updateMaterialOption}
          deleteMaterialOption={deleteMaterialOption}
        />

        <MaterialEditor
          title="Kategori Material"
          type="categories"
          data={settings.material.categories}
          addMaterialOption={addMaterialOption}
          updateMaterialOption={updateMaterialOption}
          deleteMaterialOption={deleteMaterialOption}
        />
      </section>

      <div className="flex justify-end pt-4">
        <button className="px-6 py-4 rounded-2xl bg-red-700 text-white font-bold flex items-center gap-2 shadow hover:bg-red-800 transition">
          <Save size={18} />
          Pengaturan Tersimpan Otomatis
        </button>
      </div>
    </div>
  )
}

interface InputProps {
  label: string
  id?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}

function Input({ label, ...props }: InputProps) {
  return (
    <label className="block w-full">
      <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
        {label}
      </span>
      <input
        {...props}
        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-red-700 bg-white text-slate-800"
      />
    </label>
  )
}

interface SelectProps {
  label: string
  id?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options?: string[]
}

function Select({ label, options = [], ...props }: SelectProps) {
  return (
    <label className="block w-full">
      <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
        {label}
      </span>
      <select
        {...props}
        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-red-700 bg-white text-slate-800"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

interface MaterialEditorProps {
  title: string
  type: "fabrics" | "units" | "categories"
  data: string[]
  addMaterialOption: (type: "fabrics" | "units" | "categories") => void
  updateMaterialOption: (type: "fabrics" | "units" | "categories", index: number, value: string) => void
  deleteMaterialOption: (type: "fabrics" | "units" | "categories", index: number) => void
}

function MaterialEditor({
  title,
  type,
  data,
  addMaterialOption,
  updateMaterialOption,
  deleteMaterialOption,
}: MaterialEditorProps) {
  return (
    <div className="mb-8" id={`material-editor-${type}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800">{title}</h3>

        <button
          onClick={() => addMaterialOption(type)}
          id={`btn-add-meta-${type}`}
          className="text-sm font-bold text-red-700 hover:text-red-800 transition"
        >
          + Tambah
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div key={index} className="flex gap-3" id={`meta-${type}-row-${index}`}>
            <input
              value={item}
              id={`input-meta-${type}-${index}`}
              onChange={(e) => updateMaterialOption(type, index, e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-red-700 bg-white"
            />

            <button
              onClick={() => deleteMaterialOption(type, index)}
              id={`btn-delete-meta-${type}-${index}`}
              className="px-4 rounded-2xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-700 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
