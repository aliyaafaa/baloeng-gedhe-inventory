const defaultSettings = {
  business: {
    name: "Baloeng Gedhe",
    subtitle: "by 2 BD03C TUP",
    email: "hello@baloenggedhe.com",
    address: "Purwokerto Timur, Indonesia",
    adminName: "Admin Baloeng",
    adminRole: "Production Manager",
  },

  invoice: {
    prefix: "INV",
    startNumber: 12,
    paymentDefault: "Belum Bayar",
  },

  production: {
    deadlineReminderDays: 3,
    defaultStatus: "Pending",
    workflow: [
      "Invoice & Surat Kerja",
      "Pengadaan Kain",
      "Potong Kain",
      "Bordir / Sablon",
      "Jahit Produksi",
      "Quality Control",
      "Packing & Delivery",
    ],
  },

  material: {
    fabrics: ["Kain Drill", "Combed 24s", "Combed 30s"],
    units: ["kg", "meter", "pcs"],
    categories: ["Kain", "Material Utama", "Lain-lain"],
  },
}

export default defaultSettings
