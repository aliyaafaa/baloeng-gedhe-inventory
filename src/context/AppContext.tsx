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
  dp_amount?: number;
  payment_status?: string;
  production_notes?: string;
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
  saveMaterialUsageToStock: (draftId: number) => Promise<void>;
  saveMaterialDraftDetail: (draftId: number) => Promise<void>;
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
          dp_amount: Number(item.dp_amount || 0),
          payment_status: item.payment_status || "Belum Bayar",
          production_notes: item.production_notes || item.notes || "",
        }));
        setOrders(parsedOrders);
      } else if (ordersErr) {
        console.error("Supabase orders load error:", ordersErr);
      }

      // 2. Map Production Batches (Pantau Produksi)
      try {
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
            status: item.status || "On Production",
            progress: Number(item.progress || 10),
            deadline: item.deadline || "",
            createdAt: item.created_at || new Date().toISOString(),
            created_at: item.created_at,
            invoice_no: item.invoice_no,
          }));
          setProductionList(parsedBatches);
        } else {
          setProductionList(parsedOrders);
        }
      } catch (pbLoadErr) {
        console.error("Failed to load production batches:", pbLoadErr);
        setProductionList(parsedOrders);
      }

      // 3. Load Materials from inventory_materials table
      try {
        const { data: inventoryData, error: inventoryErr } = await supabase
          .from("inventory_materials")
          .select("*")
          .order("id", { ascending: false });

        let parsedStock = [];
        if (!inventoryErr && inventoryData) {
          parsedStock = inventoryData.map((item: any) => ({
            id: item.id,
            materialName: item.material_name || item.materialName || "-",
            category: item.category || "-",
            stockLeft: Number(item.stock_qty !== undefined ? item.stock_qty : (item.stock_left !== undefined ? item.stock_left : (item.stockLeft || 0))),
            unit: item.unit || "pcs",
            supplier: item.supplier || "-",
            sourceOrder: item.source_order || item.sourceOrder || "-"
          }));
        }

        const localStock = JSON.parse(localStorage.getItem("local_warehouse_stock") || "[]");
        if (parsedStock.length === 0 && localStock.length > 0) {
          setWarehouseStock(localStock);
        } else {
          setWarehouseStock(parsedStock);
        }
      } catch (invErr) {
        console.error("Failed to load inventory materials:", invErr);
        const localStock = JSON.parse(localStorage.getItem("local_warehouse_stock") || "[]");
        setWarehouseStock(localStock);
      }

      // Load material drafts for ALL orders
      let supabaseDraftItems: any[] = [];
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("order_materials")
            .select("*");
          if (!error && data) {
            supabaseDraftItems = data;
          }
        } catch (dbErr) {
          console.error("Failed to load order_materials from Supabase:", dbErr);
        }
      }

      const localDrafts = JSON.parse(localStorage.getItem("local_material_drafts") || "[]");

      const loadedDrafts = parsedOrders.map((order) => {
        const dbItems = supabaseDraftItems.filter((item: any) => Number(item.order_id) === Number(order.id));
        const matchedLocalDraft = localDrafts.find((d: any) => Number(d.orderId) === Number(order.id));

        let itemsToUse = [];

        if (dbItems.length > 0) {
          itemsToUse = dbItems.map((item: any) => ({
            id: item.id || Date.now() + Math.random(),
            category: item.material_category || "Lain-lain",
            materialName: item.material_name || "",
            materialDetail: item.material_detail || "",
            volumeNeed: item.required_qty !== undefined && item.required_qty !== null ? String(item.required_qty) : "",
            volumeBought: item.purchased_qty !== undefined && item.purchased_qty !== null ? String(item.purchased_qty) : "",
            volumeUsed: item.used_qty !== undefined && item.used_qty !== null ? String(item.used_qty) : "",
            unit: item.unit || "pcs",
            price: item.unit_price !== undefined && item.unit_price !== null ? String(item.unit_price) : "",
          }));
        } else if (matchedLocalDraft && matchedLocalDraft.items) {
          itemsToUse = matchedLocalDraft.items;
        } else {
          itemsToUse = [
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
            }
          ];
        }

        let draftStatus = "Draft Material";
        if (order.status === "Selesai" || order.status === "Completed" || order.status === "COMPLETED") {
          draftStatus = "Completed";
        } else if (order.status === "On Production" || order.status === "Sedang Produksi") {
          draftStatus = "On Production";
        }

        return {
          id: matchedLocalDraft?.id || (Date.now() + order.id),
          orderId: order.id,
          customer: order.customer,
          product: order.product,
          status: draftStatus,
          items: itemsToUse
        };
      });

      setMaterialDrafts(loadedDrafts);

      // 4. Clear/empty financial transactions state as per instructions (not using financial_transactions table)
      setExpenseRecords([]);

      // 5. Compute Finances dynamically based solely on orders
      const computedIncome = parsedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      setFinanceData({
        income: computedIncome,
        expense: 0,
        profit: computedIncome
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

  const saveMaterialDraftDetail = async (draftId: number) => {
    const draft = materialDrafts.find((item) => item.id === draftId);
    if (!draft) return;

    // Save to local storage
    const savedDrafts = JSON.parse(localStorage.getItem("local_material_drafts") || "[]");
    const index = savedDrafts.findIndex((d: any) => Number(d.orderId) === Number(draft.orderId));
    if (index >= 0) {
      savedDrafts[index] = draft;
    } else {
      savedDrafts.push(draft);
    }
    localStorage.setItem("local_material_drafts", JSON.stringify(savedDrafts));

    // Save to Supabase using 'order_materials' table
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from("order_materials")
          .delete()
          .eq("order_id", draft.orderId);

        const rowsToInsert = draft.items.map((item) => ({
          order_id: draft.orderId,
          material_name: item.materialName || "-",
          material_category: item.category || "-",
          material_detail: item.materialDetail || "",
          required_qty: Number(item.volumeNeed || 0),
          purchased_qty: Number(item.volumeBought || 0),
          used_qty: Number(item.volumeUsed || 0),
          remaining_qty: Math.max(0, Number(item.volumeBought || 0) - Number(item.volumeUsed || 0)),
          unit_price: Number(item.price || 0),
          total_cost: Number(item.volumeBought || 0) * Number(item.price || 0),
          unit: item.unit || "pcs"
        }));

        const { error } = await supabase
          .from("order_materials")
          .insert(rowsToInsert);

        if (error) {
          console.error("Supabase order_materials insert error:", error);
        } else {
          console.log("Successfully saved order_materials to Supabase for order", draft.orderId);
        }
      } catch (err) {
        console.error("Supabase order_materials error:", err);
      }
    }
  };

  const saveMaterialUsageToStock = async (draftId: number) => {
    const draft = materialDrafts.find((item) => item.id === draftId);

    if (!draft) return;

    const stockLeft = draft.items
      .filter((item) => item.materialName)
      .map((item) => {
        const bought = Number(item.volumeBought || 0);
        const used = Number(item.volumeUsed || 0);

        return {
          id: Date.now() + item.id + Math.floor(Math.random() * 1000),
          materialName: item.materialName,
          category: item.category,
          stockLeft: bought - used,
          unit: item.unit,
          sourceOrder: draft.product,
        };
      })
      .filter((item) => item.stockLeft > 0);

    setWarehouseStock((prev) => {
      const filtered = prev.filter(s => s.sourceOrder !== draft.product);
      return [...filtered, ...stockLeft];
    });

    const savedStocks = JSON.parse(localStorage.getItem("local_warehouse_stock") || "[]");
    const filteredLocal = savedStocks.filter((s: any) => s.sourceOrder !== draft.product);
    localStorage.setItem("local_warehouse_stock", JSON.stringify([...filteredLocal, ...stockLeft]));

    await saveMaterialDraftDetail(draftId);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from("inventory_materials")
          .delete()
          .eq("source_order", draft.product);

        if (stockLeft.length > 0) {
          const rowsToInsert = stockLeft.map(s => ({
            material_name: s.materialName,
            category: s.category,
            stock_qty: s.stockLeft,
            unit: s.unit,
            source_order: s.sourceOrder,
            supplier: "-"
          }));

          const { error } = await supabase
            .from("inventory_materials")
            .insert(rowsToInsert);

          if (error) {
            console.error("Supabase inventory_materials insert error:", error);
          }
        }
      } catch (err) {
        console.error("Supabase save inventory materials error:", err);
      }
    }

    alert("Belanja, penggunaan, dan sisa stok material berhasil tersimpan ke database & gudang");
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
              payment_status: order.payment_status || "Belum Bayar",
              production_status: order.status || "On Production",
              deadline: order.deadline || null,
              dp_amount: order.dp_amount || 0,
              production_notes: order.production_notes || "",
            },
          ])
          .select();

        if (error) {
          console.error(error);
        } else {
          // Automatically insert record to financial_transactions table mapping order parameters
          try {
            await supabase
              .from("financial_transactions")
              .insert([
                {
                  invoice_no: invoiceNumber,
                  customer_name: order.customer,
                  transaction_type: "income",
                  amount: order.total,
                  payment_method: "Transfer",
                  transaction_date: new Date().toISOString().split("T")[0],
                },
              ]);
          } catch (ftErr) {
            console.error("Failed to insert financial transaction:", ftErr);
          }

          // Automatically insert record to production_batches table mapping order parameters
          try {
            await supabase
              .from("production_batches")
              .insert([
                {
                  invoice_no: invoiceNumber,
                  customer_name: order.customer,
                  product_name: order.product,
                  qty: order.qty,
                  deadline: order.deadline || null,
                  status: order.status || "On Production",
                  progress: 10,
                },
              ]);
          } catch (pbErr) {
            console.error("Failed to insert production batch:", pbErr);
          }

          // Automatically insert draft material to inventory_materials table mapping order parameters
          try {
            await supabase
              .from("inventory_materials")
              .insert([
                {
                  material_name: order.product,
                  stock_qty: order.qty,
                  category: "Produksi",
                  unit: "pcs",
                  supplier: "-",
                },
              ]);
          } catch (imErr) {
            console.error("Failed to insert inventory material draft:", imErr);
          }

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
        saveMaterialDraftDetail,
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
