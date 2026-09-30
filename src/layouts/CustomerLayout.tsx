import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { ShoppingCart, LogOut, Menu, X, Package, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/catalog', label: 'All Products' },
    { to: '/catalog?cat=device', label: 'Devices' },
    { to: '/catalog?cat=pod', label: 'Pods' },
    { to: '/catalog?cat=eliquid', label: 'E-Liquids' },
    { to: '/about', label: 'About Us' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/catalog" className="flex items-center gap-2 shrink-0 group">
            <span className="font-display text-xl text-foreground tracking-wide transition-colors group-hover:text-primary">
              RV VAPE SHOP
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className="text-sm font-sans font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                style={location.pathname === link.to.split('?')[0] ? { color: 'var(--color-primary)' } : {}}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/orders" className="hidden md:flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors" title="My Orders">
              <Package size={20} strokeWidth={1.5} />
            </Link>

            <Link to="/cart" className="relative flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-background text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
              <Link to="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group" title="My Profile & Customer Info">
                <User size={16} className="group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {user?.full_name}
                </span>
              </Link>
              <button onClick={handleLogout}
                className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-red-400 transition-colors" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>

            <button className="md:hidden flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/5 bg-card px-4 py-4 flex flex-col gap-4 shadow-xl">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className="text-base font-medium text-foreground py-2 hover:text-primary transition-colors border-b border-white/5"
                onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link to="/orders" className="text-base font-medium text-foreground py-2 hover:text-primary border-b border-white/5" onClick={() => setMenuOpen(false)}>
              My Orders
            </Link>
            <Link to="/profile" className="text-base font-medium text-foreground py-2 hover:text-primary border-b border-white/5" onClick={() => setMenuOpen(false)}>
              My Profile & Info
            </Link>
            <div className="pt-2 flex items-center justify-between">
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <User size={16} />
                <span className="text-sm">{user?.full_name}</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full flex flex-col flex-1"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-10 px-4 text-center mt-12 bg-card/50">
        <p className="text-xs font-sans text-muted-foreground/60 tracking-widest uppercase mb-2">
          RV VAPE SHOP &bull; 18+ ONLY &bull; MANILA, PH
        </p>
        <p className="text-[10px] text-muted-foreground/40 font-sans">
          Sale of vaping products to minors is strictly prohibited under Republic Act No. 11900.
        </p>
      </footer>
    </div>
  );
}
