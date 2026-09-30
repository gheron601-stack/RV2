import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, X, Loader2, AlertTriangle, Check } from 'lucide-react';
import { useAppData } from '../../lib/AppContext';
import { formatPeso, CATEGORY_LABELS } from '../../lib/format';
import type { Product, ProductCategory } from '../../lib/types';

const CATEGORIES: ProductCategory[] = ['device', 'pod', 'eliquid', 'coil', 'accessory'];

const EMPTY: Omit<Product, 'id' | 'created_at' | 'is_active'> = {
  name: '',
  description: '',
  price: '' as any,
  stock_qty: '' as any,
  category: 'device',
  brand: '',
  ps_license_no: '',
  image_url: '',
  flavors: [],
};

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [flavorInput, setFlavorInput] = useState('');
  const [inlinePriceId, setInlinePriceId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState<string | number>('');

  const startEditPrice = (product: Product) => {
    setInlinePriceId(product.id);
    setInlinePriceValue(product.price);
  };

  const saveInlinePrice = (id: string) => {
    const num = parseFloat(String(inlinePriceValue));
    if (!isNaN(num) && num >= 0) {
      updateProduct(id, { price: num });
    }
    setInlinePriceId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.includes(q)
    );
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock_qty: product.stock_qty,
      category: product.category,
      brand: product.brand,
      ps_license_no: product.ps_license_no ?? '',
      image_url: product.image_url ?? '',
      flavors: product.flavors ?? [],
    });
    setFlavorInput('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.brand.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (editing) {
      updateProduct(editing.id, {
        ...form,
        price: Number(form.price) || 0,
        stock_qty: form.flavors && form.flavors.length > 0 
          ? form.flavors.reduce((sum, f) => sum + f.stock, 0)
          : (Number(form.stock_qty) || 0)
      });
    } else {
      addProduct({
        id: `p-${Date.now()}`,
        ...form,
        price: Number(form.price) || 0,
        stock_qty: form.flavors && form.flavors.length > 0 
          ? form.flavors.reduce((sum, f) => sum + f.stock, 0)
          : (Number(form.stock_qty) || 0),
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
    setLoading(false);
    setShowModal(false);
  };

  const inputCls =
    'w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} total products</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded text-sm font-medium hover:bg-accent transition-colors shrink-0"
        >
          <Plus size={14} />
          Add Product
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map((h) => (
                  <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-widest px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-secondary border border-border rounded overflow-hidden shrink-0">
                          {product.image_url && (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground uppercase">
                      {CATEGORY_LABELS[product.category]}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {inlinePriceId === product.id ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs text-muted-foreground">₱</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            autoFocus
                            value={inlinePriceValue}
                            onChange={(e) => setInlinePriceValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveInlinePrice(product.id);
                              if (e.key === 'Escape') setInlinePriceId(null);
                            }}
                            className="w-24 bg-background border border-primary rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => saveInlinePrice(product.id)}
                            className="text-emerald-400 hover:text-emerald-300 p-1"
                            title="Save price"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInlinePriceId(null)}
                            className="text-muted-foreground hover:text-foreground p-1"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEditPrice(product)}
                          className="group/price inline-flex items-center gap-2 cursor-pointer hover:text-primary transition-colors py-1 px-1.5 -mx-1.5 rounded hover:bg-secondary/40"
                          title="Click to edit price"
                        >
                          <span className="font-medium">{formatPeso(product.price)}</span>
                          <Pencil size={11} className="opacity-40 group-hover/price:opacity-100 text-muted-foreground transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          product.stock_qty === 0
                            ? 'text-rose-400'
                            : product.stock_qty <= 5
                            ? 'text-amber-500'
                            : 'text-foreground'
                        }`}
                      >
                        {product.stock_qty}
                        {product.stock_qty === 0 && (
                          <AlertTriangle size={11} className="inline ml-1" />
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateProduct(product.id, { is_active: !product.is_active })}
                        className={`text-xs px-2 py-0.5 rounded border ${
                          product.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-secondary text-muted-foreground border-border'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${product.name}"?`)) deleteProduct(product.id);
                          }}
                          className="text-muted-foreground hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-foreground">
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                    className={`${inputCls} appearance-none`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Price (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value === '' ? '' as any : parseFloat(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Stock Qty {(form.flavors || []).length > 0 && "(Calculated from variations)"}</label>
                  <input
                    type="number"
                    min="0"
                    value={(form.flavors || []).length > 0 ? (form.flavors || []).reduce((sum, f) => sum + f.stock, 0) : form.stock_qty}
                    onChange={(e) => setForm({ ...form, stock_qty: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                    className={inputCls}
                    disabled={(form.flavors || []).length > 0}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">DTI-PS License No.</label>
                  <input
                    type="text"
                    value={form.ps_license_no}
                    onChange={(e) => setForm({ ...form, ps_license_no: e.target.value })}
                    placeholder="DTI-PS-YYYY-XXXX"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary/20 file:text-primary file:text-xs file:font-semibold hover:file:bg-primary/30"
                  />
                  {form.image_url && (
                    <div className="mt-2 w-16 h-16 rounded overflow-hidden border border-border">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs text-muted-foreground">
                      Flavors / Variations (Optional)
                    </label>
                    <span className={`text-[11px] font-mono ${(form.flavors || []).length >= 15 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
                      {(form.flavors || []).length}/15 Max Flavors
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={(form.flavors || []).length >= 15}
                      value={flavorInput}
                      onChange={(e) => setFlavorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const flavorsList = form.flavors || [];
                          if (flavorsList.length >= 15) return;
                          const trimmed = flavorInput.trim();
                          if (trimmed && !flavorsList.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
                            setForm({ ...form, flavors: [...flavorsList, { name: trimmed, stock: 0 }] });
                            setFlavorInput('');
                          }
                        }
                      }}
                      placeholder={(form.flavors || []).length >= 15 ? "Maximum limit of 15 flavors reached" : "Type a flavor and press Enter..."}
                      className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <button
                      type="button"
                      disabled={(form.flavors || []).length >= 15 || !flavorInput.trim()}
                      onClick={() => {
                        const flavorsList = form.flavors || [];
                        if (flavorsList.length >= 15) return;
                        const trimmed = flavorInput.trim();
                        if (trimmed && !flavorsList.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
                          setForm({ ...form, flavors: [...flavorsList, { name: trimmed, stock: 0 }] });
                          setFlavorInput('');
                        }
                      }}
                      className="px-3 bg-secondary border border-border rounded text-foreground text-sm hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  {(form.flavors || []).length >= 15 && (
                    <p className="text-[11px] text-amber-500 mt-1">
                      Limit reached: You have added the maximum of 15 flavors.
                    </p>
                  )}
                  {(form.flavors || []).length > 0 && (
                    <div className="flex flex-col gap-2 mt-3">
                      {(form.flavors || []).map(flavor => (
                        <div key={flavor.name} className="flex items-center gap-2 bg-secondary/50 p-2 rounded border border-border">
                          <span className="flex-1 text-sm font-medium">{flavor.name}</span>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">Stock:</label>
                            <input 
                              type="number" 
                              min="0"
                              value={flavor.stock}
                              onChange={(e) => {
                                const newStock = parseInt(e.target.value) || 0;
                                setForm({
                                  ...form, 
                                  flavors: (form.flavors || []).map(f => f.name === flavor.name ? { ...f, stock: newStock } : f)
                                });
                              }}
                              className="w-20 bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                            />
                            <button onClick={() => setForm({...form, flavors: (form.flavors || []).filter(f => f.name !== flavor.name)})} className="text-muted-foreground hover:text-red-400 p-1">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={loading || !form.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {editing ? 'Save Changes' : 'Add Product'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-border rounded text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
