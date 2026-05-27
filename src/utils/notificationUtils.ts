import { Order } from "../context/AppContext"

export const getDaysLeft = (deadline?: string): number | null => {
  if (!deadline) return null

  const today = new Date()
  const end = new Date(deadline)

  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export interface AppNotification {
  id: string
  type: "order" | "deadline" | "late"
  title: string
  message: string
  time: string
  isRead: boolean
}

export const generateNotifications = (orders: Order[] = []): AppNotification[] => {
  const notifications: AppNotification[] = []

  orders.forEach((order) => {
    notifications.push({
      id: `order-${order.id}`,
      type: "order",
      title: "Order POS Baru Masuk",
      message: `${order.customer || "Customer"} membuat order ${
        order.product || "produk custom"
      }.`,
      time: typeof order.createdAt === "string" ? order.createdAt : (order.createdAt as any)?.toISOString?.() || new Date().toISOString(),
      isRead: false,
    })

    const daysLeft = getDaysLeft(order.deadline)

    if (daysLeft !== null && daysLeft <= 3 && daysLeft >= 0) {
      notifications.push({
        id: `deadline-${order.id}`,
        type: "deadline",
        title: "Deadline Produksi Mendekati Hari H",
        message:
          daysLeft === 0
            ? `Order ${order.product} deadline hari ini.`
            : `Order ${order.product} tersisa ${daysLeft} hari lagi.`,
        time: new Date().toISOString(),
        isRead: false,
      })
    }

    if (daysLeft !== null && daysLeft < 0) {
      notifications.push({
        id: `late-${order.id}`,
        type: "late",
        title: "Produksi Melewati Deadline",
        message: `Order ${order.product} terlambat ${Math.abs(daysLeft)} hari.`,
        time: new Date().toISOString(),
        isRead: false,
      })
    }
  })

  // Sort: show latest notifications first (order them such that newly created order or alert shows up appropriately)
  return notifications
}
