import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Navigate } from 'react-router';
import { Upload, CheckCircle2, ChevronRight, QrCode } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useAppData } from '../lib/AppContext';
import { useAuth } from '../lib/auth';
import { formatPeso } from '../lib/format';
import type { Order } from '../lib/types';

export default function Payment() {
  const { state } = useLocation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { orders, addOrder, updateOrder, shopSettings } = useAppData();
  const { user } = useAuth();

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // If we have an orderId, find the existing order
  const existingOrder = orderId ? orders.find(o => o.id === orderId) : null;

  if (!state && !existingOrder) {
    return <Navigate to="/checkout" replace />;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const grandTotal = existingOrder ? existingOrder.total_amount : state?.grandTotal;
  const address = existingOrder ? existingOrder.detailed_address : state?.address;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return;

    setSubmitting(true);
    
    setTimeout(() => {
      if (existingOrder) {
        // Update existing order
        updateOrder(existingOrder.id, {
          status: 'pending_verification',
          payment_proof: {
            id: `PROOF-${Date.now()}`,
            order_id: existingOrder.id,
            image_url: URL.createObjectURL(proofFile),
            uploaded_at: new Date().toISOString(),
            review_status: 'pending'
          }
        });
      } else {
        // Create new order
        const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
        const newOrder: Order = {
          id: newOrderId,
          customer_id: user.id,
          status: 'pending_verification',
          total_amount: grandTotal,
          logistics_company: 'standard',
          detailed_address: address,
          contact_full_name: state?.contactName || user.full_name,
          contact_phone: state?.contactPhone || user.phone,
          reference_code: `REF-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: items.map(i => ({
            id: `ITEM-${Date.now()}-${i.product.id}`,
            order_id: newOrderId,
            product_id: i.product.id,
            product: i.product,
            quantity: i.quantity,
            unit_price: i.product.price
          })),
          payment_proof: {
            id: `PROOF-${Date.now()}`,
            order_id: newOrderId,
            image_url: URL.createObjectURL(proofFile),
            uploaded_at: new Date().toISOString(),
            review_status: 'pending'
          }
        };
        addOrder(newOrder);
        clearCart();
      }
      
      setSuccess(true);
      setSubmitting(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="font-display text-4xl text-foreground mb-4">Payment Received</h1>
        <p className="text-muted-foreground font-light mb-8">
          Thank you for your order! Your payment proof has been submitted and is pending verification. 
          We'll update your order status once confirmed.
        </p>
        <button onClick={() => navigate('/orders')} className="btn-premium">
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground mb-2">Complete Payment</h1>
        <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground uppercase tracking-wider">
          <span>Checkout</span>
          <ChevronRight size={12} />
          <span className="text-primary">Payment</span>
          <ChevronRight size={12} />
          <span>Confirmation</span>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-lg p-6 md:p-10 shadow-xl">
        <div className="text-center mb-10">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Total Amount Due</p>
          <div className="font-display text-5xl text-primary">{formatPeso(grandTotal)}</div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Instructions */}
          <div className="space-y-6">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2">
              <QrCode className="text-primary" /> Payment Details
            </h2>
            
            <div className="space-y-4">
              {(shopSettings.payment_methods || []).map((method) => (
                <div key={method.id} className="bg-background rounded border border-white/5 p-4 relative font-sans text-sm">
                  {method.qr_image_url && (
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded overflow-hidden p-1 shadow-sm">
                      <img src={method.qr_image_url} alt="QR" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="pr-20">
                      <p className="text-muted-foreground mb-1">Bank / Wallet</p>
                      <p className="font-medium text-foreground">{method.bank_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Account Name</p>
                      <p className="font-medium text-foreground uppercase">{method.account_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Account Number</p>
                      <p className="font-medium text-primary font-mono text-lg">{method.account_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!shopSettings.payment_methods || shopSettings.payment_methods.length === 0) && (
                <div className="bg-background rounded border border-white/5 p-4 font-sans text-sm text-muted-foreground">
                  No payment methods configured. Please contact support.
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Please transfer the exact amount to any of the accounts above. Take a screenshot of the successful transaction receipt to upload as proof.
            </p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h2 className="font-display text-xl text-foreground mb-6">Upload Proof</h2>
            
            <div className="flex-1 mb-6">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className={`w-full h-full min-h-[160px] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 transition-all ${
                  proofFile 
                    ? 'border-primary/50 bg-primary/5 text-primary' 
                    : 'border-white/10 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-white/5'
                }`}>
                <Upload size={24} />
                <span className="text-sm font-medium">
                  {proofFile ? proofFile.name : 'Click to upload screenshot'}
                </span>
                {!proofFile && <span className="text-xs font-light text-muted-foreground/70">PNG, JPG up to 5MB</span>}
              </button>
            </div>

            <button type="submit" disabled={!proofFile || submitting} className="btn-premium w-full py-4 text-lg">
              {submitting ? 'Verifying...' : 'Submit Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
