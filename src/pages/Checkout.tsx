import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, ChevronRight, User, Phone } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useAppData } from '../lib/AppContext';
import { useAuth } from '../lib/auth';
import { formatPeso } from '../lib/format';
import type { Order } from '../lib/types';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { addOrder, updateProfile } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saveProfile, setSaveProfile] = useState(true);
  const [loading, setLoading] = useState(false);

  const grandTotal = total;

  const createPendingOrder = () => {
    if (!user) return null;
    
    // Save updated customer info to profile
    if (saveProfile && (fullName !== user.full_name || phone !== user.phone || address !== user.address)) {
      updateProfile(user.id, {
        full_name: fullName,
        phone,
        address,
      });
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      customer_id: user.id,
      status: 'pending_payment',
      total_amount: grandTotal,
      logistics_company: 'standard',
      detailed_address: address,
      contact_full_name: fullName || user.full_name,
      contact_phone: phone || user.phone,
      reference_code: `REF-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map(i => ({
        id: `ITEM-${Date.now()}-${i.product.id}`,
        order_id: orderId,
        product_id: i.product.id,
        product: i.product,
        quantity: i.quantity,
        unit_price: i.product.price,
        flavor: i.selectedFlavor
      })),
    };
    addOrder(newOrder);
    clearCart();
    return orderId;
  };

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !fullName || !phone) {
      alert('Please complete all contact and delivery details.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const orderId = createPendingOrder();
      if (orderId) navigate(`/orders/${orderId}/payment`, {
        state: { grandTotal, address, contactName: fullName, contactPhone: phone }
      });
    }, 800);
  };

  const handlePayLater = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!address || !fullName || !phone) {
      alert('Please complete all contact and delivery details.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      createPendingOrder();
      navigate('/orders');
    }, 800);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground font-sans">No items to checkout.</p>
        <button onClick={() => navigate('/catalog')} className="text-primary hover:underline mt-4 text-sm inline-block">Return to shop</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground mb-2">Secure Checkout</h1>
        <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground uppercase tracking-wider">
          <span className="text-primary">Checkout</span>
          <ChevronRight size={12} />
          <span>Payment</span>
          <ChevronRight size={12} />
          <span>Confirmation</span>
        </div>
      </div>

      <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-10">
        <form onSubmit={handlePayNow} className="space-y-8">
          {/* Customer & Delivery Details */}
          <section className="bg-card p-6 rounded-lg border border-white/5">
            <h2 className="flex items-center gap-2 font-display text-lg text-foreground mb-6 pb-3 border-b border-white/5">
              <MapPin size={18} className="text-primary" /> Customer & Delivery Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5">
                  <User size={13} className="text-primary" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="premium-input"
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5">
                  <Phone size={13} className="text-primary" /> Contact Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 09171234567"
                  className="premium-input"
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary" /> Full Delivery Address
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Barangay, City, Province, Zip Code"
                  className="premium-input resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="saveProfile"
                  checked={saveProfile}
                  onChange={(e) => setSaveProfile(e.target.checked)}
                  className="rounded border-white/20 bg-background text-primary focus:ring-primary"
                />
                <label htmlFor="saveProfile" className="text-xs text-muted-foreground select-none cursor-pointer">
                  Save updated info to my profile
                </label>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={loading} className="btn-premium w-full py-4 text-lg">
              {loading ? 'Processing...' : 'Pay Now (InstaPay)'}
            </button>
            <button type="button" onClick={handlePayLater} disabled={loading} className="btn-premium-outline w-full py-3">
              {loading ? 'Processing...' : 'Place Order & Pay Later'}
            </button>
          </div>
        </form>

        {/* Order Summary */}
        <div className="md:border-l md:border-white/5 md:pl-10">
          <h2 className="font-display text-xl text-foreground mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6 max-h-[30vh] md:max-h-[40vh] overflow-y-auto pr-2">
            {items.map(({ product, quantity, selectedFlavor }) => (
              <div key={`${product.id}-${selectedFlavor || ''}`} className="flex gap-4 items-start">
                <div className="relative w-16 h-16 bg-zinc-900 rounded overflow-hidden shrink-0 border border-white/5">
                  <span className="absolute -top-1 -right-1 bg-primary text-background text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10 font-bold">
                    {quantity}
                  </span>
                  {product.image_url ? (
                    <img src={product.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">?</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-sans font-medium text-foreground line-clamp-2 leading-snug">
                    {product.name}
                  </p>
                  {selectedFlavor && (
                    <p className="text-xs text-primary mt-0.5">Flavor: {selectedFlavor}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{product.brand}</p>
                </div>
                <p className="text-sm font-medium text-foreground">{formatPeso(product.price * quantity)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground">{formatPeso(total)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Standard Delivery</span>
              <span className="text-emerald-400 font-medium">FREE</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
              <span className="text-base text-foreground">Total</span>
              <span className="font-display text-2xl text-primary">{formatPeso(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
