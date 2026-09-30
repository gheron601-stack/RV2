import { useState } from 'react';
import { Users, Search, Pencil, CheckCircle2, X, Phone, Mail, MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import { useAppData } from '../../lib/AppContext';
import { VerificationBadge } from '../../components/StatusBadge';
import type { Profile, VerificationStatus } from '../../lib/types';
import { formatDate } from '../../lib/format';

export default function Customers() {
  const { profiles, updateProfile } = useAppData();
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    birthdate: '',
    verification_status: 'verified' as VerificationStatus,
  });
  const [savedMessage, setSavedMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const customerList = profiles.filter((p) => !p.is_admin);

  const filtered = customerList.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q)
    );
  });

  const openEdit = (customer: Profile) => {
    setEditingCustomer(customer);
    setForm({
      full_name: customer.full_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      birthdate: customer.birthdate || '',
      verification_status: customer.verification_status || 'verified',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setLoading(true);

    setTimeout(() => {
      updateProfile(editingCustomer.id, {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        birthdate: form.birthdate,
        verification_status: form.verification_status,
      });
      setLoading(false);
      setEditingCustomer(null);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }, 400);
  };

  const inputCls =
    'w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer accounts, contact details, and delivery addresses.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} />
          <span>Customer information updated successfully!</span>
        </div>
      )}

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by customer name, email, or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="bg-card border border-border rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {['Customer', 'Contact & Email', 'Address', 'Status', 'Registered', ''].map((h) => (
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
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {customer.full_name ? customer.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{customer.full_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">ID: {customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="text-sm text-foreground">{customer.email}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone size={11} /> {customer.phone || 'No phone'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-muted-foreground truncate">
                        {customer.address || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <VerificationBadge status={customer.verification_status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(customer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary hover:bg-secondary/80 text-xs font-medium text-foreground border border-border transition-colors"
                      >
                        <Pencil size={12} />
                        Edit Info
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setEditingCustomer(null)}
          />
          <div className="relative bg-card border border-border rounded-lg w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-foreground">Edit Customer Information</h2>
              <button onClick={() => setEditingCustomer(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Delivery Address</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Delivery address..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Verification Status</label>
                  <select
                    value={form.verification_status}
                    onChange={(e) => setForm({ ...form, verification_status: e.target.value as VerificationStatus })}
                    className={inputCls}
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                    className={inputCls}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded text-sm font-medium hover:bg-accent transition-colors"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Save Customer Details
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2.5 border border-border rounded text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
