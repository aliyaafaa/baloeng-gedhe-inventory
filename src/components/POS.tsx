import { useState } from "react";
import { 
  ShoppingCart, 
  Trash2, 
  Search, 
  Plus, 
  Minus, 
  ChevronRight,
  PackageCheck
} from "lucide-react";
import { motion } from "motion/react";

const products = [
  { id: 1, name: "Kaos Heritage Baloeng", price: 120000, category: "Apparel", stock: 45 },
  { id: 2, name: "Kemeja Linen Signature", price: 250000, category: "Premium", stock: 12 },
  { id: 3, name: "Jaket Denim Heritage", price: 350000, category: "Outerwear", stock: 8 },
  { id: 4, name: "Batik Pekalongan Special", price: 450000, category: "Heritage", stock: 15 },
  { id: 5, name: "Polo Shirt Classic", price: 150000, category: "Apparel", stock: 30 },
  { id: 6, name: "Totebag Baloeng Gedhe", price: 75000, category: "Accessories", stock: 100 },
];

export default function POS() {
  const [cart, setCart] = useState<{ id: number; name: string; price: number; qty: number }[]>([]);

  const addToCart = (product: { id: number; name: string; price: number }) => {
    const exist = cart.find((item) => item.id === product.id);
    if (exist) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id: number, delta: number) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
      ).filter(item => item.qty > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Point of Sale
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">
            Kasir & Manajemen Transaksi Langsung
          </p>
        </div>
        <div className="relative w-full max-w-xs">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input
             className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-heritage-red/20 focus:border-heritage-red/30 transition-all font-medium"
             placeholder="Cari produk..."
           />
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6 min-h-0">
        {/* PRODUCT LIST */}
        <div className="col-span-12 lg:col-span-8 flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-heritage-red/30 hover:shadow-md transition-all cursor-pointer group flex flex-col"
                onClick={() => addToCart(p)}
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-heritage-red group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-heritage-red transition-colors">{p.name}</h3>
                <p className="text-heritage-red font-bold text-lg">
                  Rp {p.price.toLocaleString("id-ID")}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${p.stock < 10 ? 'text-orange-500' : 'text-slate-400'}`}>
                    <PackageCheck className="w-3 h-3" /> Stok: {p.stock}
                  </span>
                  <button className="text-[10px] font-bold text-heritage-red uppercase hover:underline">Pilih Variant</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CART / CHECKOUT */}
        <div className="col-span-12 lg:col-span-4">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24 flex flex-col min-h-[500px]"
          >
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-5 h-5 text-heritage-red" />
              <h2 className="font-bold text-slate-800 text-lg">Order Review</h2>
              <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                {cart.length} Item
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
              {cart.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center opacity-30">
                  <ShoppingCart className="w-10 h-10 mb-2" />
                  <p className="text-sm font-bold uppercase tracking-widest">Keranjang Kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 border-b border-slate-50 pb-4 last:border-0 group">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[150px]">
                        <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 font-semibold italic">Rp {item.price.toLocaleString("id-ID")}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded-md transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className="text-sm font-bold text-heritage-red">
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-bold">Rp {total.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg text-slate-900">
                <span className="font-bold uppercase tracking-widest text-xs">Grand Total</span>
                <span className="text-heritage-red font-bold">Rp {total.toLocaleString("id-ID")}</span>
              </div>

              <div className="pt-2">
                <button className="w-full bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 flex items-center justify-center gap-3 hover:bg-red-800 transition-all hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50 disabled:grayscale" disabled={cart.length === 0}>
                  Proceed to Payment
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">Hold Order</button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
