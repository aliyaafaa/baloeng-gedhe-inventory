import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Order {
  id: number;
  customer: string;
  product: string;
  qty: number;
  total: number;
  status: string;
  progress: number;
  createdAt: Date | string;
  deadline?: string;
}

export interface FinanceData {
  income: number;
  expense: number;
  profit: number;
}

export interface StockItem {
  name: string;
  qty: number;
}

export interface MaterialDraftItem {
  id: number;
  category: string;
  materialName: string;
  materialDetail: string;
  volumeNeed: string;
  volumeBought: string;
  volumeUsed: string;
  unit: string;
  price: string;
}

export interface MaterialDraft {
  id: number;
  orderId: number;
  customer: string;
  product: string;
  status: string;
  items: MaterialDraftItem[];
}

export interface WarehouseStockItem {
  id: number;
  materialName: string;
  category: string;
  stockLeft: number;
  unit: string;
  sourceOrder: string;
}

export interface ExpenseRecord {
  id: number;
  date: string;
  category: string;
  materialName: string;
  materialDetail: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
  sourceOrder: string;
  customer: string;
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
  materialOptions: string[];
  materialDrafts: MaterialDraft[];
  setMaterialDrafts: React.Dispatch<React.SetStateAction<MaterialDraft[]>>;
  warehouseStock: WarehouseStockItem[];
  setWarehouseStock: React.Dispatch<React.SetStateAction<WarehouseStockItem[]>>;
  updateMaterialItem: (draftId: number, itemId: number, field: keyof MaterialDraftItem, value: any) => void;
  saveMaterialUsageToStock: (draftId: number) => void;
  expenseRecords: ExpenseRecord[];
  addMaterialExpense: (expense: {
    category: string;
    materialName: string;
    materialDetail: string;
    qty: any;
    unit: string;
    price: any;
    sourceOrder: string;
    customer: string;
  }) => void;
  updateExpenseRecord: (id: number, field: keyof ExpenseRecord, value: any) => void;
  addOtherMaterialItem: (draftId: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const materialOptions = [
  "Kain Drill",
  "Combed 24s",
  "Combed 30s",
  "Kancing",
  "Benang",
  "Resleting",
  "Label",
  "Plastik Packaging",
];

export function AppProvider({ children }: { children: ReactNode }) {
  /* ================= ORDERS ================= */
  const [orders, setOrders] = useState<Order[]>([]);

  /* ================= PRODUKSI ================= */
  const [productionList, setProductionList] = useState<Order[]>([]);

  /* ================= KEUANGAN ================= */
  const [financeData, setFinanceData] = useState<FinanceData>({
    income: 111000000,
    expense: 23250000,
    profit: 87750000,
  });

  /* ================= STOK ================= */
  const [stockData, setStockData] = useState<StockItem[]>([
    { name: "Kain Linen", qty: 120 },
    { name: "Cotton Combed", qty: 80 },
    { name: "Denim", qty: 45 },
  ]);

  /* ================= PENYALURAN MATERIAL ================= */
  const [materialDrafts, setMaterialDrafts] = useState<MaterialDraft[]>([]);
  const [warehouseStock, setWarehouseStock] = useState<WarehouseStockItem[]>([]);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);

  const addMaterialExpense = (expense: {
    category: string;
    materialName: string;
    materialDetail: string;
    qty: any;
    unit: string;
    price: any;
    sourceOrder: string;
    customer: string;
  }) => {
    const expenseTotal = Number(expense.qty || 0) * Number(expense.price || 0);
    const newExpense: ExpenseRecord = {
      id: Date.now() + Math.random(),
      date: new Date().toISOString().split("T")[0],
      category: expense.category,
      materialName: expense.materialName,
      materialDetail: expense.materialDetail,
      qty: Number(expense.qty || 0),
      unit: expense.unit,
      price: Number(expense.price || 0),
      total: expenseTotal,
      sourceOrder: expense.sourceOrder,
      customer: expense.customer,
    };

    setExpenseRecords((prev) => [...prev, newExpense]);
    setFinanceData((prev) => ({
      ...prev,
      expense: prev.expense + expenseTotal,
      profit: prev.profit - expenseTotal,
    }));
  };

  const updateExpenseRecord = (id: number, field: keyof ExpenseRecord, value: any) => {
    setExpenseRecords((prev) => {
      const updatedList = prev.map((item) => {
        if (item.id !== id) return item;

        const updated = {
          ...item,
          [field]: value,
        };

        updated.qty = Number(updated.qty || 0);
        updated.price = Number(updated.price || 0);
        updated.total = updated.qty * updated.price;

        return updated;
      });

      const totalExp = updatedList.reduce((sum, item) => sum + item.total, 0);
      setFinanceData((prev) => ({
        ...prev,
        expense: totalExp,
        profit: prev.income - totalExp,
      }));

      return updatedList;
    });
  };

  const createMaterialDraftFromOrder = (order: Omit<Order, 'progress'>) => {
    const draft: MaterialDraft = {
      id: Date.now(),
      orderId: order.id,
      customer: order.customer,
      product: order.product,
      status: "Draft Material",
      items: [
        {
          id: 1,
          category: "Kain",
          materialName: "",
          materialDetail: "",
          volumeNeed: "",
          volumeBought: "",
          volumeUsed: "",
          unit: "kg",
          price: "",
        },
        {
          id: 2,
          category: "Material Utama",
          materialName: "",
          materialDetail: "",
          volumeNeed: "",
          volumeBought: "",
          volumeUsed: "",
          unit: "pcs",
          price: "",
        },
        {
          id: 3,
          category: "Lain-lain",
          materialName: "",
          materialDetail: "",
          volumeNeed: "",
          volumeBought: "",
          volumeUsed: "",
          unit: "pcs",
          price: "",
        },
      ],
    };

    setMaterialDrafts((prev) => [...prev, draft]);
  };

  const updateMaterialItem = (draftId: number, itemId: number, field: keyof MaterialDraftItem, value: any) => {
    setMaterialDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id !== draftId) return draft;

        const updatedItems = draft.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                [field]: value,
              }
            : item
        );

        return {
          ...draft,
          items: updatedItems,
        };
      })
    );
  };

  const addOtherMaterialItem = (draftId: number) => {
    setMaterialDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id !== draftId) return draft;

        return {
          ...draft,
          items: [
            ...draft.items,
            {
              id: Date.now() + Math.floor(Math.random() * 1000),
              category: "Lain-lain",
              materialName: "",
              materialDetail: "",
              volumeNeed: "",
              volumeBought: "",
              volumeUsed: "",
              unit: "pcs",
              price: "",
            },
          ],
        };
      })
    );
  };

  const saveMaterialUsageToStock = (draftId: number) => {
    const draft = materialDrafts.find((item) => item.id === draftId);

    if (!draft) return;

    const stockLeft = draft.items
      .filter((item) => item.materialName)
      .map((item) => {
        const bought = Number(item.volumeBought || 0);
        const used = Number(item.volumeUsed || 0);

        return {
          id: Date.now() + item.id,
          materialName: item.materialName,
          category: item.category,
          stockLeft: bought - used,
          unit: item.unit,
          sourceOrder: draft.product,
        };
      })
      .filter((item) => item.stockLeft > 0);

    setWarehouseStock((prev) => [...prev, ...stockLeft]);

    alert("Sisa material berhasil masuk ke stok gudang");
  };

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

    /* CREATE MATERIAL DRAFT */
    createMaterialDraftFromOrder(order);
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
        materialOptions,
        materialDrafts,
        setMaterialDrafts,
        warehouseStock,
        setWarehouseStock,
        updateMaterialItem,
        saveMaterialUsageToStock,
        expenseRecords,
        addMaterialExpense,
        updateExpenseRecord,
        addOtherMaterialItem,
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
