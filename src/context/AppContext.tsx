import { createContext, useContext, useState, ReactNode } from "react";

interface Order {
  id: number;
  customer: string;
  product: string;
  qty: number;
  total: number;
  status: string;
  progress: number;
  createdAt: Date;
}

interface FinanceData {
  income: number;
  expense: number;
  profit: number;
}

interface StockItem {
  name: string;
  qty: number;
}

interface AppContextType {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  productionList: Order[];
  setProductionList: (list: Order[]) => void;
  financeData: FinanceData;
  setFinanceData: (data: FinanceData) => void;
  stockData: StockItem[];
  setStockData: (data: StockItem[]) => void;
  createOrder: (order: Omit<Order, 'progress'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  /* ================= ORDERS ================= */
  const [orders, setOrders] = useState<Order[]>([]);

  /* ================= PRODUKSI ================= */
  const [productionList, setProductionList] = useState<Order[]>([]);

  /* ================= KEUANGAN ================= */
  const [financeData, setFinanceData] = useState<FinanceData>({
    income: 0,
    expense: 0,
    profit: 0,
  });

  /* ================= STOK ================= */
  const [stockData, setStockData] = useState<StockItem[]>([
    { name: "Kain Linen", qty: 120 },
    { name: "Cotton Combed", qty: 80 },
    { name: "Denim", qty: 45 },
  ]);

  /* ================= CREATE ORDER ================= */
  const createOrder = (order: Omit<Order, 'progress'>) => {
    const fullOrder = { ...order, progress: 10 }; // Initial progress 10%

    /* SAVE ORDER */
    setOrders((prev) => [...prev, fullOrder]);

    /* SAVE TO PRODUCTION */
    setProductionList((prev) => [...prev, fullOrder]);

    /* UPDATE FINANCE */
    setFinanceData((prev) => ({
      ...prev,
      income: prev.income + order.total,
      profit: prev.profit + order.total,
    }));

    /* UPDATE STOCK (simulation) */
    setStockData((prev) =>
      prev.map((item) => ({
        ...item,
        qty: item.qty > 0 ? item.qty - 5 : 0,
      }))
    );
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        setOrders,
        productionList,
        setProductionList,
        financeData,
        setFinanceData,
        stockData,
        setStockData,
        createOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
