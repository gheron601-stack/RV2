import { Link } from 'react-router';
import {
  ShieldCheck,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useAppData } from '../../lib/AppContext';
import { OrderStatusBadge } from '../../components/StatusBadge';
import { formatPeso, formatDate, formatDateTime, calculateAge } from '../../lib/format';

export default function Dashboard() {
  const { profiles, orders, products } = useAppData();

  const pendingPayments = orders.filter((o) => o.status === 'pending_verification');
  const lowStockProducts = products.filter((p) => p.is_active && p.stock_qty > 0 && p.stock_qty <= 5);
  const outOfStock = products.filter((p) => p.is_active && p.stock_qty === 0);

  const today = new Date().toDateString();
  const todayRevenue = orders
    .filter(
      (o) =>
        ['processing', 'shipped', 'completed'].includes(o.status) &&
        new Date(o.created_at).toDateString() === today,
    )
    .reduce((s, o) => s + o.total_amount, 0);

  const totalRevenue = orders
    .filter((o) => ['processing', 'shipped', 'completed'].includes(o.status))
    .reduce((s, o) => s + o.total_amount, 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Alert queues */}
      {pendingPayments.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">

          {pendingPayments.length > 0 && (
            <Link
              to="/admin/orders"
              className="flex items-center gap-4 bg-blue-500/5 border border-blue-500/20 rounded p-4 hover:border-blue-500/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <ShoppingBag size={18} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {pendingPayments.length} Payment{pendingPayments.length !== 1 ? 's' : ''} to
                  Review
                </p>
                <p className="text-xs text-muted-foreground">Approve or reject payment proofs</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground group-hover:text-blue-400 transition-colors" />
            </Link>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Revenue",
            value: formatPeso(todayRevenue),
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Total Revenue',
            value: formatPeso(totalRevenue),
            icon: TrendingUp,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },

          {
            label: 'Low Stock',
            value: lowStockProducts.length + outOfStock.length,
            icon: AlertTriangle,
            color: lowStockProducts.length + outOfStock.length > 0 ? 'text-amber-500' : 'text-muted-foreground',
            bg: lowStockProducts.length + outOfStock.length > 0 ? 'bg-amber-500/10' : 'bg-secondary',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded p-4">
            <div className={`w-8 h-8 rounded ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <div className="text-xl font-semibold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">


        {/* Pending payments */}
        <div className="bg-card border border-border rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Pending Payments</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {pendingPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">All clear!</p>
          ) : (
            <div className="space-y-2">
              {pendingPayments.slice(0, 4).map((order) => {
                const customer = profiles.find((p) => p.id === order.customer_id);
                return (
                  <Link
                    key={order.id}
                    to={`/admin/orders/${order.id}`}
                    className="flex items-center gap-3 p-3 rounded border border-border hover:border-primary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <ShoppingBag size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-mono truncate">
                        {order.reference_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer?.full_name ?? 'Unknown'} · {formatPeso(order.total_amount)}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border rounded p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Reference', 'Customer', 'Amount', 'Delivery', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-widest pb-2 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const customer = profiles.find((p) => p.id === order.customer_id);
                return (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-2.5 pr-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {order.reference_code}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-foreground">{customer?.full_name ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-xs text-foreground">{formatPeso(order.total_amount)}</td>
                    <td className="py-2.5 pr-4 text-xs text-muted-foreground uppercase">
                      {order.logistics_company === 'lbc' ? 'Standard' : (order.logistics_company || 'Standard')}
                    </td>
                    <td className="py-2.5 pr-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">{formatDate(order.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low stock alert */}
      {(lowStockProducts.length > 0 || outOfStock.length > 0) && (
        <div className="bg-card border border-border rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              Stock Alerts
            </h2>
            <Link to="/admin/products" className="text-xs text-primary hover:underline">Manage</Link>
          </div>
          <div className="space-y-2">
            {[...outOfStock, ...lowStockProducts].map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-sm text-foreground">{p.name}</span>
                <span
                  className={`text-xs font-medium ${
                    p.stock_qty === 0 ? 'text-rose-400' : 'text-amber-500'
                  }`}
                >
                  {p.stock_qty === 0 ? 'Out of stock' : `${p.stock_qty} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
