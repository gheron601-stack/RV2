import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, ShieldCheck, Package, ShoppingBag, BarChart2, Settings, LogOut, Menu, User, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useAppData } from '../lib/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { profiles, orders } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingPayments = orders.filter((o) => o.status === 'pending_verification').length;
  const badges: Record<string, number> = {
    '/admin/orders': pendingPayments,
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="px-6 py-6 border-b border-white/5">
        <h1 className="font-display text-xl text-primary tracking-wide">RV VAPE SHOP</h1>
        <p className="text-[10px] font-sans font-medium text-muted-foreground uppercase tracking-widest mt-1">Admin Portal</p>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/admin/dashboard' ? location.pathname === '/admin/dashboard' : location.pathname.startsWith(to);
          const badge = badges[to];
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-sans font-medium rounded-md transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}>
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span className="bg-primary text-background text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-background rounded-md border border-white/5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.full_name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-white/5 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 border-r border-white/5 flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 border-b border-white/5 bg-card/90 backdrop-blur-md h-16 flex items-center px-4 gap-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-display text-lg text-primary tracking-wide">RV VAPE SHOP</span>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
