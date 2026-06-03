import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import defaultSettings from "../data/defaultSettings";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

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
  
  // Supabase properties for backward/forward compatibility
  invoice_no?: string;
  customer_name?: string;
  customer_company?: string;
  product_name?: string;
  quantity?: number;
  total_amount?: number;
  unit_price?: number;
  created_at?: string;
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
  settings: typeof defaultSettings;
  setSettings: React.Dispatch<React.SetStateAction<typeof defaultSettings>>;
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

  const loadOrders = async () => {
    // Initial empty states
    setOrders([]);
    setProductionList([]);
    setWarehouseStock([]);
    setExpenseRecords([]);
    setFinanceData({ income: 0, expense: 0, profit: 0 });
    setStockData([]);

    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      // 1. Fetch Orders (Dashboard / POS orders)
      const { data: ordersData, error: ordersErr } = await supabase
        .from("orders")
        .select("*")
        .order("id", { ascending: false });

      let parsedOrders: Order[] = [];
      if (!ordersErr && ordersData) {
        parsedOrders = ordersData.map((item: any) => ({
          id: item.id,
          customer: item.customer_name || "-",
          product: item.product_name || "-",
          qty: Number(item.qty || 1),
          total: Number(item.subtotal || 0),
          status: item.production_status || "On Production",
          progress: item.progress || 10,
          deadline: item.deadline || "",
          createdAt: item.created_at || new Date().toISOString(),
          created_at: item.created_at,
          invoice_no: item.invoice_no,
          customer_name: item.customer_name,
          customer_company: item.customer_company,
          product_name: item.product_name,
          unit_price: Number(item.unit_price || 0),
        }));
        setOrders(parsedOrders);
      } else if (ordersErr) {
        console.error("Supabase orders load error:", ordersErr);
      }

      // 2. Fetch Production Batches (Pantau Produksi)
      const { data: batchesData, error: batchesErr } = await supabase
        .from("production_batches")
        .select("*")
        .order("id", { ascending: false });

      if (!batchesErr && batchesData && batchesData.length > 0) {
        const parsedBatches: Order[] = batchesData.map((item: any) => ({
          id: item.id,
          customer: item.customer_name || item.customer || "-",
          product: item.product_name || item.product || "-",
          qty: Number(item.qty || item.quantity || 1),
          total: Number(item.total_amount || item.total || 0),
          status: item.production_status || item.status || "On Production",
          progress: Number(item.progress || 10),
          deadline: item.deadline || "",
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        }));
        setProductionList(parsedBatches);
      } else {
        // Fallback to active orders if production_batches is empty or doesn't exist
        const activeFromOrders = parsedOrders.filter(o => o.status !== "Draft");
        setProductionList(activeFromOrders);
      }

      // 3. Fetch Inventory Materials
      const { data: inventoryData, error: inventoryErr } = await supabase
        .from("inventory_materials")
        .select("*")
        .order("id", { ascending: false });

      if (!inventoryErr && inventoryData) {
        const parsedStock = inventoryData.map((item: any) => ({
          id: item.id,
          materialName: item.material_name || item.materialName || "-",
          category: item.category || "-",
          stockLeft: Number(item.stock_left || item.stockLeft || 0),
          unit: item.unit || "pcs",
          sourceOrder: item.source_order || item.sourceOrder || "-"
        }));
        setWarehouseStock(parsedStock);
      }

      // 4. Fetch Financial Transactions (Laporan Keuangan)
      const { data: financeRecords, error: financeErr } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("id", { ascending: false });

      let parsedExpenses: ExpenseRecord[] = [];
      if (!financeErr && financeRecords) {
        parsedExpenses = financeRecords.map((item: any) => ({
          id: item.id,
          date: item.date || item.transaction_date || new Date().toISOString().split('T')[0],
          category: item.category || "-",
          materialName: item.material_name || item.materialName || "-",
          materialDetail: item.material_detail || item.materialDetail || "-",
          qty: Number(item.qty || item.quantity || 0),
          unit: item.unit || "pcs",
          price: Number(item.price || 0),
          total: Number(item.total || item.total_amount || 0),
          sourceOrder: item.source_order || item.sourceOrder || "-",
          customer: item.customer || "-"
        }));
        setExpenseRecords(parsedExpenses);
      }

      // 5. Compute Finances dynamically based on Supabase tables
      const computedIncome = parsedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      const computedExpense = parsedExpenses.reduce((sum, item) => sum + Number(item.total || 0), 0);
      setFinanceData({
        income: computedIncome,
        expense: computedExpense,
        profit: computedIncome - computedExpense
      });

    } catch (err) {
      console.error("Error loading multiple tables from Supabase:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ================= PRODUKSI ================= */
  const [productionList, setProductionList] = useState<Order[]>([]);

  /* ================= KEUANGAN ================= */
  const [financeData, setFinanceData] = useState<FinanceData>({
    income: 0,
    expense: 0,
    profit: 0,
  });

  /* ================= STOK ================= */
  const [stockData, setStockData] = useState<StockItem[]>([]);

  /* ================= SETTINGS ================= */
  const [settings, setSettings] = useState<typeof defaultSettings>(defaultSettings);

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
  const createOrder = async (order: Omit<Order, 'progress'>) => {
    const invoiceNumber = order.invoice_no || `INV-${new Date().getFullYear()}-${String(
      orders.length + 1
    ).padStart(4, '0')}`;
    const fullOrder = { ...order, progress: 10, invoice_no: invoiceNumber }; // Initial progress 10%

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

    /* SAVE TO SUPABASE */
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .insert([
            {
              invoice_no: invoiceNumber,
              customer_name: order.customer,
              customer_company: order.customer_company || "-",
              product_name: order.product,
              qty: order.qty,
              unit_price: order.qty > 0 ? order.total / order.qty : order.total,
              subtotal: order.total,
              payment_status: "Belum Bayar",
              production_status: order.status || "On Production",
              deadline: order.deadline || null,
            },
          ])
          .select();

        if (error) {
          console.error(error);
        } else {
          loadOrders();
        }

        // Keep dynamic notifications aligned with database structure
        try {
          await supabase
            .from('notifications')
            .insert([
              {
                title: 'Order Baru',
                message: `${order.customer}\n membuat order`
              }
            ]);
        } catch (nErr) {
          // Ignore if notification table is missing or structured differently
        }
      } catch (err) {
        console.error("Failed to insert order into Supabase:", err);
      }
    }
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
        settings,
        setSettings,
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
