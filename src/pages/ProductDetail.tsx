import { useParams, Link } from 'react-router';
import { ChevronLeft, ShoppingCart, AlertTriangle, Image as ImageIcon, Check, Plus, Minus, X } from 'lucide-react';
import { useAppData } from '../lib/AppContext';
import { formatPeso, CATEGORY_LABELS } from '../lib/format';
import { useCart } from '../lib/cart';
import { useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products } = useAppData();
  const { addItem, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  // Multi-flavor selection state: maps flavorName to quantity
  const [selectedFlavors, setSelectedFlavors] = useState<Record<string, number>>({});

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <h2 className="font-display text-2xl mb-4 text-muted-foreground">Product Not Found</h2>
        <Link to="/catalog" className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-2">
          <ChevronLeft size={16} /> Return to collection
        </Link>
      </div>
    );
  }

  const hasFlavors = Boolean(product.flavors && product.flavors.length > 0);
  const outOfStock = product.stock_qty === 0;

  // Multi-flavor calculations
  const totalFlavorsCount = Object.keys(selectedFlavors).length;
  const totalFlavorItems = Object.values(selectedFlavors).reduce((sum, c) => sum + c, 0);
  const totalFlavorPrice = totalFlavorItems * product.price;

  // Single product calculations (no flavors)
  const cartItem = items.find(i => i.product.id === product.id && !i.selectedFlavor);
  const singleMaxQty = product.stock_qty - (cartItem?.quantity ?? 0);

  const toggleFlavor = (flavorName: string, maxStock: number) => {
    if (maxStock <= 0) return;
    setSelectedFlavors(prev => {
      const next = { ...prev };
      if (next[flavorName]) {
        delete next[flavorName];
      } else {
        next[flavorName] = 1;
      }
      return next;
    });
  };

  const updateFlavorCount = (flavorName: string, delta: number, maxStock: number) => {
    setSelectedFlavors(prev => {
      const current = prev[flavorName] || 0;
      const nextCount = current + delta;
      const next = { ...prev };
      if (nextCount <= 0) {
        delete next[flavorName];
      } else {
        next[flavorName] = Math.min(nextCount, maxStock);
      }
      return next;
    });
  };

  const removeFlavor = (flavorName: string) => {
    setSelectedFlavors(prev => {
      const next = { ...prev };
      delete next[flavorName];
      return next;
    });
  };

  const handleAdd = () => {
    if (hasFlavors) {
      if (totalFlavorItems === 0) {
        alert("Please select at least one flavor/variation first.");
        return;
      }

      Object.entries(selectedFlavors).forEach(([flavorName, count]) => {
        if (count > 0) {
          addItem(product, count, flavorName);
        }
      });

      setAddedCount(totalFlavorItems);
      setAdded(true);
      setSelectedFlavors({});
      setTimeout(() => setAdded(false), 2500);
    } else {
      addItem(product, qty, undefined);
      setAddedCount(qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <Link to="/catalog" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronLeft size={16} />
        Back to collection
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-zinc-900 rounded-lg overflow-hidden border border-white/5 shadow-2xl">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-gradient-to-b from-zinc-800 to-zinc-900">
              <ImageIcon size={64} strokeWidth={1} className="mb-4" />
              <span className="text-sm font-sans tracking-widest uppercase">Image Unavailable</span>
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="font-sans font-medium tracking-widest text-white border border-white/20 px-6 py-3 text-sm uppercase rounded">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col py-4">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-primary">
                {CATEGORY_LABELS[product.category]}
              </span>
              {product.ps_license_no && (
                <span className="text-xs text-muted-foreground/50 border-l border-white/10 pl-3">PS# {product.ps_license_no}</span>
              )}
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-2">
              {product.name}
            </h1>
            <p className="text-sm font-sans font-medium uppercase tracking-widest text-muted-foreground">
              By {product.brand}
            </p>
          </div>

          <div className="font-sans font-medium text-3xl text-primary mb-8">
            {formatPeso(product.price)}
          </div>

          <div className="text-base text-muted-foreground leading-relaxed font-light mb-8">
            {product.description}
          </div>

          <div className="mt-auto space-y-6">
            {/* Stock status */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              {outOfStock ? (
                <div className="flex items-center gap-2 text-sm text-red-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Currently out of stock
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  In Stock ({product.stock_qty} total units available)
                </div>
              )}
            </div>

            {/* Flavors / Variations Selection */}
            {hasFlavors && product.flavors && (
              <div className="border-b border-white/5 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-sans font-medium text-foreground uppercase tracking-widest">
                    Select Flavors / Variations
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Click flavors to select multiple
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.flavors.map(flavor => {
                    const isSelected = Boolean(selectedFlavors[flavor.name]);
                    const currentCount = selectedFlavors[flavor.name] || 0;
                    const isSoldOut = flavor.stock === 0;

                    return (
                      <button
                        key={flavor.name}
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => toggleFlavor(flavor.name, flavor.stock)}
                        className={`px-4 py-2 rounded-full border text-sm font-sans transition-all flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-primary border-primary text-background font-medium shadow-md shadow-primary/20 scale-[1.02]' 
                            : isSoldOut
                              ? 'bg-secondary/20 border-white/5 text-muted-foreground/30 cursor-not-allowed line-through'
                              : 'bg-secondary/50 border-white/10 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {isSelected && <Check size={14} className="stroke-[3]" />}
                        <span>{flavor.name}</span>
                        {isSelected && (
                          <span className="bg-background/25 px-1.5 py-0.5 rounded-full text-xs font-bold">
                            ×{currentCount}
                          </span>
                        )}
                        {isSoldOut && <span className="text-xs opacity-60">(Sold Out)</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Flavors Breakdown */}
                {totalFlavorsCount > 0 && (
                  <div className="mt-4 bg-secondary/30 rounded-lg p-4 border border-white/10 space-y-3">
                    <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider font-semibold">
                      Selected Variations ({totalFlavorsCount}):
                    </p>
                    <div className="space-y-2">
                      {Object.entries(selectedFlavors).map(([flavorName, count]) => {
                        const flavorObj = product.flavors?.find(f => f.name === flavorName);
                        const maxStock = flavorObj?.stock ?? 99;

                        return (
                          <div
                            key={flavorName}
                            className="flex items-center justify-between bg-background/80 p-2.5 rounded border border-white/5 text-sm"
                          >
                            <div className="flex-1 min-w-0 pr-3">
                              <p className="font-medium text-foreground truncate">{flavorName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatPeso(product.price)} each {maxStock <= 5 && `• Only ${maxStock} left`}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-white/10 rounded h-8 bg-secondary/40">
                                <button
                                  type="button"
                                  onClick={() => updateFlavorCount(flavorName, -1, maxStock)}
                                  className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-8 text-center font-medium text-xs text-foreground">
                                  {count}
                                </span>
                                <button
                                  type="button"
                                  disabled={count >= maxStock}
                                  onClick={() => updateFlavorCount(flavorName, 1, maxStock)}
                                  className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-30"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              <span className="font-medium text-xs w-16 text-right text-foreground">
                                {formatPeso(product.price * count)}
                              </span>

                              <button
                                type="button"
                                onClick={() => removeFlavor(flavorName)}
                                className="text-muted-foreground hover:text-red-400 p-1 transition-colors"
                                title="Remove flavor"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        Total {totalFlavorItems} {totalFlavorItems === 1 ? 'item' : 'items'} selected
                      </span>
                      <span className="font-display text-sm text-primary">
                        {formatPeso(totalFlavorPrice)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Qty selector (when product has NO flavors) */}
            {!hasFlavors && !outOfStock && (
              <div className="flex items-center border border-white/20 rounded h-12 w-fit">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-lg"
                >
                  &minus;
                </button>
                <span className="w-12 text-center font-sans font-medium text-foreground">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(singleMaxQty, qty + 1))}
                  disabled={qty >= singleMaxQty}
                  className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-lg disabled:opacity-30"
                >
                  &#43;
                </button>
              </div>
            )}

            {/* Add to cart button */}
            {!outOfStock && (
              <button
                type="button"
                onClick={handleAdd}
                disabled={Boolean(hasFlavors && totalFlavorItems === 0)}
                className={`btn-premium w-full h-14 text-base ${
                  added ? 'bg-green-600 border-green-500 text-white !shadow-none' : ''
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                <ShoppingCart size={18} />
                {added
                  ? `Added ${addedCount} ${addedCount === 1 ? 'Item' : 'Items'} to Cart!`
                  : hasFlavors
                    ? totalFlavorItems > 0
                      ? `Add ${totalFlavorItems} ${totalFlavorItems === 1 ? 'Item' : 'Items'} to Cart • ${formatPeso(totalFlavorPrice)}`
                      : 'Select Flavors to Add to Cart'
                    : `Add to Cart • ${formatPeso(product.price * qty)}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
