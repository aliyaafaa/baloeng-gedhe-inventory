const defaultSettings = {
  business: {
    companyName: "Baloeng Gedhe",
    subtitle: "by 2 BD03C TUP",
    companyEmail: "",
    adminEmail: "baloenggedheindonesia@gmail.com",
    address: "Purwokerto Timur, Indonesia",
    adminRole: "Production Manager",
  },

  invoice: {
    prefix: "INV",
    startNumber: 1,
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
}

export default defaultSettings
