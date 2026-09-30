import { useState } from 'react';
import { Link } from 'react-router';
import { Search, ChevronRight } from 'lucide-react';
import { useAppData } from '../../lib/AppContext';
import { OrderStatusBadge } from '../../components/StatusBadge';
import { formatPeso, formatDate, ORDER_STATUS_LABELS } from '../../lib/format';
import type { OrderStatus } from '../../lib/types';

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending_payment', label: 'Awaiting Payment' },
  { value: 'pending_verification', label: 'Under Review' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'payment_rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersList() {
  const { orders, profiles } = useAppData();
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const sorted = [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const filtered = sorted.filter((o) => {
    if (status !== 'all' && o.status !== status) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const customer = profiles.find((p) => p.id === o.customer_id);
      return (
        o.reference_code.toLowerCase().includes(q) ||
        customer?.full_name.toLowerCase().includes(q) ||
        customer?.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-0 -mb-px">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count = value === 'all' ? orders.length : orders.filter((o) => o.status === value).length;
          return (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={`px-3 py-2 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors ${
                status === value
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
              {count > 0 && (
                <span className="ml-1.5 text-[10px] text-muted-foreground">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by reference, customer name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {['Reference', 'Customer', 'Amount', 'Delivery', 'Status', 'Date', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs text-muted-foreground uppercase tracking-widest px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const customer = profiles.find((p) => p.id === order.customer_id);
                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-foreground">{order.reference_code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">{customer?.full_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{customer?.phone ?? ''}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{formatPeso(order.total_amount)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground uppercase">
                        {order.logistics_company === 'lbc' ? 'Standard' : (order.logistics_company || 'Standard')}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
